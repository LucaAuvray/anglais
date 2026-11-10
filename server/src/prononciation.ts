import { dictionary } from 'cmu-pronouncing-dictionary';

// ARPAbet (dictionnaire américain CMU) → API. AH et ER changent de son sans accent.
const API: Record<string, string> = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ', EH: 'ɛ', ER: 'ɜr', EY: 'eɪ', IH: 'ɪ', IY: 'i',
  OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'u', B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h',
  JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't', TH: 'θ',
  V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};
const SANS_ACCENT: Record<string, string> = { AH0: 'ə', ER0: 'ər' };
const OCCLUSIVES_SOURDES = ['P', 'T', 'K'];
const OBSTRUANTES = ['P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'TH', 'DH', 'S', 'SH', 'Z', 'ZH', 'HH'];
const GLISSANTES = ['L', 'R', 'W', 'Y'];

const estVoyelle = (p: string) => /\d$/.test(p);
const voyelleAccentuee = (phones: string[]) => phones.filter(estVoyelle).findIndex((p) => p.endsWith('1'));

/** Les consonnes peuvent-elles commencer ensemble une syllabe ? */
function attaque(c: string[]): boolean {
  if (c.length === 1) return c[0] !== 'NG';
  if (c.length === 2) {
    return (OBSTRUANTES.includes(c[0]) && GLISSANTES.includes(c[1])) || (c[0] === 'S' && OCCLUSIVES_SOURDES.includes(c[1]));
  }
  return c.length === 3 && c[0] === 'S' && OCCLUSIVES_SOURDES.includes(c[1]) && GLISSANTES.includes(c[2]);
}

/** Prononciation américaine en API avec l'accent de mot, ou null si inconnue ou ambiguë. */
export function prononciation(mot: string): string | null {
  const cle = mot.trim().toLowerCase();
  if (!cle || /\s/.test(cle)) return null;
  const variantes: string[][] = [];
  for (let n = 1; ; n++) {
    const k = n === 1 ? cle : `${cle}(${n})`;
    if (!Object.hasOwn(dictionary, k)) break;
    const v = dictionary[k];
    variantes.push(v.split(' '));
  }
  if (variantes.length === 0) return null;
  const accent = voyelleAccentuee(variantes[0]);
  if (variantes.some((v) => voyelleAccentuee(v) !== accent)) return null;

  const phones = variantes[0];
  let marque = -1;
  if (accent >= 0 && phones.filter(estVoyelle).length > 1) {
    const v = phones.findIndex((p) => p.endsWith('1'));
    marque = v;
    while (marque > 0 && !estVoyelle(phones[marque - 1]) && attaque(phones.slice(marque - 1, v))) marque--;
    // En début de mot, les consonnes restantes appartiennent toutes à la première syllabe.
    if (phones.slice(0, marque).every((p) => !estVoyelle(p))) marque = 0;
  }
  const api = phones.map((p, i) => (i === marque ? 'ˈ' : '') + (SANS_ACCENT[p] ?? API[p.replace(/\d$/, '')]));
  return `/${api.join('')}/`;
}
