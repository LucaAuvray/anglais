import path from 'node:path';

const env = process.env;

export const config = {
  port: Number(env.PORT ?? 3010),
  dataDir: env.DATA_DIR ?? path.join(import.meta.dirname, '..', 'data'),
  mnemoUrl: env.MNEMO_URL ?? '',
  mnemoEmail: env.MNEMO_EMAIL ?? '',
  mnemoPassword: env.MNEMO_PASSWORD ?? '',
  claudeModel: env.CLAUDE_MODEL ?? 'claude-sonnet-5-5',
  // low : 53 s au lieu de 263 s en medium pour le même article, qualité comparable (essai du 10/11/2026).
  claudeEffort: env.CLAUDE_EFFORT ?? 'low',
};
