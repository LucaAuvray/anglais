import { useEffect } from 'react';
import type { Annotation, Mot } from '../../server/src/types.ts';

type Props = {
  annotation: Annotation;
  statut: Mot['statut'] | null;
  onMnemo: () => void;
  onFermer: () => void;
};

/** Fiche d'un mot ou d'une expression : sens dans la phrase, forme de base, prononciation, écoute, + Mnemo. */
export default function Fiche({ annotation: a, statut, onMnemo, onFermer }: Props) {
  useEffect(() => {
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [onFermer]);

  const ecouter = () => { if (a.audio) void new Audio(`/audio/${a.audio}`).play().catch(() => {}); };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/30 sm:items-center" onClick={onFermer}>
      <div role="dialog" aria-label={`Fiche de « ${a.texte} »`} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl dark:bg-stone-900">
        <div className="flex items-start gap-3">
          <p className="flex-1">
            <span lang="en" className="text-2xl font-semibold">{a.texte}</span>
            {a.prononciation && <span className="ml-2 text-stone-500">{a.prononciation}</span>}
          </p>
          <button onClick={onFermer} aria-label="Fermer" className="rounded-full px-2 text-2xl leading-none text-stone-500">×</button>
        </div>
        <p className="mt-2 text-lg">{a.sens}</p>
        {a.base.toLowerCase() !== a.texte.toLowerCase() && (
          <p className="mt-1 text-sm text-stone-500">Forme de base : <span lang="en">{a.base}</span></p>
        )}
        <div className="mt-4 flex gap-2">
          {a.audio && (
            <button onClick={ecouter} className="rounded-lg border border-stone-300 px-4 py-2 dark:border-stone-700">🔊 Écouter</button>
          )}
          {!a.transparent && (
            statut ? (
              <span className="px-4 py-2 text-sm text-stone-500">{statut === 'envoye' ? 'Envoyé vers Mnemo' : 'En attente d’envoi'}</span>
            ) : (
              <button onClick={onMnemo} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">+ Mnemo</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
