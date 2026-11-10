# Brique 1 — Écoute et lecture : plan de construction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner chaque jour à Luca des articles réels réécrits à son niveau et lus à voix haute, des vidéos pour apprenants, l'envoi de mots vers Mnemo et un compteur d'heures.

**Architecture:** Une interface React servie par un serveur Express avec une base SQLite. La préparation des contenus (flux RSS → réécriture par Claude → voix Kokoro) est un programme séparé, lancé chaque nuit par un minuteur systemd et à la demande par le serveur, pour que la voix ne garde pas la mémoire. Mnemo est appelé par ses routes HTTP existantes.

**Tech Stack:** React 19, Vite 8, Tailwind 4, TypeScript, react-router 7 ; Express 5, better-sqlite3, zod, kokoro-js 1.2.1, rss-parser, @mozilla/readability + linkedom, cmu-pronouncing-dictionary 3 ; vitest ; ffmpeg ; CLI `claude` ; Node 22+ ; systemd dans un conteneur LXC.

**Spec:** `docs/superpowers/specs/2026-11-10-ecoute-lecture-design.md` (à lire avant de commencer, avec `CLAUDE.md`).

## Global Constraints

- Un seul utilisateur : pas de comptes, pas d'authentification, rien « au cas où ».
- Interface en français avec tous les accents ; contenu d'apprentissage en anglais.
- Aucun service payant pour la voix. IA : Claude par abonnement uniquement, sans secours.
- Mnemo (`C:\Users\lucaa\Documents\Projet\Mnemo`) n'est jamais modifié.
- Pas de Docker. Node 22 ou plus récent. Port du serveur : `3010`.
- Pas de points, séries ni récompenses. Pas de traduction de phrase entière.
- Paliers, dans l'ordre : `A2`, `A2+`, `B1`, `B1+`, `B2`, `original`. Départ : `A2`.
- Sujets, dans l'ordre d'intérêt : `foot`, `politique`, `ia`, `histoires`, `economie`, `developpement`, `culture`.
- Voix : `af_heart`, `am_michael` (américaines), `bf_emma` (britannique, un article sur quatre).
- Au plus 4 articles non lus ; un non-lu de plus de 7 jours est archivé ; « Autres articles » en prépare 2.
- Mêmes versions majeures que Mnemo pour les bibliothèques communes (voir ses `package.json`).
- Travailler sur la branche `brique-1-ecoute-lecture`. Un commit par tâche.
- Tests : `npm --prefix server test` (serveur) et `npm test` (interface), tous deux `vitest run`.

## Review Focus

Cas que la conception implique sans les nommer, les plus probables d'abord. Chacun a son test dans la tâche indiquée.

1. L'IA annote un mot absent de la phrase, ou présent deux fois : l'annotation introuvable est ignorée, la première occurrence libre est prise (tâche 4).
2. La page d'un article ne donne presque pas de texte (mur payant, vidéo) : l'entrée est sautée sans appeler l'IA (tâche 7).
3. Mnemo est éteint ou refuse le mot de passe au moment du « + Mnemo » : le mot reste « en attente », la lecture continue, l'envoi repart plus tard (tâches 9 et 10).
4. Deux préparations se lancent en même temps (minuteur et bouton), ou une préparation meurt en laissant son verrou : la seconde est refusée, un verrou mort est repris (tâche 7).
5. Sur téléphone, l'onglet passe en arrière-plan ou l'audio est bloqué : le compteur d'écoute ne compte que le temps réellement joué, et le serveur plafonne chaque envoi (tâches 10 et 12).

## Structure des fichiers

```
package.json  vite.config.ts  tsconfig*.json  index.html     interface (racine)
src/
  main.tsx  App.tsx            routes
  api.ts                       appels HTTP
  pages/                       Aujourdhui, Article, Video, DejaLus, Mots, Reglages
  lecteur/segments.ts          découpe une phrase en segments touchables
  lecteur/chrono.ts            compte l'écoute et la lecture
  lecteur/useLecture.ts        enchaîne les audios des phrases
  lecteur/Fiche.tsx            fiche d'un mot
server/
  package.json  tsconfig.json  .env.example
  sources.json                 flux RSS par sujet, chaînes YouTube
  scripts/mesure-voix.mjs      mesure de la voix (tâche 1)
  src/
    types.ts                   types partagés (l'interface les importe en `import type`)
    config.ts  db.ts  jour.ts
    prononciation.ts
    ia/claude.ts  ia/reecrire.ts
    voix.ts
    sources.ts
    preparation.ts  preparer.ts
    palier.ts
    mnemo.ts
    routes.ts  index.ts
  test/*.test.ts
deploy/  anglais.service  anglais-preparation.service  anglais-preparation.timer  deploy.sh
```

Types partagés, définis en tâche 2 dans `server/src/types.ts` :

