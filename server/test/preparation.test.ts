import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { beforeEach, expect, test, vi } from 'vitest';
import { ouvrir } from '../src/db.ts';
import { PanneClaude } from '../src/ia/claude.ts';
import type { ArticleReecrit } from '../src/ia/reecrire.ts';
import { ajouter, completer, type Deps, prendreVerrou, preparationEnCours, rendreVerrou } from '../src/preparation.ts';
import { SUJETS, type Phrase } from '../src/types.ts';

let db: DatabaseSync;
let deps: Deps;
let audioDir: string;

const reecrit = (titre: string): ArticleReecrit => ({
  titre,
  phrases: [
    { texte: 'The team scored.', annotations: [{ debut: 9, fin: 15, texte: 'scored', base: 'score', sens: 'a marqué', transparent: false, expression: false, prononciation: '/skɔr/' }] },
    { texte: 'Fans gave up.', annotations: [{ debut: 5, fin: 12, texte: 'gave up', base: 'give up', sens: 'ont abandonné', transparent: false, expression: true, prononciation: null }] },
  ],
  mots: 6,
});

beforeEach(() => {
  db = ouvrir(':memory:');
  audioDir = path.join(mkdtempSync(path.join(tmpdir(), 'prep-')), 'audio');
  deps = {
    sources: {
      flux: Object.fromEntries(SUJETS.map((s) => [s, [s]])) as Deps['sources']['flux'],
      chaines: [{ id: 'c1', nom: 'Chaîne 1' }, { id: 'c2', nom: 'Chaîne 2' }],
    },
    lireFlux: vi.fn(async (flux: string) => Array.from({ length: 10 }, (_, i) => ({ titre: `${flux} ${i}`, url: `https://ex.test/${flux}/${i}`, publieLe: '2026-11-10T00:00:00Z' }))),
    lireChaine: vi.fn(async (id: string) => [
      { youtubeId: `${id}-a`, titre: 'A', publieLe: '2026-11-09T00:00:00Z' },
      { youtubeId: `${id}-b`, titre: 'B', publieLe: '2026-11-08T00:00:00Z' },
    ]),
    telecharger: vi.fn(async (url: string) => `<html>${url}</html>`),
    extraireTexte: vi.fn(() => 'word '.repeat(200)),
    reecrire: vi.fn(async (source: { titre: string }) => reecrit(source.titre)),
    voix: {
      dire: vi.fn(async (_texte: string, _voix: string, fichier: string) => {
        mkdirSync(path.dirname(fichier), { recursive: true });
        writeFileSync(fichier, 'mp3');
        return 1000;
      }),
      fermer: vi.fn(async () => {}),
    },
    maintenant: () => new Date('2026-11-10T03:00:00Z'),
    audioDir,
  };
});

const reglage = (cle: string) => (db.prepare('SELECT valeur FROM reglages WHERE cle = ?').get(cle) as { valeur: string }).valeur;
const sujetsPrets = () => db.prepare("SELECT sujet FROM articles WHERE statut = 'pret' ORDER BY id").all().map((r) => r.sujet);
const inserer = (url: string, statut = 'pret', creeLe = '2026-11-09T03:00:00Z') =>
  db.prepare("INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe) VALUES (?, 'ex.test', 'foot', 't', 'A2', 'af_heart', '[]', 0, 0, ?, ?)").run(url, statut, creeLe);

test('base vide → 4 articles prêts dont 2 de foot, compteur avancé', async () => {
  expect(await completer(db, deps)).toBe(4);
  expect(sujetsPrets()).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(reglage('compteurArticles')).toBe('4');
  expect(db.prepare('SELECT voix FROM articles ORDER BY id').all().map((r) => r.voix)).toEqual(['af_heart', 'am_michael', 'af_heart', 'bf_emma']);
});

test("3 non lus → 1 seul préparé ; 4 non lus → aucun appel à l'IA", async () => {
  for (const u of ['a', 'b', 'c']) inserer(`https://autre.test/${u}`);
  expect(await completer(db, deps)).toBe(1);
  expect(await completer(db, deps)).toBe(0);
  expect(deps.reecrire).toHaveBeenCalledTimes(1);
});

test('un non-lu de 8 jours est archivé et remplacé', async () => {
  inserer('https://autre.test/vieux', 'pret', '2026-11-02T03:00:00Z');
  for (const u of ['a', 'b', 'c']) inserer(`https://autre.test/${u}`);
  expect(await completer(db, deps)).toBe(1);
  expect(db.prepare('SELECT statut FROM articles WHERE url = ?').get('https://autre.test/vieux')).toEqual({ statut: 'archive' });
});

test("une URL déjà connue n'est jamais repréparée", async () => {
  inserer('https://ex.test/foot/0', 'lu');
  await completer(db, deps);
  const titres = vi.mocked(deps.reecrire).mock.calls.map(([s]) => s.titre);
  expect(titres).not.toContain('foot 0');
  expect(titres).toContain('foot 1');
});

test("texte introuvable → entrée sautée sans appeler l'IA", async () => {
  deps.extraireTexte = vi.fn(() => null);
  expect(await completer(db, deps)).toBe(0);
  expect(deps.reecrire).not.toHaveBeenCalled();
});

