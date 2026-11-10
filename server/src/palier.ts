import { PALIERS, type Palier } from './types.ts';

/**
 * Proposition de changement de palier d'après les mots touchés sur les 5 derniers articles lus.
 * Moins de 2 % touchés (≈ 98 % connus, lecture autonome confortable) → monter ;
 * plus de 5 % (sous les ≈ 95 % visés pour la lecture assistée) → descendre.
 */
export function proposerPalier(lus: { mots: number; touches: number }[], palier: Palier): 'monter' | 'descendre' | null {
  if (lus.length < 5) return null;
  const derniers = lus.slice(0, 5);
  const taux = derniers.reduce((s, l) => s + l.touches, 0) / derniers.reduce((s, l) => s + l.mots, 0);
  const rang = PALIERS.indexOf(palier);
  if (taux < 0.02 && rang < PALIERS.length - 1) return 'monter';
  if (taux > 0.05 && rang > 0) return 'descendre';
  return null;
}
