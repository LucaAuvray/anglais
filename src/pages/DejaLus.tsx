import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, ICONES, type Resume } from '../api.ts';

export default function DejaLus() {
  const [lus, setLus] = useState<Resume[] | null>(null);
  useEffect(() => { api.lus().then(setLus).catch(() => setLus([])); }, []);
  if (!lus) return <p className="text-stone-500">Chargement…</p>;
  if (lus.length === 0) return <p className="text-stone-500">Aucun article lu pour l'instant.</p>;
  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-stone-800 dark:bg-stone-900">
      {lus.map((a) => (
        <li key={a.id}>
          <Link to={`/article/${a.id}`} className="flex items-center gap-3 p-4 hover:bg-stone-100 dark:hover:bg-stone-800">
            <span aria-hidden className="text-xl">{ICONES[a.sujet]}</span>
            <span className="flex-1">{a.titre}</span>
            <span className="text-sm text-stone-500">{a.palier}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