```ts
export const PALIERS = ['A2', 'A2+', 'B1', 'B1+', 'B2', 'original'] as const;
export type Palier = (typeof PALIERS)[number];
export const SUJETS = ['foot', 'politique', 'ia', 'histoires', 'economie', 'developpement', 'culture'] as const;
export type Sujet = (typeof SUJETS)[number];
export type Voix = 'af_heart' | 'am_michael' | 'bf_emma';

export interface Annotation {
  debut: number; fin: number;        // positions de caractères dans Phrase.texte, fin exclue
  texte: string;                     // tel qu'écrit dans la phrase
  base: string;                      // forme de base, sans « to » : « score »
  sens: string;                      // en français, dans cette phrase
  transparent: boolean;              // évident pour un francophone : pas de « + Mnemo »
  expression: boolean;               // plusieurs mots
  prononciation: string | null;      // « /ˈbjutəfəl/ », null si inconnue ou ambiguë
  audio: string | null;              // fichier du mot seul, relatif à DATA_DIR/audio
}
export interface Phrase { texte: string; audio: string; dureeMs: number; annotations: Annotation[] }
export interface Article {
  id: number; url: string; source: string; sujet: Sujet; titre: string; palier: Palier; voix: Voix;
  phrases: Phrase[]; mots: number; dureeMs: number;
  statut: 'pret' | 'lu' | 'archive'; creeLe: string; luLe: string | null; touches: number | null;
}
export interface Video { id: number; youtubeId: string; titre: string; chaine: string; publieLe: string; vuLe: string | null }
export interface Mot {
  id: number; texte: string; base: string; sens: string; phrase: string; sujet: Sujet;
  prononciation: string | null; expression: boolean; statut: 'attente' | 'envoye';
}
```

---

### Task 1: Mesurer la voix sur le conteneur

Étape exigée par la conception avant tout le reste. Elle se fait avec Luca.

**Files:**
- Create: `server/scripts/mesure-voix.mjs`, `server/package.json` (minimal, avec `kokoro-js`)

**Interfaces:**
- Produces: le choix du moteur de voix, noté dans `CLAUDE.md`. Les tâches suivantes supposent Kokoro ; si Piper est retenu, seule la tâche 5 change (même signature).

