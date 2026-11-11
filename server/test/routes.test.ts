import { mkdtempSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import express from 'express';
import { afterEach, beforeEach, expect, type Mock, test, vi } from 'vitest';
import { ouvrir } from '../src/db.ts';
import { jourCourant } from '../src/jour.ts';
import { prendreVerrou, rendreVerrou } from '../src/preparation.ts';
import { creerRoutes } from '../src/routes.ts';
import type { Phrase } from '../src/types.ts';

let db: DatabaseSync;
let serveur: Server;
let base: string;
let dataDir: string;
let envoyer: Mock<(db: DatabaseSync) => Promise<unknown>>;
let lancerPreparation: Mock<() => void>;

const phrases: Phrase[] = [{
  texte: 'The team scored in the stadium.', audio: 'articles/x/0.mp3', dureeMs: 2000,
  annotations: [
    { debut: 9, fin: 15, texte: 'scored', base: 'score', sens: 'a marqué', transparent: false, expression: false, prononciation: '/skɔrd/', audio: 'mots/a.mp3' },
    { debut: 23, fin: 30, texte: 'stadium', base: 'stadium', sens: 'stade', transparent: true, expression: false, prononciation: null, audio: 'mots/b.mp3' },
  ],
}];

function article(statut = 'pret', o: { luLe?: string; touches?: number; mots?: number; palier?: string } = {}): number {
  const r = db.prepare(`INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe, luLe, touches)
    VALUES (?, 'ex.test', 'foot', 'Titre', ?, 'af_heart', ?, ?, 2000, ?, ?, ?, ?)`)
    .run(`https://ex.test/${Math.random()}`, o.palier ?? 'A2', JSON.stringify(phrases), o.mots ?? 300, statut, new Date().toISOString(), o.luLe ?? null, o.touches ?? null);
  return Number(r.lastInsertRowid);
}

beforeEach(async () => {
  db = ouvrir(':memory:');
  dataDir = mkdtempSync(path.join(tmpdir(), 'routes-'));
  envoyer = vi.fn(async () => ({ envoyes: 0, restants: 0 }));
  lancerPreparation = vi.fn();
  const app = express();
  app.use(express.json());
  app.use('/api', creerRoutes(db, { envoyer, lancerPreparation, dataDir }));
  serveur = app.listen(0);
  await new Promise((r) => serveur.once('listening', r));
  base = `http://localhost:${(serveur.address() as AddressInfo).port}`;
});
afterEach(() => serveur.close());

const brut = (chemin: string, corps?: unknown, methode = 'POST') =>
  fetch(base + chemin, { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps ?? {}) });
const post = async (chemin: string, corps?: unknown) => (await brut(chemin, corps)).json();
const get = async (chemin: string) => (await fetch(base + chemin)).json();

test('GET /aujourdhui : au plus 4 articles prêts, vidéos du jour non vues, temps et état', async () => {
  for (let i = 0; i < 6; i++) article();
  article('lu');
  const jour = jourCourant();
  db.prepare("INSERT INTO videos (youtubeId, titre, chaine, publieLe, ajouteLe, vuLe) VALUES ('a', 'A', 'C', '', ?, NULL), ('b', 'B', 'C', '', ?, '2026-01-01'), ('c', 'C', 'C', '', '2020-01-01', NULL)").run(jour, jour);
  const r = await get('/api/aujourdhui');
  expect(r.articles).toHaveLength(4);
  expect(r.articles[0]).toEqual({ id: 1, titre: 'Titre', sujet: 'foot', palier: 'A2', dureeMs: 2000 });
  // Les 2 vidéos non vues les plus récentes : un jour où YouTube ne répond pas, celles de la veille restent.
  expect(r.videos.map((v: { youtubeId: string }) => v.youtubeId)).toEqual(['a', 'c']);
  expect(r.temps).toEqual({ jour: { ecoute: 0, lecture: 0 }, semaine: { ecoute: 0, lecture: 0 }, total: { ecoute: 0, lecture: 0 } });
  expect(r.proposition).toBeNull();
  expect(r.preparationEnCours).toBe(false);
});

