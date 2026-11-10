import path from 'node:path';
import express from 'express';
import { config } from './config.ts';
import { ouvrir } from './db.ts';
import { creerRoutes } from './routes.ts';

const db = ouvrir(config.dbFile);
const app = express();
app.use(express.json());

app.get('/api/sante', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api', creerRoutes(db));
// Les mp3 ne changent jamais une fois écrits : le navigateur peut les garder.
app.use('/audio', express.static(config.audioDir, { immutable: true, maxAge: '30d' }));

// En production, l'interface construite est servie ici ; une page inconnue renvoie index.html.
const staticDir = process.env.STATIC_DIR;
if (staticDir) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !/^\/(api|audio)\//.test(req.path)) res.sendFile(path.join(staticDir, 'index.html'));
    else next();
  });
}

app.listen(config.port, () => {
  console.log(`Serveur sur http://localhost:${config.port}`);
});
