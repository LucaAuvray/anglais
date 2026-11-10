# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Application pour apprendre l'anglais le plus efficacement possible (meilleur ratio progression / heure),
conçue à partir de nos recherches et non d'intuitions.

- **Utilisateur** : Luca, adulte francophone autodidacte vivant en France, qui vise C1 puis C2
  en lecture, écriture, écoute et oral.
- **Niveau de départ (auto-estimé, à mesurer avec EF SET)** : comprend 30 à 40 % d'un article
  de presse en anglais et environ 15 % d'une vidéo sans sous-titres français. Soit autour de
  A2 en lecture et plus bas en écoute : les contenus de natifs sont hors de portée au départ.
- **Cible réaliste** : C2 fonctionnel avec un léger accent, pas « indiscernable d'un natif ».
- **État** : brique 1 sur la branche `brique-1-ecoute-lecture` (plan : `docs/superpowers/plans/`).
  Ne rien supposer au-delà : trancher avec Luca. Garder ce fichier **sous 200 lignes**.

## Commandes

- Interface : `npm run dev` (port 3000, relaie `/api` et `/audio` vers 3010), `npm run build`, `npm test`.
- Serveur : `npm --prefix server run dev`, `npm --prefix server test`, un seul test :
  `npm --prefix server test -- test/db.test.ts -t "<nom>"`, types : `npm --prefix server run build`,
  préparation à la main : `npm --prefix server run preparer` (`-- --ajouter 2`). Voix réelle : `TEST_VOIX=1`.
- Node 26 exécute le TypeScript du serveur tel quel (pas de compilation) : imports relatifs
  avec l'extension `.ts`, syntaxe effaçable seulement (pas d'`enum`). Base : `node:sqlite`.
- Déployer : `deploy/deploy.sh` depuis le PC sous Git Bash (dépôt propre exigé, déploie HEAD).

## Architecture (brique 1)

- `server/src/preparer.ts`, lancé par le minuteur de 4 h ou par « Autres articles » : flux
  (`sources.json`, téléchargement par curl) → texte (Readability) → réécriture et annotations
  par la CLI `claude` (`ia/`) → audio Kokoro des phrases et des mots (`voix.ts`) → SQLite.
- `server/src/index.ts` et `routes.ts` : API sous `/api`, mp3 sous `/audio`, interface construite
  (`STATIC_DIR`). `mnemo.ts` : deux cartes par mot, renvoi des mots en attente.
- `src/pages/` : écrans ; `src/lecteur/` : découpage des phrases, chrono, lecteur audio, fiche.
- Sur le CT : code `/opt/anglais`, données `/var/lib/anglais`, config `/etc/anglais.env` (600).

## Sources de vérité

| Fichier | Rôle |
|---|---|
| `reports/Apprendre une langue chiffres vérifiés.md` | **Référence.** Rapport final, chiffres vérifiés en novembre 2026. |
| `reports/Apprendre une langue efficacement.md` | Première version, remplacée. Ne pas s'en servir pour un chiffre. |
| `research_notes/Apprendre une langue chiffres vérifiés/` | Détail des vérifications, avec statut par chiffre. |
| `research_notes/Apprendre une langue efficacement/` | Notes d'origine (plus larges, moins fiables). |

Règles d'usage :
- Toute fonctionnalité pédagogique doit se rattacher à une section du rapport de référence.
  Si rien ne la soutient, le dire et la traiter comme une hypothèse, pas comme un acquis.
- Le rapport contient deux tableaux à consulter avant de citer un chiffre : les 23 corrections
  (« Vingt-trois corrections… ») et les chiffres non vérifiés (« Une vingtaine de chiffres… »).
  Ne jamais afficher à l'utilisateur de l'app un chiffre de la seconde liste.
- Les durées (C1 en 6-9 mois, C2 en 12-18 mois depuis B1 à 2 h/jour) sont des calculs à partir
  des heures Cambridge, avec un coefficient 1,5 pour l'autodidacte qui est une hypothèse.
  L'app ne promet pas de date : elle affiche des heures faites et des niveaux mesurés.

## Principes de conception tirés du rapport

Ce sont des contraintes de produit. Si une idée de fonctionnalité en contredit un, le signaler.

### 1. Le goulot est le transfert vers la parole spontanée
- Ce qui réussit en exercice contrôlé se transfère mal à l'usage libre (prononciation : 0,96 en
  contrôlé contre 0,37 en spontané). C'est aussi le point faible des Français (lecture 555,
  oral 456 à l'EF EPI 2025).
- Chaque séance se termine par une production libre qui réemploie ce qui vient d'être travaillé.
- La majorité du temps va à l'écoute et à la parole, pas à la lecture ni à la grammaire écrite.

