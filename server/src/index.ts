import path from 'node:path';
import express from 'express';
import { config } from './config.ts';

const app = express();
app.use(express.json());

app.get('/api/sante', (_req, res) => {
  res.json({ ok: true });
});

// En production, l'interface construite est servie ici ; une page inconnue renvoie index.html.
const staticDir = process.env.STATIC_DIR;
if (staticDir) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) res.sendFile(path.join(staticDir, 'index.html'));
    else next();
  });
}

app.listen(config.port, () => {
  console.log(`Serveur sur http://localhost:${config.port}`);
});
