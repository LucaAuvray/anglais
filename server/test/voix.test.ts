import { existsSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { config } from '../src/config.ts';
import { choisirVoix, creerVoix, fichierMot } from '../src/voix.ts';

test('un article sur quatre est britannique, les autres alternent', () => {
  expect([0, 1, 2, 3, 4, 5, 6, 7].map(choisirVoix)).toEqual(
    ['af_heart', 'am_michael', 'af_heart', 'bf_emma', 'af_heart', 'am_michael', 'af_heart', 'bf_emma']);
});

test('fichierMot est stable et distingue la voix', () => {
  expect(fichierMot('scored', 'af_heart')).toBe(fichierMot('scored', 'af_heart'));
  expect(fichierMot('scored', 'af_heart')).not.toBe(fichierMot('scored', 'bf_emma'));
  expect(fichierMot('scored', 'af_heart')).toMatch(/^mots\/af_heart-[0-9a-f]+\.mp3$/);
});

test.skipIf(!process.env.TEST_VOIX)('dire produit un mp3 dont la durée est plausible', async () => {
  const tmp = path.join(mkdtempSync(path.join(tmpdir(), 'voix-')), 'mots', 'essai.mp3');
  const v = await creerVoix();
  const ms = await v.dire('The team scored two goals.', 'af_heart', tmp);
  await v.fermer();
  // Le modèle est rangé avec les données, pas dans node_modules qu'un déploiement efface.
  expect(existsSync(path.join(config.dataDir, 'modeles', 'onnx-community', 'Kokoro-82M-v1.0-ONNX'))).toBe(true);
  expect(ms).toBeGreaterThan(1000);
  expect(ms).toBeLessThan(5000);
  expect(statSync(tmp).size).toBeGreaterThan(5000);
}, 300_000);