- [ ] **Step 1 :** Demander à Luca de créer le conteneur LXC (Debian, non privilégié, 4 cœurs, 4 Gio, 1 Gio de swap, 16 Gio) et de donner son alias SSH. Ne rien créer sur le Proxmox sans son accord explicite.
- [ ] **Step 2 :** Sur le conteneur, installer Node 22+ et ffmpeg. Montrer `node --version` et `ffmpeg -version`.
- [ ] **Step 3 :** Écrire `mesure-voix.mjs` : charge `onnx-community/Kokoro-82M-v1.0-ONNX` (`dtype: 'fp32'`, `device: 'cpu'`), génère deux fois les 5 phrases de l'essai (voix `af_heart`) et affiche `secondes d'audio`, `secondes de génération` de la seconde passe, leur rapport, et `process.memoryUsage().rss` au maximum.
- [ ] **Step 4 :** Le lancer sur le conteneur. Règle : rapport génération / audio **inférieur à 1** → Kokoro ; sinon → Piper.
- [ ] **Step 5 :** Noter le résultat chiffré et le moteur retenu dans `CLAUDE.md` (« Décisions prises »). Commit.

### Task 2: Socle

**Files:**
- Create: fichiers racine de l'interface, `src/main.tsx`, `src/App.tsx`, `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/src/{types,config,db,jour,index}.ts`, `server/test/{db,jour}.test.ts`, `.gitignore`

**Interfaces:**
- Produces:
  - `config` : `{ port: number; dataDir: string; mnemoUrl: string; mnemoEmail: string; mnemoPassword: string; claudeModel: string; claudeEffort: string }`, lu depuis `PORT` (défaut 3010), `DATA_DIR` (défaut `server/data`), `MNEMO_URL`, `MNEMO_EMAIL`, `MNEMO_PASSWORD`, `CLAUDE_MODEL` (défaut `claude-sonnet-5-5`), `CLAUDE_EFFORT` (défaut `medium`).
  - `ouvrir(chemin: string): Database` : crée les tables si besoin. `':memory:'` pour les tests.
  - `jourCourant(d?: Date): string` : date `AAAA-MM-JJ` à Paris (`Europe/Paris`).
  - Tables : `articles` (colonnes de `Article`, `phrases` en JSON, `url` unique), `videos` (`youtubeId` unique), `mots` (`base` unique), `temps(jour, type, secondes)` clé `(jour, type)` avec `type` ∈ `ecoute`, `lecture`, `reglages(cle, valeur)`, `erreurs(id, quand, etape, message)`.
  - Réglages initiaux : `palier = 'A2'`, `palierDepuis` = date de création, `compteurArticles = '0'` (sert à `choisirVoix`), `tourSujets = '0'` (sert à `choisirSujets`).
  - `GET /api/sante` → `{ ok: true }`. En production le serveur sert `STATIC_DIR` avec repli sur `index.html`.

- [ ] **Step 1 :** Créer la branche `brique-1-ecoute-lecture`. Échafauder l'interface (React, Vite, Tailwind, react-router) et le serveur (`"type": "module"`, scripts `dev`, `build`, `start`, `test`), en reprenant la configuration de Mnemo. `.gitignore` : `node_modules`, `dist`, `server/data`, `.env`.
- [ ] **Step 2 :** Écrire les tests qui échouent :

```ts
test('ouvrir crée les tables et les réglages initiaux', () => {
  const db = ouvrir(':memory:');
  expect(db.prepare("SELECT valeur FROM reglages WHERE cle='palier'").get()).toEqual({ valeur: 'A2' });
  db.prepare("INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe) VALUES ('u','s','foot','t','A2','af_heart','[]',0,0,'pret','2026-11-10T00:00:00Z')").run();
  expect(() => db.prepare("INSERT INTO articles (url, source, sujet, titre, palier, voix, phrases, mots, dureeMs, statut, creeLe) VALUES ('u','s','foot','t','A2','af_heart','[]',0,0,'pret','2026-11-10T00:00:00Z')").run()).toThrow();
});
test('jourCourant bascule à minuit à Paris, pas en UTC', () => {
  expect(jourCourant(new Date('2026-11-10T22:30:00Z'))).toBe('2026-11-10');
  expect(jourCourant(new Date('2026-11-10T23:30:00Z'))).toBe('2026-11-11');
});
```

- [ ] **Step 3 :** Lancer `npm --prefix server test` : échec attendu (fonctions absentes).
- [ ] **Step 4 :** Écrire `types.ts` (bloc ci-dessus), `config.ts`, `db.ts`, `jour.ts`, `index.ts`.
- [ ] **Step 5 :** Relancer les tests : succès. Vérifier `curl localhost:3010/api/sante` → `{"ok":true}` et que `npm run build` passe.
- [ ] **Step 6 :** Commit initial : le socle, plus `CLAUDE.md`, `docs/`, `reports/` et `research_notes/` (jamais commités jusqu'ici).

### Task 3: Prononciation

**Files:**
- Create: `server/src/prononciation.ts`, `server/test/prononciation.test.ts`

**Interfaces:**
- Produces: `prononciation(mot: string): string | null`

- [ ] **Step 1 :** Tests qui échouent :

```ts
test.each([
  ['beautiful', '/ˈbjutəfəl/'], ['about', '/əˈbaʊt/'], ['score', '/skɔr/'],
  ['manager', '/ˈmænədʒər/'], ['Beautiful', '/ˈbjutəfəl/'],
])('%s → %s', (mot, attendu) => expect(prononciation(mot)).toBe(attendu));
test('mot absent du dictionnaire → null', () => expect(prononciation('xyzzyq')).toBeNull());
test('accentuation variable selon le sens → null', () => {
  expect(prononciation('record')).toBeNull();
  expect(prononciation('present')).toBeNull();
});
test('variantes de même accentuation → la première', () => expect(prononciation('either')).not.toBeNull());
test('plusieurs mots → null', () => expect(prononciation('give up')).toBeNull());
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- prononciation` : échec.
- [ ] **Step 3 :** Écrire `prononciation`. Regarder d'abord comment `cmu-pronouncing-dictionary` range les variantes d'un mot. Règles :
  - Une variante compte comme « autre accentuation » si la voyelle marquée `1` n'est pas à la même position dans la suite des voyelles.
  - Conversion ARPAbet → API : `AA ɑ, AE æ, AH0 ə, AH ʌ, AO ɔ, AW aʊ, AY aɪ, EH ɛ, ER0 ər, ER ɜr, EY eɪ, IH ɪ, IY i, OW oʊ, OY ɔɪ, UH ʊ, UW u, B b, CH tʃ, D d, DH ð, F f, G ɡ, HH h, JH dʒ, K k, L l, M m, N n, NG ŋ, P p, R r, S s, SH ʃ, T t, TH θ, V v, W w, Y j, Z z, ZH ʒ`.
  - La marque `ˈ` se place devant la syllabe de la voyelle `1` : on recule depuis cette voyelle tant que les consonnes précédentes forment une attaque permise (`s` + occlusive sourde + liquide, occlusive ou fricative + `l r w j`, ou une seule consonne ; `ŋ` jamais en attaque). Les mots d'une seule voyelle n'ont pas de marque. L'accent secondaire (`2`) est ignoré.
- [ ] **Step 4 :** Relancer : succès. Commit.

### Task 4: Réécriture par Claude

**Files:**
- Create: `server/src/ia/claude.ts`, `server/src/ia/reecrire.ts`, `server/test/reecrire.test.ts`

**Interfaces:**
- Consumes: `config.claudeModel`, `config.claudeEffort`, `prononciation` (tâche 3).
- Produces:
  - `appelerClaude(systeme: string, prompt: string): Promise<string>` — rejette avec un message clair si la CLI est absente, dépasse 5 minutes, ou refuse pour quota.
  - `type ArticleReecrit = { titre: string; phrases: { texte: string; annotations: Omit<Annotation, 'audio'>[] }[]; mots: number }`
  - `reecrire(source: { titre: string; texte: string }, palier: Palier, appeler?: typeof appelerClaude): Promise<ArticleReecrit>`
  - `localiser(texte: string, unites: { texte: string }[]): ({ debut: number; fin: number } | null)[]`

- [ ] **Step 1 :** Tests qui échouent, avec un faux `appeler` qui renvoie un JSON fixe :

```ts
const brut = { titre: 'Arsenal win', phrases: [{ texte: 'The team scored two goals, and the fans scored tickets.',
  mots: [{ texte: 'scored', base: 'score', sens: 'a marqué', transparent: false },
         { texte: 'scored', base: 'score', sens: 'ont obtenu', transparent: false },
         { texte: 'stadium', base: 'stadium', sens: 'stade', transparent: true }],
  expressions: [] }] };
