import { expect, test } from 'vitest';
import { localiser, reecrire } from '../src/ia/reecrire.ts';

const src = { titre: 'Arsenal beat Chelsea', texte: 'Arsenal beat Chelsea 2-0 on Sunday at the Emirates Stadium.' };
const repondre = (json: unknown) => async () => JSON.stringify(json);

const brut = {
  titre: 'Arsenal win',
  phrases: [{
    texte: 'The team scored two goals, and the fans scored tickets.',
    mots: [
      { texte: 'scored', base: 'score', sens: 'a marqué', transparent: false },
      { texte: 'scored', base: 'score', sens: 'ont obtenu', transparent: false },
      { texte: 'stadium', base: 'stadium', sens: 'stade', transparent: true },
    ],
    expressions: [],
  }],
};
const avecExpression = {
  titre: 'Quit',
  phrases: [{
    texte: 'He gave up the game.',
    mots: [{ texte: 'gave', base: 'give', sens: 'a donné', transparent: false }],
    expressions: [{ texte: 'gave up', base: 'give up', sens: 'a abandonné' }],
  }],
};

test('deux occurrences du même mot prennent deux positions différentes', async () => {
  const a = await reecrire(src, 'A2', repondre(brut));
  const [x, y] = a.phrases[0].annotations;
  expect([x.debut, x.fin]).toEqual([9, 15]);
  expect(y.debut).toBe(40);
  expect(y.sens).toBe('ont obtenu');
});

test('un mot absent de la phrase est ignoré', async () => {
  const a = await reecrire(src, 'A2', repondre(brut));
  expect(a.phrases[0].annotations.map((x) => x.base)).toEqual(['score', 'score']);
});

test("une expression masque les mots qu'elle contient", async () => {
  const a = await reecrire(src, 'A2', repondre(avecExpression));
  expect(a.phrases[0].annotations).toHaveLength(1);
  expect(a.phrases[0].annotations[0]).toMatchObject({ debut: 3, fin: 10, base: 'give up', expression: true, transparent: false });
});

test('la prononciation est celle du mot tel qu’écrit (scored, pas score), null pour une expression', async () => {
  expect((await reecrire(src, 'A2', repondre(brut))).phrases[0].annotations[0].prononciation).toBe('/skɔrd/');
  expect((await reecrire(src, 'A2', repondre(avecExpression))).phrases[0].annotations[0].prononciation).toBeNull();
});

test('mots compte tous les mots du texte réécrit', async () => {
  expect((await reecrire(src, 'A2', repondre(brut))).mots).toBe(10);
});

test('réponse non JSON ou sans phrases → rejet', async () => {
  await expect(reecrire(src, 'A2', async () => 'désolé')).rejects.toThrow();
  await expect(reecrire(src, 'A2', repondre({ titre: 'x', phrases: [] }))).rejects.toThrow();
});

test('la consigne transmet le palier et le texte source', async () => {
  let recu = '';
  await reecrire(src, 'B1+', async (_systeme, prompt) => { recu = prompt; return JSON.stringify(brut); });
  expect(recu).toContain('B1+');
  expect(recu).toContain(src.texte);
});

test("la consigne fait annoter modaux et prépositions, et n'exclut qu'une liste fermée de mots", async () => {
  let recu = '';
  await reecrire(src, 'A2', async (_systeme, prompt) => { recu = prompt; return JSON.stringify(brut); });
  for (const mot of ['must', 'might', 'would', 'over', 'yet']) expect(recu).toMatch(new RegExp(`\\b${mot}\\b`));
  expect(recu).toContain('a, an, the, and, or, but');
  expect(recu).not.toContain('mots-outils élémentaires');
});

test('localiser respecte les limites de mot', () => {
  expect(localiser('He is in the inn.', [{ texte: 'in' }])).toEqual([{ debut: 6, fin: 8 }]);
});

test('localiser ignore la casse et renvoie null pour un mot introuvable', () => {
  expect(localiser('Goals win games.', [{ texte: 'goals' }, { texte: 'stadium' }])).toEqual([{ debut: 0, fin: 5 }, null]);
});
