// Programme de préparation, lancé par le minuteur de nuit (`node src/preparer.ts`) ou par le serveur
// pour « Autres articles » (`node src/preparer.ts --ajouter 2`). Sortie 2 si une préparation tourne déjà.
import { readFileSync } from 'node:fs';
import { config } from './config.ts';
import { ouvrir } from './db.ts';
import { reecrire } from './ia/reecrire.ts';
import { envoyerEnAttente } from './mnemo.ts';
import { ajouter, completer, prendreVerrou, rendreVerrou, type SourcesJson } from './preparation.ts';
import { extraireTexte, lireChaine, lireFlux, telecharger } from './sources.ts';
import type { Voix } from './types.ts';
import { creerVoix } from './voix.ts';

if (!prendreVerrou(config.dataDir)) {
  console.error('Une préparation est déjà en cours.');
  process.exit(2);
}

// La voix (≈ 750 Mo) n'est chargée qu'au premier texte à dire : rien à préparer, rien de chargé.
let moteur: ReturnType<typeof creerVoix> | undefined;
const voix = {
  dire: async (texte: string, v: Voix, fichier: string) => (await (moteur ??= creerVoix())).dire(texte, v, fichier),
  fermer: async () => { if (moteur) await (await moteur).fermer(); },
};

try {
  const db = ouvrir(config.dbFile);
  const sources = JSON.parse(readFileSync(new URL('../sources.json', import.meta.url), 'utf8')) as SourcesJson;
  const deps = { lireFlux, lireChaine, telecharger, extraireTexte, reecrire, voix, sources, maintenant: () => new Date(), audioDir: config.audioDir };
  const debut = new Date().toISOString();
  const i = process.argv.indexOf('--ajouter');
  const n = i >= 0 ? await ajouter(db, deps, Number(process.argv[i + 1] ?? 2)) : await completer(db, deps);
  // Les mots restés en attente (Mnemo injoignable au moment du « + Mnemo ») repartent chaque nuit.
  const mnemo = await envoyerEnAttente(db);
  if (mnemo.envoyes || mnemo.restants) console.log(`Mnemo : ${mnemo.envoyes} mot(s) envoyé(s), ${mnemo.restants} en attente.`);
  for (const e of db.prepare('SELECT etape, message FROM erreurs WHERE quand >= ? ORDER BY id').all(debut)) {
    console.error(`[${e.etape}] ${e.message}`);
  }
  console.log(`${n} article(s) préparé(s).`);
} finally {
  await voix.fermer();
  rendreVerrou(config.dataDir);
}
