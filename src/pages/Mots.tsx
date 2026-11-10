import { useEffect, useState } from 'react';
import type { Mot } from '../../server/src/types.ts';
import { api } from '../api.ts';

export default function Mots() {
  const [mots, setMots] = useState<Mot[] | null>(null);
  useEffect(() => { api.mots().then(setMots).catch(() => setMots([])); }, []);
  if (!mots) return <p className="text-stone-500">Chargement…</p>;
  if (mots.length === 0) return <p className="text-stone-500">Aucun mot envoyé vers Mnemo pour l'instant.</p>;
  const enAttente = mots.filter((m) => m.statut === 'attente').length;
  return (
    <main className="space-y-3">
      <p className="text-sm text-stone-500">
        {mots.length} mot{mots.length > 1 ? 's' : ''}{enAttente ? `, dont ${enAttente} en attente d'envoi` : ''}.
      </p>
      <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-stone-800 dark:bg-stone-900">
        {mots.map((m) => (
          <li key={m.id} className="flex items-baseline gap-3 p-4">
            <span className="flex-1">
              <span lang="en" className="font-medium">{m.texte}</span>
              {m.prononciation && <span className="ml-2 text-sm text-stone-500">{m.prononciation}</span>}
              <span className="block text-sm text-stone-600 dark:text-stone-400">{m.sens}</span>
            </span>
            <span className={`text-xs ${m.statut === 'envoye' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {m.statut === 'envoye' ? 'envoyé' : 'en attente'}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
