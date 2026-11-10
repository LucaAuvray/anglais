import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import Parser from 'rss-parser';
import { SUJETS, type Sujet } from './types.ts';

// En-tête de navigateur générique : certains sites refusent les clients sans User-Agent.
const ENTETES = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' };
const parser = new Parser<object, { 'yt:videoId'?: string }>({ customFields: { item: ['yt:videoId'] } });

/** Télécharge une page ou un flux ; rejette au bout de 20 s ou sur un statut d'erreur. */
export async function telecharger(url: string): Promise<string> {
  const r = await fetch(url, { headers: ENTETES, signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`${url} : HTTP ${r.status}`);
  return r.text();
}

export async function lireFlux(url: string): Promise<{ titre: string; url: string; publieLe: string }[]> {
  const flux = await parser.parseString(await telecharger(url));
  return flux.items.flatMap((i) => (i.title && i.link ? [{ titre: i.title.trim(), url: i.link, publieLe: i.isoDate ?? '' }] : []));
}

export async function lireChaine(id: string): Promise<{ youtubeId: string; titre: string; publieLe: string }[]> {
  const flux = await parser.parseString(await telecharger(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`));
  return flux.items.flatMap((i) => {
    const youtubeId = i['yt:videoId'];
    // Les Shorts (vidéos verticales de moins d'une minute) ne servent pas l'écoute suivie.
    if (!youtubeId || !i.title || i.link?.includes('/shorts/')) return [];
    return [{ youtubeId, titre: i.title.trim(), publieLe: i.isoDate ?? '' }];
  });
}

const BLOCS = 'p, h2, h3, h4, li, blockquote';
const compterMots = (t: string) => t.split(/\s+/).filter(Boolean).length;

/** Texte de l'article (paragraphes séparés par une ligne vide), ou null s'il fait moins de 150 mots. */
export function extraireTexte(html: string): string | null {
  const { document } = parseHTML(html);
  const article = new Readability(document as unknown as Document).parse();
  if (!article?.content) return null;
  const { document: corps } = parseHTML(`<!doctype html><html><body>${article.content}</body></html>`);
  // Seuls les blocs les plus intérieurs : un <li> qui contient un <p> serait sinon lu deux fois.
  const blocs = [...corps.querySelectorAll(BLOCS)]
    .filter((e) => !e.querySelector(BLOCS))
    .map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const texte = blocs.length ? blocs.join('\n\n') : (article.textContent ?? '').trim();
  return compterMots(texte) < 150 ? null : texte;
}

const AUTRES = SUJETS.filter((s) => s !== 'foot');

/** La moitié (arrondie au-dessus) en foot, le reste pris à tour de rôle dans les autres sujets. */
export function choisirSujets(nombre: number, tour: number): Sujet[] {
  const foot = Math.ceil(nombre / 2);
  const reste = nombre - foot;
  return [
    ...Array<Sujet>(foot).fill('foot'),
    ...Array.from({ length: reste }, (_, i) => AUTRES[(tour * reste + i) % AUTRES.length]),
  ];
}
