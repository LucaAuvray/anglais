import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Article as ArticleT, Mot } from '../../server/src/types.ts';
import { api } from '../api.ts';
import Fiche from '../lecteur/Fiche.tsx';
import { segmenter } from '../lecteur/segments.ts';
import { useChrono } from '../lecteur/useChrono.ts';
import { useLecture, VITESSES } from '../lecteur/useLecture.ts';

export default function Article() {
  const id = Number(useParams().id);
  const [article, setArticle] = useState<ArticleT | null>(null);
  const [erreur, setErreur] = useState('');
  useEffect(() => { api.article(id).then(setArticle).catch((e: Error) => setErreur(e.message)); }, [id]);
  if (erreur) return <p className="text-red-700 dark:text-red-400">{erreur}</p>;
  if (!article) return <p className="text-stone-500">Chargement…</p>;
  return <Lecteur article={article} />;
}

function Lecteur({ article }: { article: ArticleT }) {
  const [statuts, setStatuts] = useState<Map<string, Mot['statut']>>(new Map());
  const [fiche, setFiche] = useState<{ phrase: number; annotation: number } | null>(null);
  const [fini, setFini] = useState(article.statut !== 'pret');
  const touches = useRef(new Set<string>());

  const chargerMots = useCallback(() => {
    api.mots().then((m) => setStatuts(new Map(m.map((x) => [x.base, x.statut])))).catch(() => {});
  }, []);
  useEffect(chargerMots, [chargerMots]);

  // Un article relu (« Déjà lus ») n'est pas recompté : ses touchers fausseraient la proposition de niveau.
  const terminer = useCallback(() => {
    if (fini) return;
    setFini(true);
    void api.lu(article.id, touches.current.size).catch(() => setFini(false));
  }, [fini, article.id]);

  const l = useLecture(article.phrases, terminer);
  useChrono(l.enLecture);

  function ouvrir(phrase: number, annotation: number) {
    l.pause();
    touches.current.add(`${phrase}-${annotation}`);
    setFiche({ phrase, annotation });
  }

  async function mnemo() {
    if (!fiche) return;
    const { mot } = await api.ajouterMot(article.id, fiche.phrase, fiche.annotation);
    setStatuts((s) => new Map(s).set(mot.base, mot.statut));
    setTimeout(chargerMots, 3000); // l'envoi vers Mnemo part en arrière-plan
  }

  const annotation = fiche && article.phrases[fiche.phrase].annotations[fiche.annotation];

  return (
    <main className="pb-28">
      <h1 lang="en" className="text-2xl font-semibold leading-tight">{article.titre}</h1>
      <p className="mt-1 text-sm text-stone-500">
        {article.source} · niveau {article.palier} ·{' '}
        <a href={article.url} target="_blank" rel="noreferrer" className="underline">Article d'origine</a>
      </p>

      <div lang="en" className="mt-6 text-xl leading-relaxed">
        {article.phrases.map((p, i) => (
          <span key={i} onClick={() => l.allerA(i)}
            className={`cursor-pointer rounded px-0.5 ${i === l.phraseCourante ? 'bg-amber-100 dark:bg-amber-900/50' : ''}`}>
            {segmenter(p).map((s, j) => s.annotation === null ? <span key={j}>{s.texte}</span> : (
              <span key={j} role="button" tabIndex={0}
                onClick={(e) => { e.stopPropagation(); ouvrir(i, s.annotation!); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); ouvrir(i, s.annotation!); } }}
                className={`hover:underline ${touches.current.has(`${i}-${s.annotation}`) ? 'underline decoration-dotted decoration-indigo-400' : ''}`}>
                {s.texte}
              </span>
            ))}{' '}
          </span>
        ))}
      </div>

      <div className="mt-8 text-center">
        {fini ? (
          <p className="text-stone-500">Article lu. <Link to="/" className="underline">Retour à la liste</Link></p>
        ) : (
          <button onClick={terminer} className="rounded-xl border border-stone-300 px-5 py-3 dark:border-stone-700">J'ai fini cet article</button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 px-4 py-3">
          <button onClick={l.precedente} aria-label="Phrase précédente" className="rounded-full p-3 text-xl">⏮</button>
          <button onClick={l.enLecture ? l.pause : l.jouer} aria-label={l.enLecture ? 'Pause' : 'Lecture'}
            className="rounded-full bg-indigo-600 px-5 py-3 text-xl text-white">{l.enLecture ? '⏸' : '▶'}</button>
          <button onClick={l.suivante} aria-label="Phrase suivante" className="rounded-full p-3 text-xl">⏭</button>
          <button onClick={l.rejouer} aria-label="Réécouter la phrase" className="rounded-full p-3 text-xl">↻</button>
          <select value={l.vitesse} onChange={(e) => l.setVitesse(Number(e.target.value))} aria-label="Vitesse"
            className="ml-2 rounded-lg border border-stone-300 bg-transparent p-2 text-sm dark:border-stone-700">
            {VITESSES.map((v) => <option key={v} value={v}>{String(v).replace('.', ',')}×</option>)}
          </select>
        </div>
      </div>

      {annotation && (
        <Fiche annotation={annotation} statut={statuts.get(annotation.base) ?? null} onMnemo={mnemo} onFermer={() => setFiche(null)} />
      )}
    </main>
  );
}
