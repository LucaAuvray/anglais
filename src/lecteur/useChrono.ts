import { useEffect, useRef } from 'react';
import { api } from '../api.ts';
import { Chrono } from './chrono.ts';

/** Un Chrono pour la page : tic chaque seconde, touchers et défilements, onglet visible ou non, envoi à la sortie. */
export function useChrono(joue: boolean, lecture = true): void {
  const chrono = useRef<Chrono | null>(null);

  useEffect(() => {
    const c = new Chrono((type, secondes) => void api.temps(type, secondes).catch(() => {}), Date.now, { lecture });
    chrono.current = c;
    c.visible(document.visibilityState === 'visible');
    const interaction = () => c.interaction();
    const visibilite = () => c.visible(document.visibilityState === 'visible');
    const sortie = () => c.arreter();
    const t = setInterval(() => c.tic(), 1000);
    window.addEventListener('pointerdown', interaction);
    window.addEventListener('keydown', interaction);
    window.addEventListener('scroll', interaction, { passive: true });
    document.addEventListener('visibilitychange', visibilite);
    window.addEventListener('pagehide', sortie);
    return () => {
      clearInterval(t);
      window.removeEventListener('pointerdown', interaction);
      window.removeEventListener('keydown', interaction);
      window.removeEventListener('scroll', interaction);
      document.removeEventListener('visibilitychange', visibilite);
      window.removeEventListener('pagehide', sortie);
      c.arreter();
      chrono.current = null;
    };
  }, [lecture]);

  useEffect(() => { chrono.current?.audio(joue); }, [joue]);
}
