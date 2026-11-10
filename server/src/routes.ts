import { spawn } from 'node:child_process';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { config } from './config.ts';
import { jourCourant } from './jour.ts';
import { envoyerEnAttente } from './mnemo.ts';
import { proposerPalier } from './palier.ts';
import { preparationEnCours } from './preparation.ts';
import { PALIERS, type Mot, type Palier, type Phrase } from './types.ts';

type Options = {
  envoyer?: (db: DatabaseSync) => Promise<unknown>;
  lancerPreparation?: () => void;
  dataDir?: string;
};

/** « Autres articles » : la préparation tourne dans son propre processus, la voix n'encombre pas le serveur. */
function lancerPreparation() {
  spawn(process.execPath, [path.join(import.meta.dirname, 'preparer.ts'), '--ajouter', '2'], { detached: true, stdio: 'inherit' }).unref();
}

/** Corps validé, ou réponse 400 envoyée et undefined. */
function lire<T>(schema: z.ZodType<T>, req: Request, res: Response): T | undefined {
  const r = schema.safeParse(req.body ?? {});
  if (r.success) return r.data;
  res.status(400).json({ error: r.error.issues[0]?.message ?? 'Requête invalide' });
}

const RESUME = 'SELECT id, titre, sujet, palier, dureeMs FROM articles';
const versMot = (m: Record<string, unknown>) => ({ ...m, expression: Boolean(m.expression) }) as unknown as Mot;

