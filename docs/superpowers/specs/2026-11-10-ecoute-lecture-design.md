# Brique 1 — Écoute et lecture : conception

Date : 10 novembre 2026. Statut : à valider par Luca.

Références : `CLAUDE.md` (décisions et principes) et
`reports/Apprendre une langue chiffres vérifiés.md` (le « rapport »).

## Intention

Luca veut atteindre un anglais C1 puis C2. Aujourd'hui il ne lit, n'écoute et ne regarde rien
en anglais : il comprend 30 à 40 % d'un article de presse et environ 15 % d'une vidéo (niveau
auto-estimé, autour de A2, plus bas à l'oreille).

Le rapport dit que le gros des heures d'apprentissage vient de l'écoute et de la lecture de
contenus compris à environ 95 %, et que lire en écoutant est la condition la plus efficace
pour retenir les expressions. Les contenus de natifs sont hors de portée pour lui.

Cette brique lui donne donc, chaque jour, de quoi lire et écouter **sur ses sujets et à son
niveau**, et compte le temps passé. C'est la première des quatre briques de l'app (voir
`CLAUDE.md`) ; elle doit être utilisable seule.

## Objectifs

1. Chaque jour, une courte liste de contenus prêts : des articles réels sur ses sujets,
   réécrits à son niveau, et des vidéos YouTube pour apprenants.
2. Lire un article pendant qu'une voix le lit, phrase par phrase, avec la phrase en cours
   surlignée.
3. Toucher un mot pour voir son sens dans la phrase, sa prononciation et sa syllabe accentuée.
4. Envoyer un mot vers Mnemo en un geste, sous forme de cartes de révision.
5. Compter automatiquement le temps d'écoute et de lecture, par jour et au total.
6. Faire monter la difficulté des articles avec ses progrès.

## Non-objectifs (pour cette brique)

- Les sessions à durée choisie, l'oral, la correction, la progression par acquis : briques 2 à 4.
- La révision espacée : elle reste dans Mnemo.
- Les mots cliquables dans les sous-titres des vidéos, et les contenus de natifs avec double
  sous-titre : plus tard, vers B1-B2.
- Comptes, inscription, multi-utilisateur, mode hors ligne.
- L'import manuel de fichiers (vidéos, ebooks, podcasts) : Luca n'en a pas.

## Ce qui ferait échouer la brique même si elle fonctionne

- Des contenus trop durs ou hors de ses sujets : il n'ouvrira plus l'app.
- Une liste du jour trop longue pour être terminée.
- La traduction de phrases entières affichée par défaut : elle supprime l'effort de comprendre.
- Des points, séries ou récompenses à la place du compteur d'heures (voir « À ne pas
  construire » dans `CLAUDE.md`).
- Une syllabe accentuée fausse : l'accent de mot est la priorité n° 1 de prononciation pour un
  francophone selon le rapport ; mieux vaut ne rien afficher qu'afficher faux.

## Contraintes

- Un seul utilisateur. Application web utilisée sur PC et sur téléphone, hébergée sur un
  serveur de Luca joignable par Tailscale.
- Aucun service payant pour la voix. Coût d'IA le plus bas possible.
- Mnemo ne doit pas être modifié.
- Interface en français, contenu d'apprentissage en anglais.

## Approches

### D'où viennent les contenus (choisi par Luca)

| Approche | Principe | Limite |
|---|---|---|
| A. Contenus pour apprenants | Lister des chaînes et sites faits pour le niveau A2 | Peu de foot ou d'histoires mystérieuses à ce niveau |
| B. Articles réels réécrits | Une IA réécrit de vrais articles à son niveau, une voix les lit | Coût d'IA par article ; texte un peu moins naturel |
| C. Contenus de natifs avec aides | Originaux, double sous-titre, traduction au clic | Illisible à 15-40 % de compréhension |

**Retenu : B pour les articles, A pour les vidéos, C plus tard.** B est la seule approche qui
donne dès maintenant du contenu compréhensible sur ses sujets.

### La voix (choix de Claude, après essai d'écoute validé par Luca)

