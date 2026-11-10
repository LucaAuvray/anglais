import { expect, test } from 'vitest';
import { proposerPalier } from '../src/palier.ts';

const a = (touches: number) => ({ mots: 300, touches });

test('moins de 5 articles → rien', () => expect(proposerPalier([a(0), a(0), a(0), a(0)], 'A2')).toBeNull());
test('moins de 2 % sur les 5 derniers → monter', () => expect(proposerPalier(Array(5).fill(a(5)), 'A2')).toBe('monter')); // 1,7 %
test('plus de 5 % → descendre', () => expect(proposerPalier(Array(5).fill(a(16)), 'B1')).toBe('descendre')); // 5,3 %
test('entre 2 et 5 % → rien', () => expect(proposerPalier(Array(5).fill(a(9)), 'B1')).toBeNull()); // 3 %
test('seuls les 5 plus récents comptent', () => expect(proposerPalier([...Array(5).fill(a(9)), a(90)], 'B1')).toBeNull());
test('pas de montée depuis original, pas de descente depuis A2', () => {
  expect(proposerPalier(Array(5).fill(a(0)), 'original')).toBeNull();
  expect(proposerPalier(Array(5).fill(a(90)), 'A2')).toBeNull();
});