test("l'IA échoue sur un article → erreur enregistrée, article suivant essayé", async () => {
  vi.mocked(deps.reecrire).mockRejectedValueOnce(new Error('Quota atteint'));
  expect(await completer(db, deps)).toBe(4);
  expect(db.prepare('SELECT etape, message FROM erreurs').all()).toEqual([{ etape: 'reecriture', message: 'https://ex.test/foot/0 : Quota atteint' }]);
});

test('la voix échoue → aucun article à moitié enregistré, préparation arrêtée', async () => {
  vi.mocked(deps.voix.dire).mockRejectedValue(new Error('ffmpeg introuvable'));
  expect(await completer(db, deps)).toBe(0);
  expect(db.prepare('SELECT COUNT(*) AS n FROM articles').get()).toEqual({ n: 0 });
  expect(deps.reecrire).toHaveBeenCalledTimes(1);
  expect(db.prepare('SELECT etape FROM erreurs').all()).toEqual([{ etape: 'voix' }]);
  const dossier = path.join(audioDir, 'articles');
  expect(existsSync(dossier) ? readdirSync(dossier) : []).toEqual([]);
});

test("chaque phrase et chaque annotation a son fichier audio ; un mot déjà généré n'est pas refait", async () => {
  await completer(db, deps);
  for (const { phrases } of db.prepare('SELECT phrases FROM articles').all() as { phrases: string }[]) {
    for (const p of JSON.parse(phrases) as Phrase[]) {
      expect(existsSync(path.join(audioDir, p.audio))).toBe(true);
      for (const a of p.annotations) expect(existsSync(path.join(audioDir, a.audio!))).toBe(true);
    }
  }
  // 4 articles, 3 voix différentes : « scored » n'est généré qu'une fois par voix.
  expect(vi.mocked(deps.voix.dire).mock.calls.filter(([t]) => t === 'scored')).toHaveLength(3);
});

test('le tour des sujets avance à chaque préparation', async () => {
  await completer(db, deps);
  expect(reglage('tourSujets')).toBe('1');
});

test('ajouter prépare jusqu’à 2 articles sans dépasser 4 non lus (sinon ils resteraient cachés)', async () => {
  expect(await ajouter(db, deps)).toBe(2);
  inserer('https://autre.test/a');
  expect(await ajouter(db, deps)).toBe(1);
  expect(sujetsPrets()).toHaveLength(4);
  expect(await ajouter(db, deps)).toBe(0);
  expect(deps.reecrire).toHaveBeenCalledTimes(3);
});

test("Claude en panne (quota, CLI absente) → préparation arrêtée au premier échec, vidéos quand même ajoutées", async () => {
  vi.mocked(deps.reecrire).mockRejectedValue(new PanneClaude("Quota de l'abonnement Claude atteint."));
  expect(await completer(db, deps)).toBe(0);
  expect(deps.reecrire).toHaveBeenCalledTimes(1);
  expect(db.prepare('SELECT COUNT(*) AS n FROM videos').get()).toEqual({ n: 2 });
});

test('au plus 2 vidéos nouvelles par jour, jamais deux fois la même', async () => {
  const videos = () => db.prepare('SELECT youtubeId FROM videos ORDER BY id').all().map((r) => r.youtubeId);
  await completer(db, deps);
  await completer(db, deps);
  expect(videos()).toEqual(['c1-a', 'c2-a']);
  deps.maintenant = () => new Date('2026-11-11T03:00:00Z');
  await completer(db, deps);
  deps.maintenant = () => new Date('2026-11-12T03:00:00Z');
  await completer(db, deps);
  expect(videos()).toEqual(['c1-a', 'c2-a', 'c1-b', 'c2-b']);
});

test("une vidéo par chaîne et par jour, dans l'ordre de sources.json, même si une chaîne suivante est plus récente", async () => {
  deps.sources.chaines.push({ id: 'c3', nom: 'Chaîne 3' });
  vi.mocked(deps.lireChaine).mockImplementation(async (id: string) => [
    { youtubeId: `${id}-a`, titre: 'A', publieLe: id === 'c3' ? '2026-11-10T00:00:00Z' : '2026-11-01T00:00:00Z' },
    { youtubeId: `${id}-b`, titre: 'B', publieLe: '2026-10-01T00:00:00Z' },
  ]);
  await completer(db, deps);
  expect(db.prepare('SELECT youtubeId, chaine FROM videos ORDER BY id').all()).toEqual([
    { youtubeId: 'c1-a', chaine: 'Chaîne 1' }, { youtubeId: 'c2-a', chaine: 'Chaîne 2' }]);
});

test('verrou : le second est refusé ; un verrou dont le processus est mort est repris', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'verrou-'));
  expect(preparationEnCours(dir)).toBe(false);
  expect(prendreVerrou(dir)).toBe(true);
  expect(preparationEnCours(dir)).toBe(true);
  expect(prendreVerrou(dir)).toBe(false);
  writeFileSync(path.join(dir, 'preparation.lock'), '999999');
  expect(preparationEnCours(dir)).toBe(false);
  expect(prendreVerrou(dir)).toBe(true);
  // Un verrou vide donnerait le PID 0, que kill(0, 0) dit « vivant » : bloqué pour toujours.
  writeFileSync(path.join(dir, 'preparation.lock'), '');
  expect(preparationEnCours(dir)).toBe(false);
  expect(prendreVerrou(dir)).toBe(true);
  rendreVerrou(dir);
  expect(preparationEnCours(dir)).toBe(false);
});