test('GET /articles/:id renvoie l’article complet, 404 sinon', async () => {
  const id = article();
  expect((await get(`/api/articles/${id}`)).phrases[0].annotations).toHaveLength(2);
  expect((await fetch(`${base}/api/articles/999`)).status).toBe(404);
});

test('POST /articles/:id/lu puis GET /articles/lus, du plus récent au plus ancien', async () => {
  const a = article();
  const b = article();
  await post(`/api/articles/${a}/lu`, { touches: 3 });
  await post(`/api/articles/${b}/lu`, { touches: 1 });
  expect((await get(`/api/articles/${a}`))).toMatchObject({ statut: 'lu', touches: 3 });
  expect((await get('/api/articles/lus')).map((x: { id: number }) => x.id)).toEqual([b, a]);
});

test('POST /mots crée le mot en attente et lance l’envoi ; 400 pour un mot transparent', async () => {
  const id = article();
  const { mot } = await post('/api/mots', { articleId: id, phrase: 0, annotation: 0 });
  // La carte Mnemo écrit « a marqué — score /skɔr/ » : prononciation de la forme de base, pas du mot du texte.
  expect(mot).toMatchObject({ texte: 'scored', base: 'score', sens: 'a marqué', phrase: phrases[0].texte, sujet: 'foot', expression: false, statut: 'attente', prononciation: '/skɔr/' });
  expect(envoyer).toHaveBeenCalledTimes(1);
  expect((await brut('/api/mots', { articleId: id, phrase: 0, annotation: 1 })).status).toBe(400);
  expect((await get('/api/mots')).map((m: { base: string }) => m.base)).toEqual(['score']);
});

test('POST /mots deux fois pour le même mot → un seul mot', async () => {
  const id = article();
  const a = await post('/api/mots', { articleId: id, phrase: 0, annotation: 0 });
  const b = await post('/api/mots', { articleId: id, phrase: 0, annotation: 0 });
  expect(b.mot.id).toBe(a.mot.id);
  expect(await get('/api/mots')).toHaveLength(1);
});

test('POST /mots répond même si Mnemo est injoignable, le mot est en attente', async () => {
  envoyer.mockImplementation(() => new Promise(() => {})); // Mnemo ne répond jamais
  const r = await brut('/api/mots', { articleId: article(), phrase: 0, annotation: 0 });
  expect(r.status).toBe(200);
  expect((await r.json()).mot.statut).toBe('attente');
});

test('POST /temps plafonne à 60 s et refuse le négatif ou un type inconnu', async () => {
  await post('/api/temps', { type: 'ecoute', secondes: 3600 });
  await post('/api/temps', { type: 'lecture', secondes: 12 });
  const { temps } = await get('/api/aujourdhui');
  expect(temps.jour).toEqual({ ecoute: 60, lecture: 12 });
  expect(temps.semaine).toEqual({ ecoute: 60, lecture: 12 });
  expect(temps.total).toEqual({ ecoute: 60, lecture: 12 });
  expect((await brut('/api/temps', { type: 'ecoute', secondes: -5 })).status).toBe(400);
  expect((await brut('/api/temps', { type: 'sommeil', secondes: 5 })).status).toBe(400);
});

test('POST /preparer refuse quand 4 articles attendent déjà (liste pleine)', async () => {
  for (let i = 0; i < 4; i++) article();
  const r = await brut('/api/preparer');
  expect(r.status).toBe(409);
  expect((await r.json()).error).toContain('Liste pleine');
  expect(lancerPreparation).not.toHaveBeenCalled();
});

