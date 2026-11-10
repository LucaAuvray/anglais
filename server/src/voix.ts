import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.ts';
import type { Voix } from './types.ts';

/** Voix de l'article n° n : britannique un article sur quatre, sinon les deux américaines en alternance. */
export function choisirVoix(n: number): Voix {
  if (n % 4 === 3) return 'bf_emma';
  return n % 2 === 0 ? 'af_heart' : 'am_michael';
}

/** Fichier audio d'un mot seul, relatif au dossier audio : le même texte donne le même fichier. */
export function fichierMot(texte: string, voix: Voix): string {
  return `mots/${voix}-${createHash('sha256').update(texte).digest('hex').slice(0, 16)}.mp3`;
}

/** Encode des échantillons flottants mono en mp3 96 kb/s. Le fichier n'apparaît qu'une fois complet. */
function versMp3(echantillons: Float32Array, frequence: number, fichier: string): Promise<void> {
  mkdirSync(path.dirname(fichier), { recursive: true });
  // Écrit à côté puis renomme : un mp3 tronqué serait sinon pris pour un mot déjà généré.
  const partiel = `${fichier}.part`;
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(frequence), '-ac', '1',
      '-i', 'pipe:0', '-b:a', '96k', '-f', 'mp3', partiel]);
    let erreur = '';
    p.stderr.on('data', (d) => (erreur += d));
    p.stdin.on('error', () => {}); // ffmpeg absent : l'erreur arrive par 'error' ci-dessous
    p.on('error', (e) => reject(new Error(`ffmpeg introuvable : ${e.message}`)));
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg a échoué : ${erreur.slice(0, 200)}`));
      renameSync(partiel, fichier);
      resolve();
    });
    p.stdin.end(Buffer.from(echantillons.buffer, echantillons.byteOffset, echantillons.byteLength));
  });
}

/** Charge Kokoro une fois (≈ 30 s, ≈ 750 Mo) ; `dire` écrit un mp3 et renvoie sa durée en ms. */
export async function creerVoix() {
  // Import tardif : le serveur web n'a pas à charger le moteur de voix.
  const [{ KokoroTTS }, { env }] = await Promise.all([import('kokoro-js'), import('@huggingface/transformers')]);
  // Par défaut le modèle (310 Mo) va dans node_modules, qu'un déploiement efface : on le range avec les données.
  env.cacheDir = path.join(config.dataDir, 'modeles');
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
  return {
    async dire(texte: string, voix: Voix, fichier: string): Promise<number> {
      const audio = await tts.generate(texte, { voice: voix });
      await versMp3(audio.audio, audio.sampling_rate, fichier);
      return Math.round((audio.audio.length / audio.sampling_rate) * 1000);
    },
    async fermer(): Promise<void> {
      await tts.model.dispose();
    },
  };
}
