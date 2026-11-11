import { useEffect, useState } from 'react';
import { PALIERS, type Palier } from '../../server/src/types.ts';
import { api, type Erreur } from '../api.ts';

const NOMS: Record<Palier, string> = { 'A2': 'A2', 'A2+': 'A2+', 'B1': 'B1', 'B1+': 'B1+', 'B2': 'B2', 'original': "Article d'origine (non réécrit)" };

export default function Reglages() {
  const [palier, setPalier] = useState<Palier | null>(null);
  const [erreurs, setErreurs] = useState<Erreur[]>([]);
  const [alerte, setAlerte] = useState('');
  useEffect(() => {
    api.reglages().then((r) => setPalier(r.palier)).catch(() => {});
    api.erreurs().then(setErreurs).catch(() => {});
  }, []);

  async function changer(p: Palier) {
    const avant = palier;
    setPalier(p);
    setAlerte('');
    try {
      await api.changerPalier(p);
    } catch (e) {
      setPalier(avant); // la liste ne doit pas montrer un niveau que le serveur n'a pas enregistré
      setAlerte(`Niveau non changé : ${(e as Error).message}`);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-stone-900">
        <label className="block">
          <span className="font-medium">Niveau des prochains articles</span>
          <select value={palier ?? ''} onChange={(e) => changer(e.target.value as Palier)}
            className="mt-2 block w-full rounded-lg border border-stone-300 bg-transparent p-2 dark:border-stone-700">
            {PALIERS.map((p) => <option key={p} value={p}>{NOMS[p]}</option>)}
          </select>
        </label>
        <p className="mt-2 text-sm text-stone-500">Les articles déjà prêts gardent leur niveau.</p>
        {alerte && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">{alerte}</p>}
      </section>

      <section>
        <h2 className="mb-2 font-medium">Dernières erreurs</h2>
        {erreurs.length === 0 ? <p className="text-sm text-stone-500">Aucune.</p> : (
          <ul className="space-y-2 text-sm">
            {erreurs.map((e) => (
              <li key={e.id} className="rounded-lg bg-white p-3 shadow-sm dark:bg-stone-900">
                <span className="text-stone-500">{new Date(e.quand).toLocaleString('fr-FR')} · {e.etape}</span>
                <span className="block break-words">{e.message}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
