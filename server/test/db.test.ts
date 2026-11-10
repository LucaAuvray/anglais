import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { ouvrir } from '../src/db.ts';

const insertion = "INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe) VALUES ('u','s','foot','t','A2','af_heart','[]',0,0,'pret','2026-11-10T00:00:00Z')";

test('ouvrir crée les tables et les réglages initiaux', () => {
  const db = ouvrir(':memory:');
  expect(db.prepare("SELECT valeur FROM reglages WHERE cle='palier'").get()).toEqual({ valeur: 'A2' });
  const cles = db.prepare('SELECT cle FROM reglages ORDER BY cle').all().map((r) => r.cle);
  expect(cles).toEqual(['compteurArticles', 'palier', 'palierDepuis', 'tourSujets']);
  db.prepare(insertion).run();
  expect(() => db.prepare(insertion).run()).toThrow();
});

test('rouvrir une base existante garde ses réglages', () => {
  const fichier = path.join(mkdtempSync(path.join(tmpdir(), 'anglais-')), 'sous-dossier', 'anglais.db');
  const db = ouvrir(fichier);
  db.prepare("UPDATE reglages SET valeur='B1' WHERE cle='palier'").run();
  db.close();
  expect(ouvrir(fichier).prepare("SELECT valeur FROM reglages WHERE cle='palier'").get()).toEqual({ valeur: 'B1' });
});
