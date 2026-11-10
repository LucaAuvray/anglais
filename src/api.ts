import type { Article, Mot, Palier, Video } from '../server/src/types.ts';

export type Resume = Pick<Article, 'id' | 'titre' | 'sujet' | 'palier' | 'dureeMs'>;
export type Temps = { ecoute: number; lecture: number };
export type Jour = {
  articles: Resume[];
  videos: Video[];
  temps: { jour: Temps; semaine: Temps; total: Temps };
  proposition: 'monter' | 'descendre' | null;
  preparationEnCours: boolean;
};
export type Erreur = { id: number; quand: string; etape: string; message: string };

async function appel<T>(chemin: string, methode = 'GET', corps?: unknown, keepalive = false): Promise<T> {
  const r = await fetch(`/api${chemin}`, {
    method: methode,
    headers: corps === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
    keepalive,
  });
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? `Erreur ${r.status}`);
  return r.json() as Promise<T>;
}

export const api = {
  aujourdhui: () => appel<Jour>('/aujourdhui'),
  article: (id: number) => appel<Article>(`/articles/${id}`),
  lu: (id: number, touches: number) => appel(`/articles/${id}/lu`, 'POST', { touches }),
  lus: () => appel<Resume[]>('/articles/lus'),
  ajouterMot: (articleId: number, phrase: number, annotation: number) => appel<{ mot: Mot }>('/mots', 'POST', { articleId, phrase, annotation }),
  mots: () => appel<Mot[]>('/mots'),
  // keepalive : l'envoi part même quand la page se ferme.
  temps: (type: 'ecoute' | 'lecture', secondes: number) => appel('/temps', 'POST', { type, secondes }, true),
  preparer: () => appel('/preparer', 'POST', {}),
  reglages: () => appel<{ palier: Palier; palierDepuis: string }>('/reglages'),
  changerPalier: (palier: Palier) => appel('/reglages', 'PUT', { palier }),
  repondrePalier: (accepte: boolean) => appel('/palier/reponse', 'POST', { accepte }),
  video: (id: number) => appel<Video>(`/videos/${id}`),
  vu: (id: number) => appel(`/videos/${id}/vu`, 'POST', {}),
  erreurs: () => appel<Erreur[]>('/erreurs'),
};

/** « 1 h 05 », « 12 min », « 0 min ». */
export function duree(secondes: number): string {
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
}

export const ICONES: Record<string, string> = {
  foot: '⚽', politique: '🗳️', ia: '🤖', histoires: '🔍', economie: '📈', developpement: '🧠', culture: '🎭',
};