/** Lundi de la semaine en cours, à Paris (calcul à midi UTC : pas d'effet des changements d'heure). */
function lundi(jour: string): string {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function creerRoutes(db: DatabaseSync, options: Options = {}): Router {
  const envoyer = options.envoyer ?? envoyerEnAttente;
  const lancer = options.lancerPreparation ?? lancerPreparation;
  const dataDir = options.dataDir ?? config.dataDir;
  const r = Router();

  const reglage = (cle: string) => (db.prepare('SELECT valeur FROM reglages WHERE cle = ?').get(cle) as { valeur: string }).valeur;
  const fixer = (cle: string, valeur: string) => db.prepare('INSERT OR REPLACE INTO reglages (cle, valeur) VALUES (?, ?)').run(cle, valeur);
  const temps = (depuis: string) => {
    const t = { ecoute: 0, lecture: 0 };
    for (const l of db.prepare('SELECT type, SUM(secondes) AS s FROM temps WHERE jour >= ? GROUP BY type').all(depuis)) {
      t[l.type as keyof typeof t] = Number(l.s);
    }
    return t;
  };
  const proposition = () => {
    const lus = db.prepare("SELECT mots, touches FROM articles WHERE statut = 'lu' AND touches IS NOT NULL AND luLe >= ? ORDER BY luLe DESC")
      .all(reglage('palierDepuis')) as { mots: number; touches: number }[];
    return proposerPalier(lus, reglage('palier') as Palier);
  };

  r.get('/aujourdhui', (_req, res) => {
    const jour = jourCourant();
    res.json({
      articles: db.prepare(`${RESUME} WHERE statut = 'pret' ORDER BY id LIMIT 4`).all(),
      videos: db.prepare('SELECT * FROM videos WHERE ajouteLe = ? AND vuLe IS NULL ORDER BY id').all(jour),
      temps: { jour: temps(jour), semaine: temps(lundi(jour)), total: temps('') },
      proposition: proposition(),
      preparationEnCours: preparationEnCours(dataDir),
    });
  });

  r.get('/articles/lus', (_req, res) => {
    res.json(db.prepare(`${RESUME} WHERE statut = 'lu' ORDER BY luLe DESC, id DESC`).all());
  });

  r.get('/articles/:id', (req, res) => {
    const a = db.prepare('SELECT * FROM articles WHERE id = ?').get(Number(req.params.id));
    if (!a) return void res.status(404).json({ error: 'Article introuvable' });
    res.json({ ...a, phrases: JSON.parse(String(a.phrases)) });
  });

  r.post('/articles/:id/lu', (req, res) => {
    const c = lire(z.object({ touches: z.number().int().min(0) }), req, res);
    if (!c) return;
    const { changes } = db.prepare("UPDATE articles SET statut = 'lu', luLe = ?, touches = ? WHERE id = ?")
      .run(new Date().toISOString(), c.touches, Number(req.params.id));
    if (!changes) return void res.status(404).json({ error: 'Article introuvable' });
    res.json({ ok: true });
  });

  r.post('/mots', (req, res) => {
    const c = lire(z.object({ articleId: z.number().int(), phrase: z.number().int().min(0), annotation: z.number().int().min(0) }), req, res);
    if (!c) return;
    const art = db.prepare('SELECT sujet, phrases FROM articles WHERE id = ?').get(c.articleId) as { sujet: string; phrases: string } | undefined;
    const p = art && (JSON.parse(art.phrases) as Phrase[])[c.phrase];
    const a = p?.annotations[c.annotation];
    if (!art || !p || !a) return void res.status(404).json({ error: 'Mot introuvable' });
    if (a.transparent) return void res.status(400).json({ error: 'Mot transparent : pas de carte.' });
    db.prepare("INSERT OR IGNORE INTO mots (texte, base, sens, phrase, sujet, prononciation, expression, statut) VALUES (?, ?, ?, ?, ?, ?, ?, 'attente')")
      .run(a.texte, a.base, a.sens, p.texte, art.sujet, a.prononciation, a.expression ? 1 : 0);
    // Sans attendre Mnemo : la lecture continue, ce qui échoue reste en attente.
    void envoyer(db).catch(() => {});
    res.json({ mot: versMot(db.prepare('SELECT * FROM mots WHERE base = ?').get(a.base)!) });
  });

  r.get('/mots', (_req, res) => {
    res.json(db.prepare('SELECT * FROM mots ORDER BY id DESC').all().map(versMot));
  });

  r.post('/temps', (req, res) => {
    const c = lire(z.object({ type: z.enum(['ecoute', 'lecture']), secondes: z.number().finite().min(0) }), req, res);
    if (!c) return;
    // 60 s au plus par envoi : un onglet resté ouvert ou un envoi rejoué ne gonfle pas le compteur.
    db.prepare('INSERT INTO temps (jour, type, secondes) VALUES (?, ?, ?) ON CONFLICT (jour, type) DO UPDATE SET secondes = secondes + excluded.secondes')
      .run(jourCourant(), c.type, Math.min(c.secondes, 60));
    res.json({ ok: true });
  });

  r.post('/preparer', (_req, res) => {
    if (preparationEnCours(dataDir)) return void res.status(409).json({ error: 'Une préparation est déjà en cours.' });
    lancer();
    res.status(202).json({ ok: true });
  });

  r.get('/reglages', (_req, res) => {
    res.json({ palier: reglage('palier'), palierDepuis: reglage('palierDepuis') });
  });

  r.put('/reglages', (req, res) => {
    const c = lire(z.object({ palier: z.enum(PALIERS) }), req, res);
    if (!c) return;
    fixer('palier', c.palier);
    fixer('palierDepuis', new Date().toISOString());
    res.json({ palier: c.palier });
  });

  r.post('/palier/reponse', (req, res) => {
    const c = lire(z.object({ accepte: z.boolean() }), req, res);
    if (!c) return;
    const p = proposition();
    if (c.accepte && p) {
      const rang = PALIERS.indexOf(reglage('palier') as Palier);
      fixer('palier', PALIERS[rang + (p === 'monter' ? 1 : -1)]);
    }
    // Accepté ou refusé, on recompte depuis maintenant : la question ne revient qu'après 5 nouveaux articles.
    fixer('palierDepuis', new Date().toISOString());
    res.json({ palier: reglage('palier') });
  });

  r.get('/videos/:id', (req, res) => {
    const v = db.prepare('SELECT * FROM videos WHERE id = ?').get(Number(req.params.id));
    if (!v) return void res.status(404).json({ error: 'Vidéo introuvable' });
    res.json(v);
  });

  r.post('/videos/:id/vu', (req, res) => {
    db.prepare('UPDATE videos SET vuLe = ? WHERE id = ?').run(new Date().toISOString(), Number(req.params.id));
    res.json({ ok: true });
  });

  r.get('/erreurs', (_req, res) => {
    res.json(db.prepare('SELECT * FROM erreurs ORDER BY quand DESC, id DESC LIMIT 50').all());
  });

  return r;
}
