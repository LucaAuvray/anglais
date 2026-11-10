import { expect, test } from 'vitest';
import { jourCourant } from '../src/jour.ts';

test('jourCourant bascule à minuit à Paris, pas en UTC', () => {
  expect(jourCourant(new Date('2026-11-10T22:30:00Z'))).toBe('2026-11-10');
  expect(jourCourant(new Date('2026-11-10T23:30:00Z'))).toBe('2026-11-11');
});