test('deux occurrences du même mot prennent deux positions différentes', async () => {
  const a = await reecrire(src, 'A2', async () => JSON.stringify(brut));
  const [x, y] = a.phrases[0].annotations;
  expect([x.debut, x.fin]).toEqual([9, 15]); expect(y.debut).toBe(40); expect(y.sens).toBe('ont obtenu');
});
test('un mot absent de la phrase est ignoré', async () => { /* 'stadium' → 2 annotations seulement */ });
test('une expression masque les mots qu\'elle contient', async () => { /* 'gave up' + 'gave' → 1 annotation, expression: true */ });
test('la prononciation est remplie, null pour une expression', async () => {});
test('mots compte tous les mots du texte réécrit', async () => { /* 10 */ });
test('réponse non JSON ou sans phrases → rejet', async () => {
  await expect(reecrire(src, 'A2', async () => 'désolé')).rejects.toThrow();
});
test('localiser respecte les limites de mot', () => {
  expect(localiser('He is in the inn.', [{ texte: 'in' }])).toEqual([{ debut: 6, fin: 8 }]);
});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- reecrire` : échec.
- [ ] **Step 3 :** Écrire `appelerClaude` en recopiant `appelerClaude` de `Mnemo/server/src/routes/gemini.ts` (lignes 300-357) : mêmes arguments de la CLI, même lecture du flux, sans image ni comptage de jetons. Le prompt système est celui de l'appelant.
- [ ] **Step 4 :** Écrire `reecrire` : consigne demandant le JSON `{ titre, phrases: [{ texte, mots: [{texte, base, sens, transparent}], expressions: [{texte, base, sens}] }] }`, validé par zod. La consigne exige : 250 à 450 mots au palier demandé (pour `original` : garder les mots d'origine, couper des paragraphes pour rester sous 450 mots) ; annoter tous les mots sauf les mots-outils élémentaires ; sens en français dans la phrase ; expressions en un seul bloc de mots contigus. `localiser` cherche sans tenir compte de la casse, sur des limites de mot, de gauche à droite, sans réutiliser une position prise ; les expressions sont placées avant les mots.
- [ ] **Step 5 :** Relancer : succès. Essai réel une fois, à la main : `reecrire` sur un vrai article de foot, relire le résultat avec Luca (niveau, justesse des sens). Commit.

### Task 5: Voix

**Files:**
- Create: `server/src/voix.ts`, `server/test/voix.test.ts`

**Interfaces:**
- Produces:
  - `choisirVoix(n: number): Voix` — `n` est le compteur d'articles préparés.
  - `creerVoix(): Promise<{ dire(texte: string, voix: Voix, fichier: string): Promise<number>; fermer(): Promise<void> }>` — `dire` écrit un mp3 96 kb/s et renvoie sa durée en millisecondes.
  - `fichierMot(texte: string, voix: Voix): string` — `mots/<voix>-<empreinte>.mp3`, stable pour un même texte.

- [ ] **Step 1 :** Tests qui échouent :

```ts
test('un article sur quatre est britannique, les autres alternent', () => {
  expect([0, 1, 2, 3, 4, 5, 6, 7].map(choisirVoix)).toEqual(
    ['af_heart', 'am_michael', 'af_heart', 'bf_emma', 'af_heart', 'am_michael', 'af_heart', 'bf_emma']);
});
test('fichierMot est stable et distingue la voix', () => {
  expect(fichierMot('scored', 'af_heart')).toBe(fichierMot('scored', 'af_heart'));
  expect(fichierMot('scored', 'af_heart')).not.toBe(fichierMot('scored', 'bf_emma'));
});
test.skipIf(!process.env.TEST_VOIX)('dire produit un mp3 dont la durée est plausible', async () => {
  const v = await creerVoix(); const ms = await v.dire('The team scored two goals.', 'af_heart', tmp);
  expect(ms).toBeGreaterThan(1000); expect(ms).toBeLessThan(5000); expect(statSync(tmp).size).toBeGreaterThan(5000);
});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- voix` : échec.
- [ ] **Step 3 :** Écrire `voix.ts` avec le moteur retenu en tâche 1 (Kokoro : `KokoroTTS.from_pretrained`, `dtype: 'fp32'`, `device: 'cpu'` ; conversion en mp3 par `ffmpeg`). La durée vient du nombre d'échantillons divisé par la fréquence.
- [ ] **Step 4 :** Relancer, puis une fois avec `TEST_VOIX=1` : succès. Commit.

### Task 6: Sources

**Files:**
- Create: `server/sources.json`, `server/src/sources.ts`, `server/test/sources.test.ts`, `server/test/fixtures/article.html`

**Interfaces:**
- Produces:
  - `sources.json` : `{ "flux": { "<sujet>": ["<url RSS>", …] }, "chaines": [{ "id": "<id YouTube>", "nom": "…" }] }`
  - `lireFlux(url: string): Promise<{ titre: string; url: string; publieLe: string }[]>`
  - `lireChaine(id: string): Promise<{ youtubeId: string; titre: string; publieLe: string }[]>` — flux public `https://www.youtube.com/feeds/videos.xml?channel_id=<id>`.
  - `extraireTexte(html: string, url: string): string | null` — null sous 150 mots.
  - `choisirSujets(nombre: number, tour: number): Sujet[]`

