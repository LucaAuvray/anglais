import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { jourCourant } from './jour.ts';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  sujet TEXT NOT NULL,
  titre TEXT NOT NULL,
  palier TEXT NOT NULL,
  voix TEXT NOT NULL,
  phrases TEXT NOT NULL,
  mots INTEGER NOT NULL,
  dureeMs INTEGER NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('pret', 'lu', 'archive')),
  creeLe TEXT NOT NULL,
  luLe TEXT,
  touches INTEGER
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY,
  youtubeId TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  chaine TEXT NOT NULL,
  publieLe TEXT NOT NULL,
  vuLe TEXT
);
CREATE TABLE IF NOT EXISTS mots (
  id INTEGER PRIMARY KEY,
  texte TEXT NOT NULL,
  base TEXT NOT NULL UNIQUE,
  sens TEXT NOT NULL,
  phrase TEXT NOT NULL,
  sujet TEXT NOT NULL,
  prononciation TEXT,
  expression INTEGER NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('attente', 'envoye'))
);
CREATE TABLE IF NOT EXISTS temps (
  jour TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ecoute', 'lecture')),
  secondes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, type)
);
CREATE TABLE IF NOT EXISTS reglages (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS erreurs (
  id INTEGER PRIMARY KEY,
  quand TEXT NOT NULL,
  etape TEXT NOT NULL,
  message TEXT NOT NULL
);
`;

/** Ouvre la base (la crée au besoin). `':memory:'` pour les tests. */
export function ouvrir(chemin: string): DatabaseSync {
  if (chemin !== ':memory:') mkdirSync(path.dirname(chemin), { recursive: true });
  const db = new DatabaseSync(chemin);
  // Le serveur et le programme de préparation écrivent dans la même base.
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  const initial = db.prepare('INSERT OR IGNORE INTO reglages (cle, valeur) VALUES (?, ?)');
  for (const [cle, valeur] of [['palier', 'A2'], ['palierDepuis', jourCourant()], ['compteurArticles', '0'], ['tourSujets', '0']]) {
    initial.run(cle, valeur);
  }
  return db;
}
