import { beforeEach, expect, test } from 'vitest';
import { Chrono } from './chrono.ts';

let envois: [string, number][];
let t: number;
let c: Chrono;
const tics = (n: number) => { for (let i = 0; i < n; i++) { t += 1000; c.tic(); } };
const total = (type: string) => envois.filter(([x]) => x === type).reduce((s, [, n]) => s + n, 0);

beforeEach(() => {
  envois = [];
  t = 0;
  c = new Chrono((type, secondes) => envois.push([type, secondes]), () => t);
});

test('audio en lecture → écoute, jamais lecture en même temps', () => {
  c.audio(true);
  tics(20);
  expect(envois).toEqual([['ecoute', 15]]);
  c.arreter();
  expect(total('ecoute')).toBe(20);
  expect(total('lecture')).toBe(0);
});

test("sans audio, la lecture compte, puis s'arrête après 60 s sans interaction", () => {
  tics(100);
  c.arreter();
  expect(total('lecture')).toBe(60);
  c.interaction();
  tics(10);
  c.arreter();
  expect(total('lecture')).toBe(70);
});

test('onglet caché → rien ne compte, même si audio(true) a été signalé', () => {
  c.visible(false);
  c.audio(true);
  tics(30);
  c.arreter();
  expect(envois).toEqual([]);
});

test("arreter envoie le reste non encore envoyé, et rien de plus à l'appel suivant", () => {
  tics(5);
  expect(envois).toEqual([]);
  c.arreter();
  expect(envois).toEqual([['lecture', 5]]);
  c.arreter();
  expect(envois).toEqual([['lecture', 5]]);
});

test('onglet caché → le reste part tout de suite (sur téléphone, la fermeture vient souvent ensuite sans prévenir)', () => {
  tics(5);
  c.visible(false);
  expect(envois).toEqual([['lecture', 5]]);
});

test('vidéo : sans lecture comptée, seul le temps de lecture de la vidéo compte', () => {
  c = new Chrono((type, secondes) => envois.push([type, secondes]), () => t, { lecture: false });
  tics(10);
  c.audio(true);
  tics(5);
  c.audio(false);
  tics(10);
  c.arreter();
  expect(envois).toEqual([['ecoute', 5]]);
});

test("la fin de l'audio relance le délai de lecture", () => {
  c.audio(true);
  tics(120);
  c.audio(false);
  tics(10);
  c.arreter();
  expect(total('lecture')).toBe(10);
});
