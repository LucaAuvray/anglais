// Mesure de la voix Kokoro sur la machine qui la fera tourner (tâche 1 du plan).
// Règle : rapport génération / audio inférieur à 1 → Kokoro, sinon → Piper.
import { KokoroTTS } from 'kokoro-js';

const phrases = [
  'Arsenal won the big match on Sunday.',
  'The team scored two goals in the second half.',
  'The first goal came from a corner, and the second one was a beautiful shot from outside the box.',
  'The manager was very happy after the game.',
  'He said his players worked hard all week, and now they are first in the league.',
];

const t0 = performance.now();
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
console.log(`modèle chargé en ${((performance.now() - t0) / 1000).toFixed(1)} s`);

async function passe() {
  const debut = performance.now();
  let audio = 0;
  for (const p of phrases) {
    const a = await tts.generate(p, { voice: 'af_heart' });
    audio += a.audio.length / a.sampling_rate;
  }
  return { audio, generation: (performance.now() - debut) / 1000 };
}

await passe(); // la première passe chauffe le moteur, seule la seconde compte
const { audio, generation } = await passe();
console.log(`secondes d'audio : ${audio.toFixed(1)}`);
console.log(`secondes de génération : ${generation.toFixed(1)}`);
console.log(`rapport génération / audio : ${(generation / audio).toFixed(2)}`);
// maxRSS (en Kio) est le pic de mémoire du processus mesuré par le système.
console.log(`mémoire maximale : ${Math.round(process.resourceUsage().maxRSS / 1024)} Mo`);
