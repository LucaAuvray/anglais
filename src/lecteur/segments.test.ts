import { expect, test } from 'vitest';
import type { Phrase } from '../../server/src/types.ts';
import { segmenter } from './segments.ts';

test('segmenter alterne texte libre et annotations, sans rien perdre', () => {
  const p = { texte: 'The team scored two goals.', annotations: [{ debut: 9, fin: 15 }, { debut: 20, fin: 25 }] } as Phrase;
  expect(segmenter(p)).toEqual([
    { texte: 'The team ', annotation: null }, { texte: 'scored', annotation: 0 },
    { texte: ' two ', annotation: null }, { texte: 'goals', annotation: 1 }, { texte: '.', annotation: null }]);
});

test('annotation en tête ou en fin de phrase : pas de segment vide', () => {
  const p = { texte: 'Goals win', annotations: [{ debut: 0, fin: 5 }, { debut: 6, fin: 9 }] } as Phrase;
  expect(segmenter(p)).toEqual([{ texte: 'Goals', annotation: 0 }, { texte: ' ', annotation: null }, { texte: 'win', annotation: 1 }]);
});
