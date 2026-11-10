import { useCallback, useEffect, useRef, useState } from 'react';
import type { Phrase } from '../../server/src/types.ts';

export const VITESSES = [0.8, 0.9, 1] as const;

/** Un seul élément <audio> qui enchaîne les phrases ; `enLecture` suit ce que fait vraiment l'élément. */
export function useLecture(phrases: Phrase[], onFin: () => void) {
  const audio = useRef<HTMLAudioElement | null>(null);
  audio.current ??= new Audio();
  const index = useRef(0);
  const vitesseRef = useRef<number>(1);
  const finRef = useRef(onFin);
  const [phraseCourante, setPhraseCourante] = useState(0);
  const [enLecture, setEnLecture] = useState(false);
  const [vitesse, setVitesseEtat] = useState<number>(1);

  useEffect(() => { finRef.current = onFin; }, [onFin]);

  const allerA = useCallback((n: number) => {
    const a = audio.current!;
    if (n < 0 || n >= phrases.length) return;
    index.current = n;
    setPhraseCourante(n);
    a.src = `/audio/${phrases[n].audio}`;
    // Changer de source remet la vitesse à defaultPlaybackRate : on règle les deux.
    a.defaultPlaybackRate = vitesseRef.current;
    a.playbackRate = vitesseRef.current;
    void a.play().catch(() => setEnLecture(false));
  }, [phrases]);

  useEffect(() => {
    const a = audio.current!;
    const joue = () => setEnLecture(true);
    const arret = () => setEnLecture(false);
    const fin = () => {
      setEnLecture(false);
      if (index.current < phrases.length - 1) allerA(index.current + 1);
      else finRef.current();
    };
    a.addEventListener('playing', joue);
    a.addEventListener('pause', arret);
    a.addEventListener('waiting', arret);
    a.addEventListener('ended', fin);
    return () => {
      a.removeEventListener('playing', joue);
      a.removeEventListener('pause', arret);
      a.removeEventListener('waiting', arret);
      a.removeEventListener('ended', fin);
      a.pause();
    };
  }, [phrases, allerA]);

  const jouer = useCallback(() => {
    const a = audio.current!;
    if (!a.src) allerA(index.current);
    else void a.play().catch(() => setEnLecture(false));
  }, [allerA]);
  const pause = useCallback(() => audio.current!.pause(), []);
  const setVitesse = useCallback((v: number) => {
    vitesseRef.current = v;
    audio.current!.defaultPlaybackRate = v;
    audio.current!.playbackRate = v;
    setVitesseEtat(v);
  }, []);

  return {
    jouer, pause, allerA, setVitesse, vitesse, phraseCourante, enLecture,
    precedente: () => allerA(Math.max(0, index.current - 1)),
    suivante: () => allerA(index.current + 1),
    rejouer: () => allerA(index.current),
  };
}
