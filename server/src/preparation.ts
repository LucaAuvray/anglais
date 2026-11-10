import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { ArticleReecrit } from './ia/reecrire.ts';
import { jourCourant } from './jour.ts';
import { choisirSujets, type extraireTexte, type lireChaine, type lireFlux } from './sources.ts';
import type { Palier, Phrase, Sujet, Voix } from './types.ts';
import { choisirVoix, fichierMot } from './voix.ts';

export type SourcesJson = { flux: Partial<Record<Sujet, string[]>>; chaines: { id: string; nom: string }[] };
export type Deps = {
  lireFlux: typeof lireFlux;
  lireChaine: typeof lireChaine;
  telecharger(url: string): Promise<string>;
  extraireTexte: typeof extraireTexte;
  reecrire(source: { titre: string; texte: string }, palier: Palier): Promise<ArticleReecrit>;
  voix: { dire(texte: string, voix: Voix, fichier: string): Promise<number>; fermer(): Promise<void> };
  sources: SourcesJson;
  maintenant(): Date;
  audioDir: string;
};
type Element = { titre: string; url: string; publieLe: string };

const VIDEOS_PAR_JOUR = 2;
// Pages essayées au plus pour remplir une place : borne les appels quand tout échoue (quota, murs payants).
const ESSAIS_PAR_ARTICLE = 8;

const lire = (db: DatabaseSync, cle: string) => (db.prepare('SELECT valeur FROM reglages WHERE cle = ?').get(cle) as { valeur: string }).valeur;
const ecrire = (db: DatabaseSync, cle: string, valeur: string) => db.prepare('UPDATE reglages SET valeur = ? WHERE cle = ?').run(valeur, cle);
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

function noter(db: DatabaseSync, deps: Deps, etape: string, texte: string) {
  db.prepare('INSERT INTO erreurs (quand, etape, message) VALUES (?, ?, ?)').run(deps.maintenant().toISOString(), etape, texte);
}

/** Les éléments de tous les flux d'un sujet, du plus récent au plus ancien ; un flux en panne est noté et sauté. */
async function elements(db: DatabaseSync, deps: Deps, sujet: Sujet, cache: Map<string, Element[]>): Promise<Element[]> {
  const tous: Element[] = [];
  for (const url of deps.sources.flux[sujet] ?? []) {
    if (!cache.has(url)) {
      try { cache.set(url, await deps.lireFlux(url)); } catch (e) { noter(db, deps, 'flux', `${url} : ${message(e)}`); cache.set(url, []); }
    }
    tous.push(...cache.get(url)!);
  }
  return tous.sort((a, b) => b.publieLe.localeCompare(a.publieLe));
}