- [ ] **Step 1 :** Tests qui échouent :

```ts
test('la moitié des articles est du foot, les autres sujets tournent', () => {
  expect(choisirSujets(4, 0)).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(choisirSujets(4, 1)).toEqual(['foot', 'foot', 'histoires', 'economie']);
  expect(choisirSujets(4, 3)).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(choisirSujets(2, 0)).toEqual(['foot', 'politique']);
  expect(choisirSujets(1, 0)).toEqual(['foot']);
});
test('extraireTexte garde le corps de l\'article, sans menu ni pied de page', () => {
  const t = extraireTexte(readFileSync('test/fixtures/article.html', 'utf8'), 'https://exemple.test/a');
  expect(t).toContain('scored two goals'); expect(t).not.toContain('Cookie settings');
});
test('page presque vide → null', () => expect(extraireTexte('<html><body><p>Subscribe to read.</p></body></html>', 'https://x.test')).toBeNull());
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- sources` : échec.
- [ ] **Step 3 :** Écrire `sources.ts` (rss-parser ; @mozilla/readability sur un document linkedom). `choisirSujets` : `Math.ceil(nombre / 2)` fois `foot`, puis les six autres sujets à tour de rôle à partir de `tour × (nombre − nombre de foot)`.
- [ ] **Step 4 :** Remplir `sources.json` : chercher sur le web 2 à 3 flux RSS en anglais par sujet et 5 à 8 chaînes YouTube faites pour apprenants de niveau A2-B1. **Vérifier chaque flux et chaque chaîne** (le flux répond, la chaîne publie encore, le niveau est bien celui annoncé) et montrer la liste à Luca.
- [ ] **Step 5 :** Relancer : succès. Commit.

### Task 7: Préparation des contenus

**Files:**
- Create: `server/src/preparation.ts`, `server/src/preparer.ts`, `server/test/preparation.test.ts`

**Interfaces:**
- Consumes: `reecrire`, `creerVoix`, `choisirVoix`, `fichierMot`, `lireFlux`, `lireChaine`, `extraireTexte`, `choisirSujets`, `ouvrir`.
- Produces:
  - `type Deps = { lireFlux; lireChaine; telecharger(url: string): Promise<string>; extraireTexte; reecrire; voix: { dire; fermer } ; sources: SourcesJson; maintenant(): Date }`
  - `completer(db, deps, cible = 4): Promise<number>` — archive les non-lus de plus de 7 jours, puis prépare jusqu'à `cible` non-lus ; ajoute au plus 2 vidéos nouvelles par jour. Renvoie le nombre d'articles préparés.
  - `ajouter(db, deps, nombre = 2): Promise<number>` — prépare `nombre` articles de plus, sans regarder la cible.
  - `prendreVerrou(dataDir: string): boolean`, `rendreVerrou(dataDir: string): void`, `preparationEnCours(dataDir: string): boolean`
  - `preparer.ts` : `node dist/preparer.js` → `completer` ; `node dist/preparer.js --ajouter 2` → `ajouter`. Code de sortie 0 même si des articles ont été écartés ; 2 si le verrou est pris.

- [ ] **Step 1 :** Tests qui échouent, avec de fausses dépendances :

