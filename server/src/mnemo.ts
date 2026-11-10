import type { DatabaseSync } from 'node:sqlite';
import { config } from './config.ts';
import { localiser } from './ia/reecrire.ts';
import type { Mot } from './types.ts';

export type CarteMnemo = { type: 'flashcard'; front: string; back: string; tags: string[] };

const DECK = 'Anglais';

/** Deux cartes par mot : comprendre (anglais → français) puis produire (français → anglais, phrase à trous). */
export function fabriquerCartes(mot: Mot): [CarteMnemo, CarteMnemo] {
  const tags = ['anglais', mot.sujet];
  const [place] = localiser(mot.phrase, [{ texte: mot.texte }]);
  const production = place
    ? `Complète :\n\n${mot.phrase.slice(0, place.debut)}___${mot.phrase.slice(place.fin)}\n(${mot.sens})`
    : `Comment dit-on « ${mot.sens} » en anglais ?`;
  return [
    { type: 'flashcard', tags, front: `Que veut dire « ${mot.texte} » dans cette phrase ?\n\n${mot.phrase}`,
      back: [mot.sens, '—', mot.base, mot.prononciation].filter(Boolean).join(' ') },
    { type: 'flashcard', tags, front: production, back: mot.texte },
  ];
}

/** Refus à signaler dans les réglages (identifiants, réponse inattendue), par opposition à une panne passagère. */
class Refus extends Error {}
const passagere = (e: unknown) =>
  (e instanceof TypeError && e.message === 'fetch failed') || (e instanceof DOMException && e.name === 'TimeoutError');

// Un envoi à la fois : deux envois qui se chevauchent (double toucher, deux mots coup sur coup)
// enverraient les mêmes mots deux fois et créeraient deux decks « Anglais ».
let file: Promise<unknown> = Promise.resolve();

/** Envoie les mots en attente vers le deck « Anglais » de Mnemo. Ne lève jamais : ce qui échoue reste en attente. */
export function envoyerEnAttente(db: DatabaseSync, requete: typeof fetch = fetch): Promise<{ envoyes: number; restants: number }> {
  const resultat = file.then(() => envoyer(db, requete));
  file = resultat.catch(() => {});
  return resultat;
}

async function envoyer(db: DatabaseSync, requete: typeof fetch): Promise<{ envoyes: number; restants: number }> {
  const mots = (db.prepare("SELECT * FROM mots WHERE statut = 'attente' ORDER BY id").all() as unknown as (Omit<Mot, 'expression'> & { expression: number })[])
    .map((m): Mot => ({ ...m, expression: Boolean(m.expression) }));
  if (mots.length === 0) return { envoyes: 0, restants: 0 };
  const lire = (cle: string) => (db.prepare('SELECT valeur FROM reglages WHERE cle = ?').get(cle) as { valeur: string } | undefined)?.valeur;
  const garder = (cle: string, valeur: string) => db.prepare('INSERT OR REPLACE INTO reglages (cle, valeur) VALUES (?, ?)').run(cle, valeur);
  const noter = (texte: string) => db.prepare("INSERT INTO erreurs (quand, etape, message) VALUES (?, 'mnemo', ?)").run(new Date().toISOString(), texte);

  const http = (chemin: string, init: RequestInit) => requete(`${config.mnemoUrl}${chemin}`, { ...init, signal: AbortSignal.timeout(15_000) });
  async function connexion(): Promise<string> {
    const r = await http('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: config.mnemoEmail, password: config.mnemoPassword }),
    });
    if (!r.ok) throw new Refus(`Connexion à Mnemo refusée (HTTP ${r.status}) : vérifier MNEMO_EMAIL et MNEMO_PASSWORD.`);
    const { token } = (await r.json()) as { token: string };
    garder('mnemoJeton', token);
    return token;
  }
  async function appel(methode: string, chemin: string, corps?: unknown): Promise<unknown> {
    const envoyer = (jeton: string) => http(chemin, {
      method: methode,
      headers: { Authorization: `Bearer ${jeton}`, ...(corps ? { 'Content-Type': 'application/json' } : {}) },
      body: corps ? JSON.stringify(corps) : undefined,
    });
    let r = await envoyer(lire('mnemoJeton') ?? (await connexion()));
    if (r.status === 401) r = await envoyer(await connexion()); // jeton expiré (30 jours)
    if (!r.ok) throw new Refus(`Mnemo ${methode} ${chemin} : HTTP ${r.status}`);
    return r.json();
  }

  try {
    if (!config.mnemoUrl) throw new Refus("MNEMO_URL n'est pas renseigné.");
    let deck = lire('mnemoDeck');
    if (!deck) {
      const decks = (await appel('GET', '/api/decks')) as { id: number; name: string }[];
      const id = decks.find((d) => d.name === DECK)?.id
        ?? ((await appel('POST', '/api/decks', { name: DECK, description: 'Mots et expressions des lectures en anglais', tags: ['anglais'] })) as { id: number }).id;
      deck = String(id);
      garder('mnemoDeck', deck);
    }
    const cartes = mots.flatMap((m) => fabriquerCartes(m).map((c) => ({ deckId: Number(deck), ...c })));
    const crees = await appel('POST', '/api/cards/batch', { cards: cartes });
    if (!Array.isArray(crees) || crees.length !== cartes.length) {
      // Mnemo saute en silence les cartes d'un deck qui n'est plus à nous : il sera recherché au prochain envoi.
      db.prepare("DELETE FROM reglages WHERE cle = 'mnemoDeck'").run();
      noter(`Mnemo a créé ${Array.isArray(crees) ? crees.length : 0} cartes sur ${cartes.length} : le deck « ${DECK} » sera recherché à nouveau.`);
      return { envoyes: 0, restants: mots.length };
    }
    db.prepare(`UPDATE mots SET statut = 'envoye' WHERE id IN (${mots.map(() => '?').join(', ')})`).run(...mots.map((m) => m.id));
    return { envoyes: mots.length, restants: 0 };
  } catch (e) {
    if (!passagere(e)) noter(e instanceof Error ? e.message : String(e));
    return { envoyes: 0, restants: mots.length };
  }
}
