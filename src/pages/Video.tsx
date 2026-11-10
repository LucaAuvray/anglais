import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import type { Video as VideoT } from '../../server/src/types.ts';
import { api } from '../api.ts';
import { useChrono } from '../lecteur/useChrono.ts';

// Le strict nécessaire de l'API IFrame de YouTube (https://developers.google.com/youtube/iframe_api_reference).
type Lecteur = { destroy(): void };
type YT = {
  Player: new (el: HTMLElement, o: object) => Lecteur;
  PlayerState: { PLAYING: number; ENDED: number };
};
declare global { interface Window { YT?: YT; onYouTubeIframeAPIReady?: () => void } }

let apiYouTube: Promise<YT> | null = null;
function chargerYouTube(): Promise<YT> {
  apiYouTube ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!);
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.append(s);
  });
  return apiYouTube;
}

export default function Video() {
  const id = Number(useParams().id);
  const [video, setVideo] = useState<VideoT | null>(null);
  const [erreur, setErreur] = useState('');
  const [joue, setJoue] = useState(false);
  const [vue, setVue] = useState(false);
  const cible = useRef<HTMLDivElement>(null);
  useChrono(joue, false); // la page vidéo ne compte pas de « lecture » : seulement le temps où la vidéo joue

  useEffect(() => { api.video(id).then(setVideo).catch((e: Error) => setErreur(e.message)); }, [id]);

  useEffect(() => {
    if (!video || !cible.current) return;
    let lecteur: Lecteur | null = null;
    let actif = true;
    const el = document.createElement('div');
    cible.current.append(el);
    void chargerYouTube().then((yt) => {
      if (!actif) return;
      lecteur = new yt.Player(el, {
        videoId: video.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: { cc_load_policy: 1, cc_lang_pref: 'en', hl: 'en', rel: 0, playsinline: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            setJoue(e.data === yt.PlayerState.PLAYING); // seul l'état PLAYING compte comme écoute
            if (e.data === yt.PlayerState.ENDED) { setVue(true); void api.vu(video.id).catch(() => {}); }
          },
        },
      });
    });
    return () => { actif = false; lecteur?.destroy(); el.remove(); };
  }, [video]);

  if (erreur) return <p className="text-red-700 dark:text-red-400">{erreur}</p>;
  if (!video) return <p className="text-stone-500">Chargement…</p>;
  return (
    <main>
      <div ref={cible} className="aspect-video w-full overflow-hidden rounded-2xl bg-black [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full" />
      <h1 lang="en" className="mt-4 text-xl font-semibold">{video.titre}</h1>
      <p className="text-sm text-stone-500">{video.chaine}{vue ? ' · vue' : ''}</p>
      <p className="mt-3 text-sm text-stone-500">Sous-titres anglais activés. Le temps de lecture de la vidéo compte comme de l'écoute.</p>
    </main>
  );
}
