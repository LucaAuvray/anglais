import { expect, test } from 'vitest';
import { prononciation } from '../src/prononciation.ts';

test.each([
  ['beautiful', '/ˈbjutəfəl/'], ['about', '/əˈbaʊt/'], ['score', '/skɔr/'],
  ['manager', '/ˈmænədʒər/'], ['Beautiful', '/ˈbjutəfəl/'],
])('%s → %s', (mot, attendu) => expect(prononciation(mot)).toBe(attendu));

test.each([
  ['mistake', '/mɪˈsteɪk/'],   // s + occlusive sourde forme une attaque
  ['computer', '/kəmˈpjutər/'], // m + p + j n'en forme pas une : la marque passe après m
  ['smoothly', '/ˈsmuðli/'],    // en début de mot, toutes les consonnes vont à la syllabe
])('découpage : %s → %s', (mot, attendu) => expect(prononciation(mot)).toBe(attendu));

test('mot absent du dictionnaire → null', () => expect(prononciation('xyzzyq')).toBeNull());
test('accentuation variable selon le sens → null', () => {
  expect(prononciation('record')).toBeNull();
  expect(prononciation('present')).toBeNull();
});
test('variantes de même accentuation → la première', () => expect(prononciation('either')).not.toBeNull());
test('plusieurs mots → null', () => expect(prononciation('give up')).toBeNull());
test('nom de propriété d’objet → null, sans planter', () => expect(prononciation('__proto__')).toBeNull());
