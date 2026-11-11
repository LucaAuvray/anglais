import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { choisirSujets, extraireTexte, telecharger } from '../src/sources.ts';

const fixture = readFileSync(new URL('./fixtures/article.html', import.meta.url), 'utf8');

test('la moitié des articles est du foot, les autres sujets tournent', () => {
  expect(choisirSujets(4, 0)).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(choisirSujets(4, 1)).toEqual(['foot', 'foot', 'histoires', 'economie']);
  expect(choisirSujets(4, 3)).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(choisirSujets(2, 0)).toEqual(['foot', 'politique']);
  expect(choisirSujets(1, 0)).toEqual(['foot']);
});

test("extraireTexte garde le corps de l'article, sans menu ni pied de page", () => {
  const t = extraireTexte(fixture);
  expect(t).toContain('scored two goals');
  expect(t).not.toContain('Cookie settings');
  expect(t).not.toContain('Tennis');
});

test('extraireTexte sépare les paragraphes au lieu de les coller', () => {
  expect(extraireTexte(fixture)).toContain('this season.\n\nThe first goal');
});

test('telecharger refuse ce qui n’est pas http(s) : un flux ne peut pas faire lire un fichier local', async () => {
  await expect(telecharger('file:///etc/passwd')).rejects.toThrow('adresse refusée');
  await expect(telecharger('-o/tmp/x')).rejects.toThrow('adresse refusée');
});

test('telecharger refuse les adresses locales et Tailscale, même derrière un nom', async () => {
  for (const u of ['http://127.0.0.1/x', 'http://192.168.1.165/api', 'http://100.106.70.83/', 'http://[::1]/', 'http://localhost:3010/']) {
    await expect(telecharger(u), u).rejects.toThrow('adresse locale refusée');
  }
});

test('page presque vide → null', () => {
  expect(extraireTexte('<html><body><p>Subscribe to read.</p></body></html>')).toBeNull();
});