/** Prépare un article jusqu'au bout ou rien : 'voix' signale un moteur de voix en panne. */
async function preparerUn(db: DatabaseSync, deps: Deps, sujet: Sujet, palier: Palier, el: Element): Promise<'pret' | 'ecarte' | 'voix'> {
  let html: string;
  try { html = await deps.telecharger(el.url); } catch (e) { noter(db, deps, 'telechargement', `${el.url} : ${message(e)}`); return 'ecarte'; }
  const texte = deps.extraireTexte(html);
  if (!texte) return 'ecarte'; // mur payant, vidéo, page trop courte : sans appeler l'IA
  let r: ArticleReecrit;
  try { r = await deps.reecrire({ titre: el.titre, texte }, palier); } catch (e) { noter(db, deps, 'reecriture', `${el.url} : ${message(e)}`); return 'ecarte'; }

  const n = Number(lire(db, 'compteurArticles'));
  const voix = choisirVoix(n);
  const dossier = `articles/${randomUUID()}`;
  const phrases: Phrase[] = [];
  try {
    for (const [i, p] of r.phrases.entries()) {
      const audio = `${dossier}/${i}.mp3`;
      const dureeMs = await deps.voix.dire(p.texte, voix, path.join(deps.audioDir, audio));
      const annotations = [];
      for (const a of p.annotations) {
        const fichier = fichierMot(a.texte, voix);
        if (!existsSync(path.join(deps.audioDir, fichier))) await deps.voix.dire(a.texte, voix, path.join(deps.audioDir, fichier));
        annotations.push({ ...a, audio: fichier });
      }
      phrases.push({ texte: p.texte, audio, dureeMs, annotations });
    }
  } catch (e) {
    rmSync(path.join(deps.audioDir, dossier), { recursive: true, force: true });
    noter(db, deps, 'voix', `${el.url} : ${message(e)}`);
    return 'voix';
  }

  db.exec('BEGIN');
  try {
    db.prepare(`INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pret', ?)`).run(
      el.url, new URL(el.url).hostname.replace(/^www\./, ''), sujet, r.titre, palier, voix, JSON.stringify(phrases),
      r.mots, phrases.reduce((s, p) => s + p.dureeMs, 0), deps.maintenant().toISOString());
    ecrire(db, 'compteurArticles', String(n + 1));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return 'pret';
}

async function preparerArticles(db: DatabaseSync, deps: Deps, nombre: number): Promise<number> {
  if (nombre <= 0) return 0;
  const tour = Number(lire(db, 'tourSujets'));
  ecrire(db, 'tourSujets', String(tour + 1));
  const palier = lire(db, 'palier') as Palier;
  const cache = new Map<string, Element[]>();
  const essayees = new Set<string>();
  const connue = db.prepare('SELECT 1 FROM articles WHERE url = ?');
  let prets = 0;
  for (const sujet of choisirSujets(nombre, tour)) {
    let essais = 0;
    for (const el of await elements(db, deps, sujet, cache)) {
      if (essais >= ESSAIS_PAR_ARTICLE) break;
      if (essayees.has(el.url) || connue.get(el.url)) continue;
      essayees.add(el.url);
      essais++;
      const r = await preparerUn(db, deps, sujet, palier, el);
      if (r === 'voix') return prets; // la voix ne marchera pas mieux pour l'article suivant : on n'use pas l'IA
      if (r === 'pret') { prets++; break; }
    }
  }
  return prets;
}

async function ajouterVideos(db: DatabaseSync, deps: Deps) {
  const jour = jourCourant(deps.maintenant());
  const deja = (db.prepare('SELECT COUNT(*) AS n FROM videos WHERE ajouteLe = ?').get(jour) as { n: number }).n;
  if (deja >= VIDEOS_PAR_JOUR) return;
  const toutes: (Awaited<ReturnType<typeof lireChaine>>[number] & { chaine: string })[] = [];
  for (const c of deps.sources.chaines) {
    try { for (const v of await deps.lireChaine(c.id)) toutes.push({ ...v, chaine: c.nom }); } catch (e) { noter(db, deps, 'videos', `${c.nom} : ${message(e)}`); }
  }
  const connue = db.prepare('SELECT 1 FROM videos WHERE youtubeId = ?');
  const inserer = db.prepare('INSERT OR IGNORE INTO videos (youtubeId, titre, chaine, publieLe, ajouteLe) VALUES (?, ?, ?, ?, ?)');
  toutes
    .filter((v) => !connue.get(v.youtubeId))
    .sort((a, b) => b.publieLe.localeCompare(a.publieLe))
    .slice(0, VIDEOS_PAR_JOUR - deja)
    .forEach((v) => inserer.run(v.youtubeId, v.titre, v.chaine, v.publieLe, jour));
}

/** Archive les non-lus de plus de 7 jours, complète jusqu'à `cible` non-lus, ajoute les vidéos du jour. */
export async function completer(db: DatabaseSync, deps: Deps, cible = 4): Promise<number> {
  const limite = new Date(deps.maintenant().getTime() - 7 * 86_400_000).toISOString();
  db.prepare("UPDATE articles SET statut = 'archive' WHERE statut = 'pret' AND creeLe < ?").run(limite);
  const nonLus = (db.prepare("SELECT COUNT(*) AS n FROM articles WHERE statut = 'pret'").get() as { n: number }).n;
  const prets = await preparerArticles(db, deps, cible - nonLus);
  await ajouterVideos(db, deps);
  return prets;
}

/** « Autres articles » : `nombre` de plus, sans regarder la cible. */
export function ajouter(db: DatabaseSync, deps: Deps, nombre = 2): Promise<number> {
  return preparerArticles(db, deps, nombre);
}

const verrou = (dataDir: string) => path.join(dataDir, 'preparation.lock');

function vivant(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (e) { return (e as NodeJS.ErrnoException).code === 'EPERM'; }
}

export function preparationEnCours(dataDir: string): boolean {
  try { return vivant(Number(readFileSync(verrou(dataDir), 'utf8'))); } catch { return false; }
}

/** Prend le verrou (fichier contenant le PID) ; un verrou laissé par un processus mort est repris. */
export function prendreVerrou(dataDir: string): boolean {
  mkdirSync(dataDir, { recursive: true });
  try {
    writeFileSync(verrou(dataDir), String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    if (preparationEnCours(dataDir)) return false;
    writeFileSync(verrou(dataDir), String(process.pid));
    return true;
  }
}

export function rendreVerrou(dataDir: string): void {
  rmSync(verrou(dataDir), { force: true });
}
