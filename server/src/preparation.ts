import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { PanneClaude } from './ia/claude.ts';
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

/** Prépare un article jusqu'au bout ou rien : 'panne' signale une voix ou un Claude inutilisables pour tous. */
async function preparerUn(db: DatabaseSync, deps: Deps, sujet: Sujet, palier: Palier, el: Element): Promise<'pret' | 'ecarte' | 'panne'> {
  let html: string;
  try { html = await deps.telecharger(el.url); } catch (e) { noter(db, deps, 'telechargement', `${el.url} : ${message(e)}`); return 'ecarte'; }
  const texte = deps.extraireTexte(html);
  if (!texte) return 'ecarte'; // mur payant, vidéo, page trop courte : sans appeler l'IA
  let r: ArticleReecrit;
  try {
    r = await deps.reecrire({ titre: el.titre, texte }, palier);
  } catch (e) {
    noter(db, deps, 'reecriture', `${el.url} : ${message(e)}`);
    return e instanceof PanneClaude ? 'panne' : 'ecarte';
  }

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
    return 'panne';
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
      if (r === 'panne') return prets; // la voix ou Claude ne marcheront pas mieux pour l'article suivant
      if (r === 'pret') { prets++; break; }
    }
  }
  return prets;
}

/** Au plus une vidéo nouvelle par chaîne et par jour, chaînes prises dans l'ordre de sources.json (les plus faciles d'abord). */
async function ajouterVideos(db: DatabaseSync, deps: Deps) {
  const jour = jourCourant(deps.maintenant());
  const duJour = db.prepare('SELECT chaine FROM videos WHERE ajouteLe = ?').all(jour).map((r) => r.chaine);
  let manque = VIDEOS_PAR_JOUR - duJour.length;
  const connue = db.prepare('SELECT 1 FROM videos WHERE youtubeId = ?');
  const inserer = db.prepare('INSERT OR IGNORE INTO videos (youtubeId, titre, chaine, publieLe, ajouteLe) VALUES (?, ?, ?, ?, ?)');
  for (const c of deps.sources.chaines) {
    if (manque <= 0) break;
    if (duJour.includes(c.nom)) continue;
    let videos: Awaited<ReturnType<typeof lireChaine>>;
    try { videos = await deps.lireChaine(c.id); } catch (e) { noter(db, deps, 'videos', `${c.nom} : ${message(e)}`); continue; }
    const v = videos.filter((x) => !connue.get(x.youtubeId)).sort((a, b) => b.publieLe.localeCompare(a.publieLe))[0];
    if (!v) continue;
    inserer.run(v.youtubeId, v.titre, c.nom, v.publieLe, jour);
    manque--;
  }
}

/** Archive les non-lus de plus de 7 jours et renvoie le nombre de non-lus restants. */
function archiverEtCompter(db: DatabaseSync, deps: Deps): number {
  const limite = new Date(deps.maintenant().getTime() - 7 * 86_400_000).toISOString();
  db.prepare("UPDATE articles SET statut = 'archive' WHERE statut = 'pret' AND creeLe < ?").run(limite);
  return (db.prepare("SELECT COUNT(*) AS n FROM articles WHERE statut = 'pret'").get() as { n: number }).n;
}

/** Préparation de nuit : vidéos du jour d'abord (elles ne dépendent pas de Claude), puis jusqu'à `cible` non-lus. */
export async function completer(db: DatabaseSync, deps: Deps, cible = 4): Promise<number> {
  const nonLus = archiverEtCompter(db, deps);
  await ajouterVideos(db, deps);
  return preparerArticles(db, deps, cible - nonLus);
}

/** « Autres articles » : jusqu'à `nombre` de plus, sans dépasser `cible` non-lus (la liste n'en montre pas davantage). */
export function ajouter(db: DatabaseSync, deps: Deps, nombre = 2, cible = 4): Promise<number> {
  return preparerArticles(db, deps, Math.min(nombre, cible - archiverEtCompter(db, deps)));
}

const verrou = (dataDir: string) => path.join(dataDir, 'preparation.lock');

function vivant(pid: number): boolean {
  // PID 0 (verrou vide) ou négatif viserait un groupe de processus : jamais un verrou valable.
  if (!Number.isInteger(pid) || pid <= 0) return false;
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
