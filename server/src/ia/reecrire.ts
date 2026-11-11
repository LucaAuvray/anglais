import { z } from 'zod';
import { prononciation } from '../prononciation.ts';
import type { Annotation, Palier } from '../types.ts';
import { appelerClaude } from './claude.ts';

export type ArticleReecrit = {
  titre: string;
  phrases: { texte: string; annotations: Omit<Annotation, 'audio'>[] }[];
  mots: number;
};

const Reponse = z.object({
  titre: z.string().min(1),
  phrases: z.array(z.object({
    texte: z.string().min(1),
    mots: z.array(z.object({ texte: z.string().min(1), base: z.string().min(1), sens: z.string().min(1), transparent: z.boolean() })).default([]),
    expressions: z.array(z.object({ texte: z.string().min(1), base: z.string().min(1), sens: z.string().min(1) })).default([]),
  })).min(1),
});

const NIVEAUX: Record<Palier, string> = {
  'A2': "phrases courtes (8 à 12 mots), les 1 500 mots les plus fréquents de l'anglais, présent et prétérit, une idée par phrase",
  'A2+': "phrases de 15 mots au plus, les 2 500 mots les plus fréquents, liaisons simples (because, when, but)",
  'B1': "phrases jusqu'à 20 mots, les 3 500 mots les plus fréquents, present perfect et passif simple autorisés",
  'B1+': "phrases complexes modérées, les 5 000 mots les plus fréquents, verbes à particule courants",
  'B2': "style journalistique normal, vocabulaire courant de la presse, expressions idiomatiques fréquentes",
  'original': "garder les phrases et les mots d'origine ; si le texte dépasse 450 mots, couper des paragraphes entiers",
};

// Liste fermée : « mots-outils élémentaires » laissait Claude sauter modaux, over, yet… (retour de Luca, 11/11/2026).
const JAMAIS = ['a', 'an', 'the', 'and', 'or', 'but', 'I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'am', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'in', 'on', 'at', 'for', 'with',
  'this', 'that', 'not'];

const SYSTEME =
  "Tu réécris des articles de presse en anglais pour un apprenant francophone. Réponds uniquement par le JSON demandé, sans texte autour ni bloc de code.";

function consigne(source: { titre: string; texte: string }, palier: Palier): string {
  return `Réécris cet article au niveau ${palier} : ${NIVEAUX[palier]}.
Garde les faits de l'article, sans rien inventer. Longueur : 450 mots au plus${palier === 'original' ? '' : ', en anglais naturel'} ; un article court reste court, n'ajoute rien pour l'allonger.

Réponds par ce JSON :
{ "titre": "...", "phrases": [ { "texte": "une phrase", "mots": [ { "texte": "scored", "base": "score", "sens": "a marqué", "transparent": false } ], "expressions": [ { "texte": "gave up", "base": "give up", "sens": "a abandonné" } ] } ] }

Règles :
- Une entrée de "phrases" par phrase, dans l'ordre.
- "mots" : TOUS les mots de la phrase, y compris les modaux (must, might, would, could…), les prépositions et adverbes (over, yet, still, already, despite…), les connecteurs (although, whose…) et les nombres. Deux exceptions seulement : les noms propres (personnes, clubs, lieux, compétitions, marques) et ces mots, jamais annotés : ${JAMAIS.join(', ')}. "texte" tel qu'écrit dans la phrase ; "base" la forme de base (infinitif sans « to » pour un verbe, singulier pour un nom ; un participe employé comme adjectif reste tel quel : "injured") ; "sens" en français, le sens dans cette phrase ; "transparent" vrai si un francophone le comprend sans aide (cognat évident : "important", "football").
- "expressions" : verbes à particule, collocations et tournures figées de la phrase, chacune en un seul bloc de mots contigus, écrite exactement comme dans la phrase.
- Ne traduis jamais une phrase entière.

Titre d'origine : ${source.titre}

Article d'origine :
${source.texte}`;
}

/** Positions de chaque unité dans le texte : sans casse, sur des limites de mot, de gauche à droite, sans chevauchement. */
export function localiser(texte: string, unites: { texte: string }[]): ({ debut: number; fin: number } | null)[] {
  const prises: { debut: number; fin: number }[] = [];
  return unites.map((u) => {
    const motif = u.texte.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    if (!motif) return null;
    for (const m of texte.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${motif}(?![\\p{L}\\p{N}])`, 'giu'))) {
      const place = { debut: m.index, fin: m.index + m[0].length };
      if (prises.every((p) => place.fin <= p.debut || place.debut >= p.fin)) {
        prises.push(place);
        return place;
      }
    }
    return null;
  });
}

const compterMots = (t: string) => t.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu)?.length ?? 0;

export async function reecrire(
  source: { titre: string; texte: string },
  palier: Palier,
  appeler: typeof appelerClaude = appelerClaude,
): Promise<ArticleReecrit> {
  const brut = await appeler(SYSTEME, consigne(source, palier));
  let json: unknown;
  try { json = JSON.parse(brut); } catch { throw new Error(`Réponse de Claude illisible : ${brut.slice(0, 200)}`); }
  const r = Reponse.safeParse(json);
  if (!r.success) throw new Error(`Réponse de Claude incomplète : ${r.error.message.slice(0, 300)}`);

  const phrases = r.data.phrases.map((p) => {
    // Les expressions passent d'abord : elles prennent leurs mots avant les mots seuls.
    const unites = [
      ...p.expressions.map((e) => ({ ...e, transparent: false, expression: true })),
      ...p.mots.map((m) => ({ ...m, expression: false })),
    ];
    const annotations = localiser(p.texte, unites)
      .flatMap((pos, i) => {
        if (!pos) return [];
        const u = unites[i];
        const texte = p.texte.slice(pos.debut, pos.fin);
        return [{
          ...pos, texte, base: u.base, sens: u.sens,
          transparent: u.transparent, expression: u.expression,
          // Celle du mot tel qu'écrit : la fiche l'affiche à côté de « worst », pas de « bad ».
          prononciation: u.expression ? null : prononciation(texte),
        }];
      })
      .sort((a, b) => a.debut - b.debut);
    return { texte: p.texte, annotations };
  });
  return { titre: r.data.titre, phrases, mots: phrases.reduce((n, p) => n + compterMots(p.texte), 0) };
}