| Approche | Pour | Contre |
|---|---|---|
| Voix du navigateur | Rien à installer | Qualité inégale, différente entre PC et téléphone |
| Service payant (Azure, Google) | Très naturel | Compte, clé, dépendance ; Luca veut éviter de payer |
| Kokoro, open source, sur le serveur | Gratuite, jugée bonne à l'écoute, s'installe comme une dépendance du serveur Node (`kokoro-js`) | Modèle de 330 Mo à charger ; vitesse du serveur non mesurée |
| Piper, open source, sur le serveur | Gratuite, jugée très bonne à l'écoute, très légère | Demande Python en plus de Node |

**Retenu : Kokoro**, parce qu'elle tourne dans le même programme que le serveur. Mesuré sur
le PC de Luca : 20 secondes d'audio produites en 7 à 8 secondes. **Repli : Piper** si le
serveur est trop lent.

### Le lien avec Mnemo (choix de Claude)

Mnemo expose déjà `POST /api/auth/login` (jeton valable 30 jours), `POST /api/decks` et
`POST /api/cards/batch`. L'app se connecte avec l'adresse et le mot de passe de Luca, rangés
dans sa configuration, et se reconnecte quand le jeton expire. Écarté : ajouter une API à
Mnemo (inutile) et passer par le connecteur Claude (réservé à Claude).

## Ce que Luca voit

```
┌─────────────────────────────────────────┐
│  Aujourd'hui            Écoute : 3 h 20 │
│                         Lecture : 1 h 05│
├─────────────────────────────────────────┤
│ ⚽ Arsenal win the derby          4 min │
│ ⚽ Why Mbappé changed position    5 min │
│ 🗳 A new law on housing           4 min │
│ ▶ Vidéo : A day in London (A2)   8 min │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ▶ ⏸  0:42 / 4:10        vitesse 0,9×   │
│                                         │
│ Arsenal won the match on Sunday.        │
│ ▓The team scored two goals in the▓      │
│ ▓second half.▓  The manager was...      │
│        ┌──────────────────────┐         │
│        │ scored  /skɔːrd/     │         │
│        │ a marqué (to score)  │         │
│        │ [ + Mnemo ]          │         │
│        └──────────────────────┘         │
└─────────────────────────────────────────┘
```

Trois écrans : la liste du jour, le lecteur d'article, le lecteur de vidéo. Plus une page de
réglages (niveau, sujets) et la liste des mots envoyés ou en attente.

## Fonctionnement

### Préparation des contenus

Une tâche tourne chaque nuit sur le serveur, et à la demande (bouton « Autres articles ») :

1. Elle lit les flux RSS de sites d'actualité en anglais, classés par sujet.
2. Elle choisit les articles selon l'ordre d'intérêt de Luca : foot d'abord, puis politique,
   IA, histoires mystérieuses, économie, développement personnel, culture. Proposition :
   4 articles par jour, dont 2 de foot, les autres sujets à tour de rôle.
3. Elle récupère le texte complet de chaque article.
4. Elle demande à l'IA de le réécrire au niveau courant (voir plus bas) en 250 à 450 mots,
   découpé en phrases. L'IA annote **tous les mots** du texte, sauf les mots-outils les plus
   élémentaires (*the*, *a*, *is*…) : sens en français **dans cette phrase**, forme de base,
   et si le mot est transparent pour un francophone (*important*, *position*). À ce niveau,
   n'importe quel mot peut être inconnu : rien n'est demandé à l'IA au moment du toucher.
   Elle repère aussi les **expressions** (verbes à particule comme *gave up*, collocations
   comme *make a decision*) et les annote comme une seule unité.
5. Elle génère l'audio de chaque phrase et le garde sur le disque.
6. Elle ajoute 1 ou 2 vidéos récentes, prises dans une liste de chaînes YouTube pour
   apprenants (flux RSS public de chaque chaîne, sans clé).

Un article déjà préparé n'est jamais régénéré. Si l'IA ou la voix échoue, l'article est
écarté et l'erreur est visible dans les réglages ; la liste du jour montre ce qui est prêt.

### La liste du jour ne s'allonge pas

