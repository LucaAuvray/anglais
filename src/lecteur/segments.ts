import type { Phrase } from '../../server/src/types.ts';

/** Découpe une phrase en segments touchables : texte libre (annotation null) ou mot annoté (son indice). */
export function segmenter(phrase: Phrase): { texte: string; annotation: number | null }[] {
  const segments: { texte: string; annotation: number | null }[] = [];
  let pos = 0;
  phrase.annotations.forEach((a, i) => {
    if (a.debut < pos) return; // chevauchement : le serveur l'évite, on ne casse pas le texte pour autant
    if (a.debut > pos) segments.push({ texte: phrase.texte.slice(pos, a.debut), annotation: null });
    segments.push({ texte: phrase.texte.slice(a.debut, a.fin), annotation: i });
    pos = a.fin;
  });
  if (pos < phrase.texte.length) segments.push({ texte: phrase.texte.slice(pos), annotation: null });
  return segments;
}
