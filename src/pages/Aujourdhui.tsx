import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, duree, ICONES, type Jour } from '../api.ts';

const minutes = (ms: number) => `${Math.max(1, Math.round(ms / 60_000))} min`;

export default function Aujourdhui() {
  const [jour, setJour] = useState<Jour | null>(null);
  const [erreur, setErreur] = useState('');
  const [lance, setLance] = useState(false);

  const charger = useCallback(() => {
    api.aujourdhui().then((j) => { setJour(j); setErreur(''); }).catch((e: Error) => setErreur(e.message));
  }, []);
  useEffect(charger, [charger]);

  // Tant qu'une préparation tourne, la liste se recharge toutes les 10 s.
  const enCours = lance || Boolean(jour?.preparationEnCours);
  useEffect(() => {
    if (!enCours) return;
    const t = setInterval(charger, 10_000);
    return () => clearInterval(t);
  }, [enCours, charger]);

  async function autres() {
    setLance(true);
    await api.preparer().catch(() => {}); // 409 : déjà en cours, l'attente s'affiche pareil
    // Le temps que le programme prenne son verrou, puis l'état vient du serveur.
    setTimeout(() => { setLance(false); charger(); }, 3000);
  }

  async function repondre(accepte: boolean) {
    await api.repondrePalier(accepte);
    charger();
  }

  if (erreur) return <p className="text-red-700 dark:text-red-400">Serveur injoignable : {erreur}</p>;
  if (!jour) return <p className="text-stone-500">Chargement…</p>;
  const { temps } = jour;

  return (
    <main className="space-y-6">
      <section aria-label="Temps passé" className="rounded-2xl bg-white p-4 shadow-sm dark:bg-stone-900">
        <div className="grid grid-cols-4 gap-y-1 text-sm">
          <span />
          <span className="text-stone-500">Aujourd'hui</span>
          <span className="text-stone-500">Semaine</span>
          <span className="text-stone-500">Total</span>
          <span className="font-medium">Écoute</span>
          <span>{duree(temps.jour.ecoute)}</span>
          <span>{duree(temps.semaine.ecoute)}</span>
          <span>{duree(temps.total.ecoute)}</span>
          <span className="font-medium">Lecture</span>
          <span>{duree(temps.jour.lecture)}</span>
          <span>{duree(temps.semaine.lecture)}</span>
          <span>{duree(temps.total.lecture)}</span>
        </div>
      </section>

      {jour.proposition && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
          <p>
            {jour.proposition === 'monter'
              ? 'Les derniers articles vous ont demandé peu de recherches. Passer au niveau suivant ?'
              : 'Les derniers articles vous ont demandé beaucoup de recherches. Revenir au niveau précédent ?'}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => repondre(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Oui</button>
            <button onClick={() => repondre(false)} className="rounded-lg px-4 py-2 text-indigo-700 dark:text-indigo-300">Non</button>
          </div>
        </section>
      )}

      <section aria-label="À lire et à écouter">
        {jour.articles.length === 0 && jour.videos.length === 0 && (
          <p className="py-6 text-center text-stone-500">Rien de prêt pour l'instant.</p>
        )}
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-stone-800 dark:bg-stone-900">
          {jour.articles.map((a) => (
            <li key={a.id}>
              <Link to={`/article/${a.id}`} className="flex items-center gap-3 p-4 hover:bg-stone-100 dark:hover:bg-stone-800">
                <span aria-hidden className="text-xl">{ICONES[a.sujet]}</span>
                <span className="flex-1">{a.titre}</span>
                <span className="whitespace-nowrap text-sm text-stone-500">{minutes(a.dureeMs)}</span>
              </Link>
            </li>
          ))}
          {jour.videos.map((v) => (
            <li key={`v${v.id}`}>
              <Link to={`/video/${v.id}`} className="flex items-center gap-3 p-4 hover:bg-stone-100 dark:hover:bg-stone-800">
                <span aria-hidden className="text-xl">▶️</span>
                <span className="flex-1">{v.titre}<span className="block text-sm text-stone-500">Vidéo · {v.chaine}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={autres} disabled={enCours}
        className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:opacity-60 dark:border-stone-700">
        {enCours ? 'Préparation en cours… (environ 7 min par article)' : 'Autres articles'}
      </button>
    </main>
  );
}
