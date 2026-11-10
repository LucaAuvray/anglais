import type { DatabaseSync } from 'node:sqlite';
import { beforeEach, expect, test } from 'vitest';
import { config } from '../src/config.ts';
import { ouvrir } from '../src/db.ts';
import { envoyerEnAttente, fabriquerCartes } from '../src/mnemo.ts';
import type { Mot } from '../src/types.ts';

const mot = {
  texte: 'scored', base: 'score', sens: 'a marqué', sujet: 'foot', expression: false,
  phrase: 'The team scored two goals in the second half.', prononciation: '/skɔr/',
} as Mot;

test('les deux cartes', () => {
  expect(fabriquerCartes(mot)).toEqual([
    { type: 'flashcard', tags: ['anglais', 'foot'],
      front: 'Que veut dire « scored » dans cette phrase ?\n\nThe team scored two goals in the second half.',
      back: 'a marqué — score /skɔr/' },
    { type: 'flashcard', tags: ['anglais', 'foot'],
      front: 'Complète :\n\nThe team ___ two goals in the second half.\n(a marqué)',
      back: 'scored' },
  ]);
});

test('sans prononciation, la réponse est « a marqué — score »', () => {
  expect(fabriquerCartes({ ...mot, prononciation: null })[0].back).toBe('a marqué — score');
});

test('une expression est remplacée en entier par ___', () => {
  const e = { ...mot, texte: 'gave up', base: 'give up', sens: 'a abandonné', expression: true, prononciation: null, phrase: 'He gave up the game.' };
  expect(fabriquerCartes(e)[1].front).toBe('Complète :\n\nHe ___ the game.\n(a abandonné)');
});

test('mot introuvable dans sa phrase → carte de production sans phrase à trous', () => {
  expect(fabriquerCartes({ ...mot, phrase: 'Nothing here.' })[1].front).toBe('Comment dit-on « a marqué » en anglais ?');
});

let db: DatabaseSync;
const reglage = (cle: string) => (db.prepare('SELECT valeur FROM reglages WHERE cle = ?').get(cle) as { valeur: string } | undefined)?.valeur;
const statut = () => (db.prepare('SELECT statut FROM mots').get() as { statut: string }).statut;
const erreurs = () => db.prepare('SELECT etape FROM erreurs').all();

beforeEach(() => {
  Object.assign(config, { mnemoUrl: 'http://mnemo.test', mnemoEmail: 'moi@exemple.test', mnemoPassword: 'secret' });
  db = ouvrir(':memory:');
  db.prepare("INSERT INTO mots (texte, base, sens, phrase, sujet, prononciation, expression, statut) VALUES ('scored', 'score', 'a marqué', ?, 'foot', '/skɔr/', 0, 'attente')")
    .run(mot.phrase);
});

/** Faux Mnemo qui suit le contrat lu dans son code. */
function fauxMnemo(o: { decks?: { id: number; name: string }[]; motDePasse?: boolean; expireUneFois?: boolean; manque?: number; injoignable?: boolean } = {}) {
  const appels: string[] = [];
  let lot: { deckId: number }[] = [];
  let expire = o.expireUneFois ?? false;
  const json = (status: number, corps: unknown) => new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });
  const requete = (async (url: string | URL | Request, init?: RequestInit) => {
    const chemin = new URL(String(url)).pathname;
    const corps = init?.body ? JSON.parse(String(init.body)) : undefined;
    appels.push(`${init?.method ?? 'GET'} ${chemin}`);
    if (o.injoignable) throw new TypeError('fetch failed');
    if (chemin === '/api/auth/login') return o.motDePasse === false ? json(401, { error: 'Email ou mot de passe incorrect' }) : json(200, { token: 'jeton', user: {} });
    if (expire) { expire = false; return json(401, { error: 'Invalid or expired token' }); }
    if (chemin === '/api/decks' && init?.method === 'POST') return json(201, { id: 7, name: corps.name });
    if (chemin === '/api/decks') return json(200, o.decks ?? []);
    if (chemin === '/api/cards/batch') { lot = corps.cards; return json(201, corps.cards.slice(0, corps.cards.length - (o.manque ?? 0))); }
    return json(404, {});
  }) as typeof fetch;
  return { requete, appels, lot: () => lot };
}

test("le deck « Anglais » est créé s'il manque, réutilisé sinon", async () => {
  const m = fauxMnemo();
  expect(await envoyerEnAttente(db, m.requete)).toEqual({ envoyes: 1, restants: 0 });
  expect(m.appels).toEqual(['POST /api/auth/login', 'GET /api/decks', 'POST /api/decks', 'POST /api/cards/batch']);
  expect(reglage('mnemoDeck')).toBe('7');
  expect(statut()).toBe('envoye');

  db = ouvrir(':memory:');
  db.prepare("INSERT INTO mots (texte, base, sens, phrase, sujet, prononciation, expression, statut) VALUES ('team', 'team', 'équipe', 'The team won.', 'foot', NULL, 0, 'attente')").run();
  const n = fauxMnemo({ decks: [{ id: 3, name: 'Maths' }, { id: 5, name: 'Anglais' }] });
  expect(await envoyerEnAttente(db, n.requete)).toEqual({ envoyes: 1, restants: 0 });
  expect(n.appels).not.toContain('POST /api/decks');
  expect(n.lot().map((c) => c.deckId)).toEqual([5, 5]);
});

test('deux envois simultanés : un seul deck créé, chaque carte envoyée une fois', async () => {
  const m = fauxMnemo();
  const resultats = await Promise.all([envoyerEnAttente(db, m.requete), envoyerEnAttente(db, m.requete)]);
  expect(resultats).toEqual([{ envoyes: 1, restants: 0 }, { envoyes: 0, restants: 0 }]);
  expect(m.appels.filter((a) => a === 'POST /api/decks')).toHaveLength(1);
  expect(m.appels.filter((a) => a === 'POST /api/cards/batch')).toHaveLength(1);
});

test('jeton expiré (401) → reconnexion puis envoi', async () => {
  db.prepare("INSERT INTO reglages (cle, valeur) VALUES ('mnemoJeton', 'vieux'), ('mnemoDeck', '7')").run();
  const m = fauxMnemo({ expireUneFois: true });
  expect(await envoyerEnAttente(db, m.requete)).toEqual({ envoyes: 1, restants: 0 });
  expect(m.appels).toEqual(['POST /api/cards/batch', 'POST /api/auth/login', 'POST /api/cards/batch']);
  expect(reglage('mnemoJeton')).toBe('jeton');
});

test('Mnemo injoignable → { envoyes: 0, restants: 1 }, le mot reste en attente', async () => {
  expect(await envoyerEnAttente(db, fauxMnemo({ injoignable: true }).requete)).toEqual({ envoyes: 0, restants: 1 });
  expect(statut()).toBe('attente');
  expect(erreurs()).toEqual([]);
});

test('mauvais mot de passe → aucun mot marqué envoyé, une ligne dans erreurs', async () => {
  expect(await envoyerEnAttente(db, fauxMnemo({ motDePasse: false }).requete)).toEqual({ envoyes: 0, restants: 1 });
  expect(statut()).toBe('attente');
  expect(erreurs()).toEqual([{ etape: 'mnemo' }]);
});

test("Mnemo renvoie moins de cartes que prévu → rien n'est marqué envoyé, le deck sera recherché à nouveau", async () => {
  expect(await envoyerEnAttente(db, fauxMnemo({ manque: 1 }).requete)).toEqual({ envoyes: 0, restants: 1 });
  expect(statut()).toBe('attente');
  expect(reglage('mnemoDeck')).toBeUndefined();
});
