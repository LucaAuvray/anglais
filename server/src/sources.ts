import { execFile } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import Parser from 'rss-parser';
import { SUJETS, type Sujet } from './types.ts';

const parser = new Parser<object, { 'yt:videoId'?: string }>({ customFields: { item: ['yt:videoId'] } });
const NAVIGATEUR = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// Ce qu'un flux ne doit jamais faire télécharger : la machine, le réseau local, Tailscale (100.64.0.0/10).
const LOCALES = new BlockList();
for (const [reseau, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16]] as const) {
  LOCALES.addSubnet(reseau, bits, 'ipv4');
}
for (const [reseau, bits] of [['::', 127], ['fc00::', 7], ['fe80::', 10]] as const) LOCALES.addSubnet(reseau, bits, 'ipv6');

/** Adresse IP du site, après avoir vérifié qu'aucune de ses adresses n'est locale. */
async function adresseSure(u: URL): Promise<string> {
  const hote = u.hostname.replace(/^\[|\]$/g, '');
  const adresses = isIP(hote) ? [hote] : (await lookup(hote, { all: true })).map((a) => a.address);
  for (const a of adresses) {
    const v4 = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1]; // IPv4 écrite en IPv6
    if (v4 ? LOCALES.check(v4, 'ipv4') : LOCALES.check(a, isIP(a) === 6 ? 'ipv6' : 'ipv4')) throw new Error(`${u} : adresse locale refusée`);
  }
  return adresses[0];
}

const FIN = '__fin_curl__';

/** Une requête curl sans suivre les redirections, vers l'IP vérifiée (--resolve : pas de seconde résolution DNS). */
function curl(url: URL, ip: string): Promise<{ corps: string; code: number; suite: string }> {
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');
  return new Promise((resolve, reject) => {
    execFile('curl', ['-sS', '--compressed', '--max-time', '20', '--max-filesize', '10000000', '--proto', '=http,https',
      '--resolve', `${url.hostname}:${port}:${ip.includes(':') ? `[${ip}]` : ip}`, '-A', NAVIGATEUR,
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', '-H', 'Accept-Language: en-GB,en;q=0.9',
      '-w', `\n${FIN}%{http_code} %{redirect_url}`, '--', url.href], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    (erreur, sortie, stderr) => {
      if (erreur) return reject(new Error(`${url.href} : ${stderr.trim() || erreur.message}`));
      const i = sortie.lastIndexOf(`\n${FIN}`);
      const [code, suite = ''] = sortie.slice(i + FIN.length + 1).split(' ');
      resolve({ corps: sortie.slice(0, i), code: Number(code), suite });
    });
  });
}

/**
 * Télécharge une page ou un flux par curl ; rejette au bout de 20 s, sur un statut d'erreur ou une adresse locale.
 * curl et non fetch : Atlas Obscura et Smithsonian refusent (403) le client HTTP de Node, pas curl.
 * Les redirections sont suivies ici, chaque étape revérifiée : un flux ne peut pas mener au réseau local.
 */
export async function telecharger(url: string): Promise<string> {
  let courant = url;
  for (let sauts = 0; sauts <= 5; sauts++) {
    // Les adresses viennent des flux : seulement http(s), jamais file:// ni une option de curl.
    if (!/^https?:\/\//i.test(courant)) throw new Error(`${courant} : adresse refusée`);
    const u = new URL(courant);
    const r = await curl(u, await adresseSure(u));
    if (r.code >= 300 && r.code < 400 && r.suite) { courant = r.suite; continue; }
    if (r.code < 200 || r.code >= 400) throw new Error(`${courant} : HTTP ${r.code}`);
    return r.corps;
  }
  throw new Error(`${url} : trop de redirections`);
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
