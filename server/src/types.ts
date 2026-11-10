export const PALIERS = ['A2', 'A2+', 'B1', 'B1+', 'B2', 'original'] as const;
export type Palier = (typeof PALIERS)[number];
export const SUJETS = ['foot', 'politique', 'ia', 'histoires', 'economie', 'developpement', 'culture'] as const;
export type Sujet = (typeof SUJETS)[number];
export type Voix = 'af_heart' | 'am_michael' | 'bf_emma';

export interface Annotation {
  debut: number; fin: number;        // positions de caractères dans Phrase.texte, fin exclue
  texte: string;                     // tel qu'écrit dans la phrase
  base: string;                      // forme de base, sans « to » : « score »
  sens: string;                      // en français, dans cette phrase
  transparent: boolean;              // évident pour un francophone : pas de « + Mnemo »
  expression: boolean;               // plusieurs mots
  prononciation: string | null;      // « /ˈbjutəfəl/ », null si inconnue ou ambiguë
  audio: string | null;              // fichier du mot seul, relatif à DATA_DIR/audio
}
export interface Phrase { texte: string; audio: string; dureeMs: number; annotations: Annotation[] }
export interface Article {
  id: number; url: string; source: string; sujet: Sujet; titre: string; palier: Palier; voix: Voix;
  phrases: Phrase[]; mots: number; dureeMs: number;
  statut: 'pret' | 'lu' | 'archive'; creeLe: string; luLe: string | null; touches: number | null;
}
export interface Video { id: number; youtubeId: string; titre: string; chaine: string; publieLe: string; vuLe: string | null }
export interface Mot {
  id: number; texte: string; base: string; sens: string; phrase: string; sujet: Sujet;
  prononciation: string | null; expression: boolean; statut: 'attente' | 'envoye';
}