```ts
test('base vide → 4 articles prêts dont 2 de foot, compteur avancé', async () => {
  expect(await completer(db, deps)).toBe(4);
  expect(sujetsPrets(db)).toEqual(['foot', 'foot', 'politique', 'ia']);
  expect(reglage(db, 'compteurArticles')).toBe('4');
});
test('3 non lus → 1 seul préparé ; 4 non lus → aucun appel à l\'IA', async () => {});
test('un non-lu de 8 jours est archivé et remplacé', async () => {});
test('une URL déjà connue n\'est jamais repréparée', async () => {});
test('texte introuvable → entrée sautée sans appeler l\'IA', async () => {
  deps.extraireTexte = () => null; await completer(db, deps);
  expect(deps.reecrire).not.toHaveBeenCalled();
});
test('l\'IA échoue sur un article → erreur enregistrée, article suivant essayé', async () => {
  // 1er appel rejette : 4 articles prêts quand même, 1 ligne dans erreurs avec etape = 'reecriture'
});
test('la voix échoue → aucun article à moitié enregistré', async () => {});
test('chaque phrase et chaque annotation a son fichier audio ; un mot déjà généré n\'est pas refait', async () => {});
test('le tour des sujets avance à chaque préparation', async () => { /* reglage tourSujets : '0' → '1' */ });
test('au plus 2 vidéos nouvelles par jour, jamais deux fois la même', async () => {});
test('verrou : le second est refusé ; un verrou dont le processus est mort est repris', () => {
  expect(prendreVerrou(dir)).toBe(true); expect(prendreVerrou(dir)).toBe(false);
  writeFileSync(join(dir, 'preparation.lock'), '999999'); expect(prendreVerrou(dir)).toBe(true);
});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- preparation` : échec.
- [ ] **Step 3 :** Écrire `preparation.ts`. Un article est inséré en une seule transaction, après que tout son audio existe. Fichiers : `audio/articles/<id provisoire>/<n>.mp3` pour les phrases, `fichierMot` pour les mots (généré seulement s'il manque). Le palier est lu dans `reglages`. Le verrou est un fichier `preparation.lock` contenant le PID ; il est mort si `process.kill(pid, 0)` échoue.
- [ ] **Step 4 :** Écrire `preparer.ts` (prend le verrou, appelle, ferme la voix, rend le verrou dans un `finally`).
- [ ] **Step 5 :** Relancer : succès. Essai réel : `npm --prefix server run build && node server/dist/preparer.js`, vérifier 4 articles en base et leurs mp3. Commit.

### Task 8: Proposition de palier

**Files:**
- Create: `server/src/palier.ts`, `server/test/palier.test.ts`

**Interfaces:**
- Produces: `proposerPalier(lus: { mots: number; touches: number }[], palier: Palier): 'monter' | 'descendre' | null` — `lus` contient les articles lus jusqu'au bout depuis `palierDepuis`, du plus récent au plus ancien.

- [ ] **Step 1 :** Tests qui échouent :

```ts
const a = (touches: number) => ({ mots: 300, touches });
test('moins de 5 articles → rien', () => expect(proposerPalier([a(0), a(0), a(0), a(0)], 'A2')).toBeNull());
test('moins de 2 % sur les 5 derniers → monter', () => expect(proposerPalier(Array(5).fill(a(5)), 'A2')).toBe('monter'));   // 1,7 %
test('plus de 5 % → descendre', () => expect(proposerPalier(Array(5).fill(a(16)), 'B1')).toBe('descendre'));               // 5,3 %
test('entre 2 et 5 % → rien', () => expect(proposerPalier(Array(5).fill(a(9)), 'B1')).toBeNull());                         // 3 %
test('seuls les 5 plus récents comptent', () => expect(proposerPalier([...Array(5).fill(a(9)), a(90)], 'B1')).toBeNull());
test('pas de montée depuis original, pas de descente depuis A2', () => {
  expect(proposerPalier(Array(5).fill(a(0)), 'original')).toBeNull();
  expect(proposerPalier(Array(5).fill(a(90)), 'A2')).toBeNull();
});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- palier` : échec.
- [ ] **Step 3 :** Écrire `proposerPalier` (rapport `somme des touches / somme des mots` sur les 5 premiers éléments).
- [ ] **Step 4 :** Relancer : succès. Commit.

### Task 9: Envoi vers Mnemo

**Files:**
- Create: `server/src/mnemo.ts`, `server/test/mnemo.test.ts`

**Interfaces:**
- Consumes: `config.mnemoUrl`, `config.mnemoEmail`, `config.mnemoPassword`, type `Mot`.
- Produces:
  - `fabriquerCartes(mot: Mot): [CarteMnemo, CarteMnemo]` avec `CarteMnemo = { type: 'flashcard'; front: string; back: string; tags: string[] }`
  - `envoyerEnAttente(db, requete?: typeof fetch): Promise<{ envoyes: number; restants: number }>` — ne lève jamais.
- Contrat de Mnemo (lu dans son code, à ne pas modifier) : `POST /api/auth/login {email, password}` → `{token}` ; `GET /api/decks` → `[{id, name}]` ; `POST /api/decks {name, description, tags}` → `{id}` ; `POST /api/cards/batch {cards: [{deckId, type, front, back, tags}]}` → tableau des cartes créées, **plus court que l'envoi si un deck est refusé** ; en-tête `Authorization: Bearer <token>` ; `401` quand le jeton a expiré.

- [ ] **Step 1 :** Tests qui échouent :

```ts
const mot = { texte: 'scored', base: 'score', sens: 'a marqué', sujet: 'foot', expression: false,
  phrase: 'The team scored two goals in the second half.', prononciation: '/skɔr/' } as Mot;
test('les deux cartes', () => {
  expect(fabriquerCartes(mot)).toEqual([
    { type: 'flashcard', tags: ['anglais', 'foot'],
      front: 'Que veut dire « scored » dans cette phrase ?\n\nThe team scored two goals in the second half.',
      back: 'a marqué — score /skɔr/' },
    { type: 'flashcard', tags: ['anglais', 'foot'],
      front: 'Complète :\n\nThe team ___ two goals in the second half.\n(a marqué)',
      back: 'scored' },
  ]);
});
test('sans prononciation, la réponse est « a marqué — score »', () => {});
test('une expression est remplacée en entier par ___', () => {});
test('le deck « Anglais » est créé s\'il manque, réutilisé sinon', async () => {});
test('jeton expiré (401) → reconnexion puis envoi', async () => {});
test('Mnemo injoignable → { envoyes: 0, restants: 1 }, le mot reste en attente', async () => {});
test('mauvais mot de passe → aucun mot marqué envoyé, une ligne dans erreurs', async () => {});
test('Mnemo renvoie moins de cartes que prévu → rien n\'est marqué envoyé', async () => {});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- mnemo` : échec.
- [ ] **Step 3 :** Écrire `mnemo.ts`. Le jeton et l'identifiant du deck sont gardés dans `reglages` (`mnemoJeton`, `mnemoDeck`). Un seul lot par appel ; les mots ne passent à `envoye` que si le nombre de cartes créées vaut deux fois le nombre de mots.
- [ ] **Step 4 :** Relancer : succès. Commit.

### Task 10: Routes du serveur

**Files:**
- Create: `server/src/routes.ts`, `server/test/routes.test.ts`
- Modify: `server/src/index.ts`

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces (toutes sous `/api`) :

| Route | Réponse ou effet |
|---|---|
| `GET /aujourdhui` | `{ articles: Résumé[], videos: Video[], temps: { jour, semaine, total }, proposition, preparationEnCours }` où `Résumé = { id, titre, sujet, palier, dureeMs }`, chaque `temps.x = { ecoute, lecture }` en secondes ; au plus 4 articles `pret`, vidéos du jour non vues |
| `GET /articles/:id` | `Article` complet |
| `POST /articles/:id/lu` `{ touches }` | statut `lu`, `luLe`, `touches` |
| `GET /articles/lus` | `Résumé[]`, du plus récent au plus ancien |
| `POST /mots` `{ articleId, phrase, annotation }` (indices) | crée le mot `attente` (ou renvoie l'existant), lance `envoyerEnAttente` sans attendre ; `{ mot }` ; `400` si l'annotation est `transparent` |
| `GET /mots` | `Mot[]` |
| `POST /temps` `{ type, secondes }` | ajoute au jour courant ; `secondes` plafonné à 60 par appel ; `400` si négatif ou type inconnu |
| `POST /preparer` | lance `preparer.js --ajouter 2` détaché ; `409` si une préparation tourne |
| `GET /reglages`, `PUT /reglages` `{ palier }` | changer de palier remet `palierDepuis` à maintenant |
| `POST /palier/reponse` `{ accepte }` | applique ou non la proposition ; dans les deux cas `palierDepuis` = maintenant |
| `POST /videos/:id/vu` | `vuLe` |
| `GET /erreurs` | les 50 dernières |

  Les fichiers audio sont servis sous `/audio`.

- [ ] **Step 1 :** Tests qui échouent (serveur lancé sur un port libre, base en mémoire, `fetch`) : un test par ligne du tableau, plus :

```ts
test('POST /temps plafonne à 60 s et refuse le négatif', async () => {
  await post('/api/temps', { type: 'ecoute', secondes: 3600 });
  expect((await get('/api/aujourdhui')).temps.jour.ecoute).toBe(60);
  expect((await brut('/api/temps', { type: 'ecoute', secondes: -5 })).status).toBe(400);
});
test('POST /mots deux fois pour le même mot → un seul mot', async () => {});
test('POST /mots répond même si Mnemo est injoignable, le mot est en attente', async () => {});
test('la proposition disparaît après un refus et ne revient qu\'après 5 nouveaux articles', async () => {});
test('GET /aujourdhui ne renvoie jamais plus de 4 articles', async () => {});
```

- [ ] **Step 2 :** Lancer `npm --prefix server test -- routes` : échec.
- [ ] **Step 3 :** Écrire `routes.ts` sous forme `creerRoutes(db, options): Router`, où `options` permet d'injecter `envoyer` et `lancerPreparation` dans les tests. Brancher dans `index.ts`.
- [ ] **Step 4 :** Relancer : succès. Commit.

### Task 11: Interface — liste du jour et pages annexes

**Files:**
- Create: `src/api.ts`, `src/pages/{Aujourdhui,DejaLus,Mots,Reglages}.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: routes de la tâche 10, types de `server/src/types.ts` (`import type`).
- Produces: routes de l'interface `/` (liste du jour), `/article/:id`, `/video/:id`, `/lus`, `/mots`, `/reglages`.

- [ ] **Step 1 :** Écrire `api.ts` : une fonction par route, typée.
- [ ] **Step 2 :** `Aujourdhui` : compteur en tête (écoute et lecture du jour, de la semaine, total, en heures et minutes) ; liste des articles (sujet, titre, durée) et des vidéos ; bouton « Autres articles » qui affiche un indicateur d'attente et recharge la liste toutes les 10 secondes tant que `preparationEnCours` est vrai ; bandeau de proposition de palier avec « Oui » et « Non ». Liste vide : « Rien de prêt pour l'instant », avec le bouton.
- [ ] **Step 3 :** `DejaLus` (liste, lien vers l'article), `Mots` (mot, sens, « envoyé » ou « en attente »), `Reglages` (choix du palier, dernières erreurs).
- [ ] **Step 4 :** Vérifier dans le navigateur, largeur téléphone (375 px) et grand écran, avec le serveur et les articles de la tâche 7 : la liste s'affiche, le compteur correspond à `GET /api/aujourdhui`, la navigation fonctionne. `npm run build` passe. Commit.

### Task 12: Interface — lecteur d'article

**Files:**
- Create: `src/lecteur/{segments,chrono}.ts`, `src/lecteur/{segments,chrono}.test.ts`, `src/lecteur/useLecture.ts`, `src/lecteur/Fiche.tsx`, `src/pages/Article.tsx`

**Interfaces:**
- Produces:
  - `segmenter(phrase: Phrase): { texte: string; annotation: number | null }[]` — la concaténation des `texte` redonne `phrase.texte`.
  - `class Chrono { constructor(envoyer: (type: 'ecoute' | 'lecture', secondes: number) => void, maintenant?: () => number); audio(joue: boolean): void; interaction(): void; visible(v: boolean): void; tic(): void; arreter(): void }` — `tic` est appelé chaque seconde ; l'envoi se fait toutes les 15 secondes cumulées et à l'arrêt.

- [ ] **Step 1 :** Tests qui échouent :

```ts
test('segmenter alterne texte libre et annotations, sans rien perdre', () => {
  const p = { texte: 'The team scored two goals.', annotations: [{ debut: 9, fin: 15 }, { debut: 20, fin: 25 }] } as Phrase;
  expect(segmenter(p)).toEqual([
    { texte: 'The team ', annotation: null }, { texte: 'scored', annotation: 0 },
    { texte: ' two ', annotation: null }, { texte: 'goals', annotation: 1 }, { texte: '.', annotation: null }]);
});
test('audio en lecture → écoute, jamais lecture en même temps', () => {});
test('sans audio, la lecture compte, puis s\'arrête après 60 s sans interaction', () => {
  // 100 tics sans interaction → 60 s de lecture ; interaction() relance le compte
});
test('onglet caché → rien ne compte, même si audio(true) a été signalé', () => {});
test('arreter envoie le reste non encore envoyé', () => {});
```

- [ ] **Step 2 :** Lancer `npm test` : échec.
- [ ] **Step 3 :** Écrire `segments.ts` et `chrono.ts`. Relancer : succès.
- [ ] **Step 4 :** Écrire `useLecture` : un seul élément `<audio>` ; à la fin d'une phrase il passe à la suivante ; expose `jouer`, `pause`, `allerA(n)`, `precedente`, `suivante`, `rejouer`, `vitesse` (0,8 ; 0,9 ; 1), `phraseCourante`, `enLecture`. `enLecture` suit les événements `playing`, `pause`, `waiting` et `ended` de l'élément, pas l'intention.
- [ ] **Step 5 :** Écrire `Article` et `Fiche` : phrase en cours surlignée ; toucher une phrase la lance ; toucher un segment annoté met en pause et ouvre la fiche (mot, prononciation si présente, sens, forme de base, bouton d'écoute du mot seul, « + Mnemo » sauf si `transparent`, qui devient « envoyé » ou « en attente ») ; lien « Article d'origine » ; à la fin de la dernière phrase, `POST /articles/:id/lu` avec le nombre d'annotations distinctes touchées. Le `Chrono` reçoit `enLecture`, les touchers et défilements, et `document.visibilityState`.
- [ ] **Step 6 :** Vérifier dans le navigateur, sur PC puis sur le téléphone de Luca : la voix démarre au toucher, le surlignage suit, la fiche s'ouvre, un mot part vers Mnemo, le compteur augmente d'autant de secondes qu'écoutées. Commit.

### Task 13: Interface — lecteur de vidéo

**Files:**
- Create: `src/pages/Video.tsx`

**Interfaces:**
- Consumes: `Chrono` (tâche 12), `POST /videos/:id/vu`.

- [ ] **Step 1 :** Écrire `Video` avec l'API IFrame de YouTube : paramètres `cc_load_policy=1` et `cc_lang_pref=en` ; `Chrono.audio(true)` seulement dans l'état `PLAYING` ; `vu` envoyé à l'état `ENDED`.
- [ ] **Step 2 :** Vérifier dans le navigateur avec une vidéo de `sources.json` : sous-titres anglais affichés, compteur d'écoute qui avance pendant la lecture et s'arrête en pause, vidéo retirée de la liste une fois vue. Commit.

### Task 14: Mise en service sur le conteneur

Chaque commande sur le serveur est montrée à Luca avec sa sortie. Rien n'est lancé sans son accord.

**Files:**
- Create: `deploy/anglais.service`, `deploy/anglais-preparation.service`, `deploy/anglais-preparation.timer`, `deploy/deploy.sh`

**Interfaces:**
- Produces: le service `anglais.service` (`node server/dist/index.js`, `EnvironmentFile`, redémarrage automatique) et un minuteur qui lance `node server/dist/preparer.js` chaque nuit à 4 h.

- [ ] **Step 1 :** Écrire les trois unités systemd et `deploy.sh`, sur le modèle de `Mnemo/deploy.sh` : tests, construction, copie de l'interface vers le dossier servi, sauvegarde de la base avant redémarrage, redémarrage, vérification de `/api/sante`.
- [ ] **Step 2 :** Sur le conteneur : installer la CLI `claude` ; Luca lance lui-même `claude setup-token` et place le jeton, l'adresse de Mnemo et ses identifiants dans le fichier d'environnement (droits `600`).
- [ ] **Step 3 :** Déployer. Montrer `systemctl status anglais`, `journalctl -u anglais -n 20`, `curl localhost:3010/api/sante` et `systemctl list-timers anglais-preparation.timer`.
- [ ] **Step 4 :** Lancer une préparation à la main (`systemctl start anglais-preparation`) et montrer son journal : 4 articles prêts, durée totale.
- [ ] **Step 5 :** Essai de bout en bout avec Luca, sur PC et sur téléphone par Tailscale : lire un article, envoyer un mot, vérifier qu'il apparaît dans le deck « Anglais » de Mnemo, regarder une vidéo, constater le compteur.
- [ ] **Step 6 :** Mettre à jour `CLAUDE.md` : commandes (construire, tester, lancer un seul test, déployer), architecture en quelques lignes, état de la brique 1. Rester sous 200 lignes. Commit.