### 2. Se tester et espacer, jamais relire
- L'utilisateur produit la réponse avant de la voir. Pas de relecture passive ni de
  reconnaissance (QCM) comme mode principal.
- Révision espacée avec FSRS : rétention visée 90 % (jamais au-delà de 97 %), étapes
  d'apprentissage de moins d'un jour. Utiliser une implémentation FSRS existante, ne pas
  écrire d'algorithme maison.
- Charge : 10 à 20 nouvelles cartes par jour, 20 à 30 minutes de révision, moins d'ajouts dès
  qu'un arriéré apparaît (règle de pilotage, non testée telle quelle).

### 3. Une bonne carte
- Une phrase tirée de l'input de l'utilisateur, avec audio natif et accent de mot marqué.
- Interrogée dans le sens français → anglais autant qu'anglais → français.
- À mettre en cartes : verbes à particule, collocations, indénombrables, prépositions régies,
  faux amis, erreurs récurrentes de l'utilisateur.
- À exclure : les cognats transparents (gratuits pour un francophone).

### 4. L'input fournit le volume
- Viser environ 95 % de mots connus pour l'écoute et la lecture assistée, 98 % pour la lecture
  autonome confortable. Le 98 % est une convention, pas un seuil dur.
- Progression : texte + audio en même temps, puis vidéo en VO sous-titrée en anglais, puis sans.
- Contenu « étroit » : rester sur une même série, un même auteur ou un même domaine.
- L'écoute doit être attentive : l'anglais en fond sonore ne compte pas.

### 5. Production et correction
- Corriger en signalant l'erreur sans donner la forme correcte, pour que l'utilisateur se
  corrige lui-même (les incitations font mieux que les reformulations).
- Routine d'écriture : écrire sans aide, recevoir la liste des erreurs avec leur règle, se
  corriger, puis voir une version « native » ; les erreurs récurrentes deviennent des cartes.
- Fluidité : répéter la même tâche orale 3 à 5 fois (technique 4/3/2), réécrire un texte une
  fois, une semaine plus tard.

### 6. IA : garde-fous obligatoires
- L'IA vocale sert à faire parler. Elle n'améliore pas la compréhension, qui vient de l'input.
- Il faut parler à l'IA, pas lui écrire, pour progresser à l'oral.
- Une IA qui donne la réponse fait baisser les résultats une fois retirée (−17 % dans un essai
  en maths). L'IA de l'app ne fournit jamais directement la réponse à un exercice.
- Les LLM sont peu fiables sur les erreurs contextuelles (articles, prépositions,
  indénombrables), qui sont celles des francophones : ne pas présenter leurs explications
  grammaticales comme certaines.

### 7. Grammaire et prononciation : doses courtes et ciblées
- Grammaire explicite en séquences de 10 à 20 minutes sur un contraste français / anglais, puis
  repérage dans l'input et réemploi en production. Jamais l'activité principale.
- Contrastes prioritaires : present perfect / prétérit, *for* / *since*, articles génériques,
  indénombrables (*informations*), prépositions régies (*depend of*), pronoms, auxiliaires.
- Ordre de travail en prononciation : accent de mot et rythme, puis /ɪ/–/iː/, puis /h/, puis
  réduction des voyelles ; le *th* en dernier.