- La liste montre au plus 4 articles non lus et les vidéos du jour.
- La tâche de nuit **complète jusqu'à 4 non lus** : si Luca n'a rien lu, elle ne prépare
  rien de plus (pas d'IA gaspillée).
- Un article non lu depuis 7 jours quitte la liste (l'actualité a vieilli).
- « Autres articles » en prépare 2 de plus, qui s'ajoutent à la liste ; l'article apparaît
  quand il est prêt, avec un indicateur d'attente.
- Les articles lus restent accessibles dans une page « Déjà lus », pour les réécouter.

### Niveau des articles

Six paliers : A2, A2+, B1, B1+, B2, original (texte non réécrit). Départ : A2.

Le rapport demande 95 à 98 % de mots connus. L'app mesure donc la part de mots touchés
(inconnus) dans chaque article lu jusqu'au bout :

- moins de 2 % sur les 5 derniers articles : l'app propose de monter d'un palier ;
- plus de 5 % : elle propose de descendre.

C'est une proposition que Luca accepte ou refuse, jamais un changement automatique. Il peut
aussi changer de palier à la main. La règle est une approximation (on ne touche pas tous les
mots inconnus) : à réviser à l'usage.

### Voix et accent

Voix américaine par défaut ; un article sur quatre est lu par une voix britannique. Les voix
exactes sont celles de l'essai (`af_heart`, `am_michael`, `bf_emma`), à faire tourner.
Vitesse réglable de 0,8× à 1×, par le lecteur du navigateur.

### Lecteur d'article

- Lecture, pause, phrase précédente et suivante, réécoute de la phrase en cours.
- La phrase en cours est surlignée ; toucher une phrase lance sa lecture.
- Toucher un mot ouvre sa fiche et met l'audio en pause. Si le mot fait partie d'une
  expression repérée, c'est la fiche de l'expression entière qui s'ouvre.
- Pas de traduction de phrase entière. Un lien vers l'article d'origine est disponible.

### Fiche d'un mot

- Le mot, son sens en français dans cette phrase, sa forme de base (*scored* → *to score*).
- Sa prononciation américaine en alphabet phonétique, avec la marque ˈ placée devant la
  syllabe accentuée (/ˈbjutəfəl/), tirée d'un **dictionnaire de prononciation** (CMU
  Pronouncing Dictionary) et non de l'IA. On n'essaie pas de découper l'orthographe en
  syllabes (*BEAU-ti-ful*) : ce découpage se déduit mal et pourrait être faux.
- Si le mot n'est pas dans le dictionnaire, ou s'il a plusieurs accentuations possibles
  (*REcord* / *reCORD*), aucune prononciation écrite n'est affichée.
- Un bouton pour réécouter le mot seul, dit par la voix de l'article.
- Le bouton « + Mnemo », absent pour les mots transparents.

### Envoi vers Mnemo

Chaque mot envoyé crée deux cartes dans un deck « Anglais » (créé s'il manque), avec les
étiquettes `anglais` et le sujet de l'article :

| Carte | Question | Réponse |
|---|---|---|
| Comprendre | La phrase de l'article, le mot entre guillemets : que veut dire « scored » ? | a marqué — score /skɔr/ |
| Produire | *The team ___ two goals in the second half.* (a marqué) | scored |

La prononciation est écrite comme dans la fiche (avec la marque ˈ), puisque Mnemo n'accepte
que du texte ; elle est omise quand la fiche n'en affiche pas. Une expression donne les
mêmes deux cartes, avec l'expression entière. Le rapport demande d'interroger dans les deux
sens, d'où les deux cartes.

Un mot déjà envoyé n'est pas renvoyé. Si Mnemo ne répond pas, le mot reste « en attente » et
part au prochain envoi réussi.

### Vidéos

Lecteur YouTube intégré, sous-titres anglais activés. Le temps de lecture réel est compté
comme de l'écoute. Aucun mot cliquable dans cette version.

### Compteur

- Écoute : temps pendant lequel un audio ou une vidéo joue réellement.
- Lecture : temps passé sur un article ouvert sans audio, arrêté après 60 secondes sans
  interaction.
- Affiché sur la liste du jour : aujourd'hui, cette semaine, total.

## Technique

Même socle que Mnemo, que Luca connaît et sait déployer :

- Interface : React, Vite, Tailwind, TypeScript.
- Serveur : Express, SQLite (`better-sqlite3`), qui sert aussi l'interface. **Sans Docker** :
  un service systemd qui lance Node directement, comme Mnemo en production (son `deploy.sh`
  l'explique ; le `docker-compose.yml` de Mnemo n'est pas utilisé). Node 22 ou plus récent.
- Pas de connexion par compte : l'accès est limité par Tailscale.
- IA de réécriture (choisi par Luca) : **Claude par son abonnement, seul**. L'app lance
  elle-même l'outil `claude` installé dans son conteneur, avec un jeton d'abonnement
  (`CLAUDE_CODE_OAUTH_TOKEN`, créé par `claude setup-token`), comme le fait Mnemo dans
  `server/src/routes/gemini.ts` — à recopier, pas à appeler : la route de Mnemo est
  verrouillée sur la fabrication de cartes. Pas de fournisseur de secours : si la
  réécriture échoue, l'article est écarté et l'erreur affichée.
- Hébergement (choisi par Luca) : un conteneur LXC sur son Proxmox (22 threads, 30 Gio de
  mémoire dont 16 libres le 10/11/2026). Ressources proposées : **4 cœurs, 4 Gio de mémoire,
  1 Gio de swap, 16 Gio de disque**, Debian, non privilégié, sans imbrication (pas de Docker).
  - Mesuré sur le PC de Luca : Kokoro monte à 1,1 Go de mémoire et consomme environ
    2,4 secondes de processeur par seconde d'audio. À 4 cœurs, un article de 4 minutes
    demande donc environ 2 min 30 ; à 2 cœurs, la génération serait plus lente que la lecture.
  - Disque : environ 3 Mo d'audio par article, soit 4 à 5 Go par an à 4 articles par jour.
  - La voix ne doit occuper la mémoire que pendant la préparation des articles, pas en continu.
- Données à conserver : articles préparés (source, sujet, palier, phrases, sens des mots,
  fichiers audio), vidéos proposées, mots envoyés ou en attente, temps par jour, réglages.

## Choix de Claude à vérifier par Luca

1. Kokoro plutôt que Piper pour la voix.
2. Accent américain par défaut, britannique un article sur quatre.
3. Quatre articles par jour, dont deux de foot, plus une ou deux vidéos.
4. Deux cartes Mnemo par mot (comprendre et produire).
5. La règle des 2 % et 5 % pour proposer de changer de palier.
8. Tous les mots sont touchables et annotés d'avance ; les expressions forment une unité.
9. La prononciation s'affiche en alphabet phonétique avec la marque ˈ, pas en majuscules.
10. La liste ne dépasse jamais 4 articles non lus ; un non-lu de plus de 7 jours disparaît.
11. Kokoro est jugée trop lente si elle met plus de temps à générer un article qu'à le lire.
6. Pas de secours si Claude échoue : l'article est écarté.
7. Connexion à Mnemo par adresse et mot de passe rangés dans la configuration de l'app.

## Laissé au constructeur

- Les flux RSS exacts par sujet et la liste des chaînes YouTube pour apprenants : à chercher
  et à vérifier (existence, niveau réel) au moment de construire.
- L'extraction du texte complet d'un article depuis sa page.
- Le texte exact de la consigne donnée à l'IA et la forme de sa réponse.
- Le schéma de la base, le découpage du code, le format des fichiers audio.
- La forme exacte des cartes attendue par `POST /api/cards/batch` : à lire dans le code de
  Mnemo (`C:\Users\lucaa\Documents\Projet\Mnemo\server\src\routes\cards.ts`).
- La création du conteneur LXC, son accès par Tailscale et l'adresse de Mnemo vue depuis
  lui : à régler avec Luca au début du chantier, puisque la mesure de la voix se fait
  dessus. S'inspirer du déploiement de Mnemo (`deploy.sh`).

## Comment savoir que ça marche

- Tests automatiques sur ce qui contient de la logique : règle de changement de palier,
  comptage du temps, mise en forme de la syllabe accentuée, fabrication des deux cartes, file
  des mots en attente.
- Essai de bout en bout : la tâche prépare un article réel, il se lit avec la voix et le
  surlignage sur PC et sur téléphone, un mot envoyé apparaît dans le deck « Anglais » de
  Mnemo, et le compteur augmente.
- **Première étape du chantier**, avant tout le reste : mesurer sur le serveur le temps de
  génération de la voix pour un article. Si Kokoro met plus longtemps que la durée de
  l'audio produit, on passe à Piper avant d'écrire le module de voix.

## À côté de cette brique

Le rapport place en tête les 2 000 à 3 000 mots les plus fréquents. Un deck Mnemo construit
à partir d'une liste de fréquence, sans les mots transparents, peut être créé à part, sans
attendre l'app.