test("après un changement de niveau, seuls les articles du nouveau niveau comptent pour la proposition", async () => {
  for (let i = 0; i < 5; i++) article('lu', { luLe: new Date().toISOString(), touches: 1 });
  await post('/api/palier/reponse', { accepte: true }); // A2 → A2+
  const anciens = Array.from({ length: 5 }, () => article()); // préparés en A2 avant le changement
  for (const id of anciens) await post(`/api/articles/${id}/lu`, { touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBeNull();
  const nouveaux = Array.from({ length: 5 }, () => article('pret', { palier: 'A2+' }));
  for (const id of nouveaux) await post(`/api/articles/${id}/lu`, { touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBe('monter');
});

test('POST /preparer lance la préparation, 409 si une préparation tourne', async () => {
  expect((await brut('/api/preparer')).status).toBe(202);
  expect(lancerPreparation).toHaveBeenCalledTimes(1);
  prendreVerrou(dataDir);
  expect((await brut('/api/preparer')).status).toBe(409);
  expect((await get('/api/aujourdhui')).preparationEnCours).toBe(true);
  rendreVerrou(dataDir);
});

test('GET et PUT /reglages : changer de palier remet palierDepuis à maintenant, sans exposer le jeton Mnemo', async () => {
  db.prepare("INSERT INTO reglages (cle, valeur) VALUES ('mnemoJeton', 'secret')").run();
  const avant = await get('/api/reglages');
  expect(avant).toEqual({ palier: 'A2', palierDepuis: expect.any(String) });
  expect((await brut('/api/reglages', { palier: 'B1' }, 'PUT')).status).toBe(200);
  const apres = await get('/api/reglages');
  expect(apres.palier).toBe('B1');
  expect(apres.palierDepuis > avant.palierDepuis).toBe(true);
  expect((await brut('/api/reglages', { palier: 'C3' }, 'PUT')).status).toBe(400);
});

test('POST /palier/reponse accepte → le palier monte d’un cran', async () => {
  for (let i = 0; i < 5; i++) article('lu', { luLe: new Date().toISOString(), touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBe('monter');
  await post('/api/palier/reponse', { accepte: true });
  expect((await get('/api/reglages')).palier).toBe('A2+');
  expect((await get('/api/aujourdhui')).proposition).toBeNull();
});

test("la proposition disparaît après un refus et ne revient qu'après 5 nouveaux articles", async () => {
  for (let i = 0; i < 5; i++) article('lu', { luLe: new Date().toISOString(), touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBe('monter');
  await post('/api/palier/reponse', { accepte: false });
  expect((await get('/api/reglages')).palier).toBe('A2');
  expect((await get('/api/aujourdhui')).proposition).toBeNull();
  const ids = Array.from({ length: 5 }, () => article());
  for (const id of ids.slice(0, 4)) await post(`/api/articles/${id}/lu`, { touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBeNull();
  await post(`/api/articles/${ids[4]}/lu`, { touches: 1 });
  expect((await get('/api/aujourdhui')).proposition).toBe('monter');
});

test('POST /videos/:id/vu marque la vidéo vue', async () => {
  db.prepare("INSERT INTO videos (youtubeId, titre, chaine, publieLe, ajouteLe) VALUES ('a', 'A', 'C', '', ?)").run(jourCourant());
  await post('/api/videos/1/vu');
  expect((await get('/api/aujourdhui')).videos).toEqual([]);
});

test('GET /videos/:id renvoie la vidéo, même vue ; 404 sinon', async () => {
  db.prepare("INSERT INTO videos (youtubeId, titre, chaine, publieLe, ajouteLe, vuLe) VALUES ('abc', 'A', 'C', '', '2026-11-10', '2026-11-10')").run();
  expect(await get('/api/videos/1')).toMatchObject({ youtubeId: 'abc', titre: 'A' });
  expect((await fetch(`${base}/api/videos/9`)).status).toBe(404);
});

test('GET /erreurs : les 50 dernières, la plus récente d’abord', async () => {
  const noter = db.prepare("INSERT INTO erreurs (quand, etape, message) VALUES (?, 'flux', ?)");
  for (let i = 0; i < 60; i++) noter.run(new Date(Date.UTC(2026, 10, 1, 0, i)).toISOString(), `n${i}`);
  const e = await get('/api/erreurs');
  expect(e).toHaveLength(50);
  expect(e[0].message).toBe('n59');
});