- L'accent de mot s'apprend avec chaque mot (les francophones l'entendent mal spontanément).
- Entraînement de l'oreille (HVPT) : identifier des sons dits par 2 à 6 voix, retour immédiat,
  explication articulatoire, séances courtes, 4 à 8 séances par contraste.

### 8. Répartition et mesure
- Quatre volets à parts à peu près égales, penchés vers l'oral : input centré sur le sens,
  production centrée sur le sens, étude de la langue, fluidité.
- Le meilleur indicateur est un compteur : heures d'écoute, minutes de parole corrigée,
  révisions faites. Les afficher plutôt que des points ou des séries.
- Le niveau se mesure par compétence (un C1 en lecture arrive bien avant un C1 à l'oral) et par
  des tests externes (EF SET : B2 51-60, C1 61-70, C2 71-100).
- Les blocs intensifs servent surtout de B1 à B2.

### 9. Hygiène de vie : ce que l'app peut encourager
- Une courte session de cartes avant le coucher, une révision le lendemain matin.
- Ne jamais pousser à veiller ni à sacrifier du sommeil (pas de rappels tardifs insistants).
- Plans « si… alors… » pour ancrer l'habitude ; une occasion ratée ne casse rien.
- Exposition progressive à l'oral pour limiter l'anxiété : s'enregistrer seul, puis IA, puis humain.
- Pas de notifications pendant une session.

## À ne pas construire

Fonctionnalités sans preuve ou contredites par le rapport :
- Styles d'apprentissage (visuel, auditif), apprentissage pendant le sommeil, jeux de
  « brain training », entraînement de la mémoire de travail.
- Gamification comme moteur principal : les applications gamifiées plafonnent vers B1 en
  compréhension, sans production libre.
- Relecture, surlignage, mnémotechnique des mots-clés comme modes d'étude.
- Conseils d'exercice physique « pendant » l'étude, de compléments ou de nootropiques.
- Promesses chiffrées (« C1 en 3 mois », « 30 % de révisions en moins »).

## Décisions prises

- Le par cœur (vocabulaire, collocations, erreurs récurrentes) se révise dans **Mnemo**, pas
  dans l'app. L'app ne réimplémente pas de révision espacée.
- L'app fonctionne par **sessions à durée choisie** (5 à 30 minutes), lancées quand
  l'utilisateur le veut, avec un système de progression et de suivi des acquis.
- L'écoute et la lecture en volume se font **dans l'app** : lecteur avec sous-titres anglais,
  textes avec audio, mots et expressions envoyés vers Mnemo. L'app compte ces heures.
- **Usage personnel** : un seul utilisateur (Luca). Pas de comptes, pas d'inscription, pas de
  gestion multi-utilisateur. Les contenus sont ceux qu'il importe lui-même (fichiers, liens,
  podcasts, ebooks). Ne rien construire « au cas où » l'app deviendrait publique.
- **Application web** utilisée sur PC et sur téléphone, dans le navigateur, hébergée sur un
  serveur Tailscale de Luca. Un seul code pour les deux appareils ; l'interface doit être
  pensée pour le téléphone autant que pour le grand écran. Pas de mode hors ligne prévu.
- **Ordre de construction**, une brique à la fois, chacune utilisable une fois finie :
  1. écoute et lecture (import, lecteur sous-titré, mots vers Mnemo, compteur d'heures) ;
  2. sessions d'oral avec IA ; 3. progression et suivi ; 4. prononciation, grammaire, écriture.
- **L'app propose les contenus** : Luca ne consomme rien en anglais aujourd'hui, un lecteur
  vide à remplir soi-même ne servirait pas. Source principale : YouTube (intégrable,
  sous-titres anglais), plus des articles. Ses centres d'intérêt, du plus au moins suivi :
  foot (articles), politique, IA, histoires et anecdotes mystérieuses, économie,
  développement personnel (« être plus intelligent »), culture.
- **Contenus de la brique 1** : de vrais articles sur ses sujets, réécrits par une IA à son
  niveau, lus à voix haute pendant la lecture, mots cliquables vers Mnemo ; la difficulté monte
  avec ses progrès jusqu'aux articles d'origine. Pour les vidéos, des chaînes YouTube pour
  apprenants au départ. Les contenus de natifs avec aides (double sous-titre) viendront vers B1-B2.
- Priorité de vocabulaire au départ : les 2 000 à 3 000 mots les plus fréquents, dans Mnemo.
- **Voix** : open source, gratuite, générée sur le serveur (essai d'écoute validé par Luca le
  10/11/2026). Pas de voix payante. Retenu : **Kokoro** (sur le CT : 19,4 s d'audio en 12,6 s, pic 759 Mo).
- **Accent** : américain comme modèle principal (prononciation affichée, voix par défaut) ;
  une voix britannique lit régulièrement des articles, pour habituer l'oreille aux deux.
- **Lien Mnemo** : ses routes existantes, sans le modifier ; code : `C:\Users\lucaa\Documents\Projet\Mnemo`.
- **Socle technique**, le même que Mnemo : React, Vite, Tailwind et TypeScript pour
  l'interface ; Express et SQLite pour le serveur. Hébergé dans un conteneur LXC sur le
  Proxmox de Luca (4 cœurs, 4 Gio, 16 Gio de disque), en service systemd, **sans Docker**,
  comme Mnemo en production. Pas de connexion par compte. Conteneur : CT 114 `anglais-luca`
  sur le Proxmox `Pve`, Debian 13, Node 26 dans `/opt/node26` (liens dans `/usr/local/bin`),
  ffmpeg, Tailscale. Ses limites sont des plafonds. Mnemo vu du CT : `http://100.106.70.83`.
- **IA** : Claude par l'abonnement de Luca (outil `claude` lancé par le serveur), sans secours.
- Conception de la brique 1 : `docs/superpowers/specs/2026-11-10-ecoute-lecture-design.md`.

## Décisions ouvertes

À trancher avec Luca le moment venu :
- Briques 2 à 4 : tout reste à concevoir, une brique à la fois (reconnaissance vocale et
  voix pour l'oral, forme des sessions, règles de progression).

## Conventions

- Interface et échanges en français, avec tous les accents ; le contenu d'apprentissage est en anglais.
- `reports/` et `research_notes/` sont des documents de référence : ne pas les modifier pour
  faire coller une fonctionnalité. Une nouvelle recherche va dans un nouveau dossier.
