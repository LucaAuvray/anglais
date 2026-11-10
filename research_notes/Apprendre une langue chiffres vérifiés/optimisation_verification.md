# Vérification des chiffres non vérifiés (tag [M]) : sciences de l'apprentissage, sommeil, attention, motivation, appliquées à l'apprentissage de l'anglais

Objet : revérifier les chiffres tagués [M] (ou non sourcés) de `research_notes/Apprendre une langue efficacement/optimisation_cerveau.md` et des sections du rapport « Se tester à intervalles croissants… » et « Sommeil, attention et habitudes décident de ce qui reste ». Vérification faite le 10/11/2026.

Méthode et légende.
- Les DOI des notes et du rapport (105 au total) ont été résolus via l'API Crossref (titre, premier auteur, année, revue). Les résumés ont été récupérés en lot via PubMed (E-utilities) pour les 74 articles indexés, et via OpenAlex, les pages éditeurs ou des communiqués pour les autres.
- Statuts : **CONFIRMÉ** (chiffre retrouvé tel quel), **CORRIGÉ** (chiffre ou détail inexact, valeur correcte donnée), **NUANCÉ** (chiffre exact mais interprétation à ajuster), **CONTREDIT** (la source dit autre chose), **NON VÉRIFIÉ** (source primaire inaccessible ; seulement du secondaire, ou rien).
- Niveau de lecture : « résumé » = seul l'abstract a été lu ; « texte intégral » = article lu (PMC) ; « secondaire » = chiffre repris d'un communiqué, d'un blog ou d'une revue tierce.
- Limite technique : les PDF n'ont pas pu être lus (aucun extracteur de texte disponible), donc aucun tableau de résultats issu d'un PDF n'a été consulté (Cepeda 2008, Karpicke 2008 SOM, Sana 2013, Symons 1997).

---

## 1. Se tester, espacer, entrelacer, auto-référence : les chiffres du rapport tiennent-ils ?

### Takeaway
Les chiffres centraux tiennent. Karpicke & Roediger 2008 donnent environ 80 % contre 36 % et 33 % à une semaine (N = 40). Yang 2021 donne g = 0,499. Brunmair & Richter 2019 donnent g = 0,42 au global et −0,39 pour les mots. Il y a trois corrections. Cepeda 2008 dit « 20 à 40 % du délai pour 1 semaine, 5 à 10 % pour 1 an », et non « environ 20 % puis 5 % ». Le g = −0,39 de Brunmair concerne l'apprentissage inductif de catégories avec des mots comme matériel, pas « les listes de vocabulaire » en général. Le d ≈ 0,5 de Symons & Johnson n'a pas été retrouvé : une source secondaire donne 0,45.

### Cited Findings
**Récupération (testing effect)**
- **Karpicke & Roediger 2008 (Science 319:966)** — Notes et rapport : environ 80 % contre environ 35 % à une semaine. Trouvé : avec des tests répétés, y compris sur les mots déjà réussis, « about 80 percent » des paires sont rappelées au test final. Quand le test s'arrête dès qu'un mot est réussi, « only 36 percent and 33 percent », selon que l'étude continue ou non. 40 étudiants, 10 par groupe, paires swahili–anglais. L'abstract confirme que « repeated studying after learning had no effect on delayed recall, but repeated testing produced a large positive effect ». **CONFIRMÉ.** Qualité : expérience princeps très répliquée, mais petit N (10 par groupe) et plan inter-sujets. Soderstrom et al. ont objecté que les différences d'espacement entre items pouvaient expliquer une partie de l'absence d'effet de la réétude — [Communiqué Purdue 2008](https://www.purdue.edu/uns/x/2008a/080214KarpickeTest.html) ; [résumé PubMed](https://pubmed.ncbi.nlm.nih.gov/18276894/) ; [DOI 10.1126/science.1152408](https://doi.org/10.1126/science.1152408) (résout vers le bon article) ; [Soderstrom et al., PDF Bjork Lab](https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2016/11/soderstorm_kerr.pdf)
- **Roediger & Karpicke 2006 (Psych Sci)** — Notes : environ 61 % contre 40 % à une semaine. Trouvé : l'abstract confirme le croisement. À 5 min, la réétude gagne ; aux tests différés (2 jours, 1 semaine), le test « produced substantially greater retention ». La réétude augmentait aussi la confiance des étudiants. **Direction CONFIRMÉE, valeurs 61 % et 40 % NON VÉRIFIÉES** (résumé seul) — [PubMed 16507066](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- **Rowland 2014 (Psych Bull)** — L'abstract ne donne pas de g, mais confirme que les tests en rappel donnent un bénéfice plus grand que les tests de reconnaissance. Les g = 0,50, 0,69 (≥ 1 jour) et 0,41 (même jour) restent ceux de la source secondaire déjà citée dans les notes. **NON REVÉRIFIÉ au-delà du secondaire** — [PubMed 25150680](https://pubmed.ncbi.nlm.nih.gov/25150680/)
- **Adesope, Trevisan & Sundararajan 2017 (RER 87(3):659–701)** — Notes et rapport : g = 0,61 à 0,70, 272 tailles d'effet, 118 articles. Trouvé : plusieurs sources secondaires confirment 118 articles et 272 tailles d'effet (une chronique écrit « 188 », probablement une coquille). Le résumé disponible dit que les tests de pratique sont « more beneficial for learning than restudying and all other comparison conditions », que le bénéfice est plus grand quand le format du test de pratique correspond au test final, et que le feedback ajoute un léger avantage non significatif. **Les valeurs g = 0,61 et 0,70 restent NON VÉRIFIÉES** : article absent de PubMed, pas d'abstract sur OpenAlex, PDF illisible — [Dépôt WSU](https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/Rethinking-the-Use-of-Tests-A/99900601154801842) ; [DOI 10.3102/0034654316689306](https://doi.org/10.3102/0034654316689306) (résout correctement)
- **Yang, Luo, Vadillo, Yu & Shanks 2021 (Psych Bull 147:399–435)** — Trouvé dans l'abstract : 48 478 élèves, 222 études indépendantes, effet moyen **g = 0,499**, modulé par le feedback, le nombre de répétitions, etc. **CONFIRMÉ.** La valeur corrigée du biais de publication (0,427) n'est pas dans l'abstract et reste secondaire — [PubMed 33683913](https://pubmed.ncbi.nlm.nih.gov/33683913/)
- **Dunlosky et al. 2013** — Abstract : utilité élevée pour le practice testing et la distributed practice ; modérée pour l'elaborative interrogation, la self-explanation et l'interleaved practice ; faible pour summarization, highlighting, keyword mnemonic, imagery for text et rereading. Le keyword mnemonic « appears to benefit students for a limited number of materials and for short retention intervals ». **CONFIRMÉ** — [PubMed 26173288](https://pubmed.ncbi.nlm.nih.gov/26173288/)
- **Bertsch et al. 2007 (effet de génération)** — 445 tailles d'effet sur 86 études, effet « .40 ». **CONFIRMÉ** (résumé) — [PubMed 17645161](https://pubmed.ncbi.nlm.nih.gov/17645161/)
- **Macnamara, Hambrick & Oswald 2014** — Variance expliquée : 26 % (jeux), 21 % (musique), 18 % (sport), 4 % (éducation), < 1 % (métiers). **CONFIRMÉ** (résumé ; un erratum a été publié en 2018) — [PubMed 24986855](https://pubmed.ncbi.nlm.nih.gov/24986855/)

**Espacement**
- **Cepeda et al. 2006 (Psych Bull)** — Notes : plus de 300 expériences. Trouvé : « 839 assessments of distributed practice in 317 experiments located in 184 articles ». L'intervalle (ISI) qui maximise la rétention augmente avec le délai de rétention. **CONFIRMÉ** — [PubMed 16719566](https://pubmed.ncbi.nlm.nih.gov/16719566/)
- **Cepeda, Vul, Rohrer, Wixted & Pashler 2008 (Psych Sci 19:1095)** — Notes et rapport : intervalle optimal d'environ 20 % du délai pour quelques semaines, qui descend vers 5 % pour un an. La consigne de vérification mentionnait « ≈ 10 à 20 % ». Trouvé dans l'abstract : plus de 1 350 personnes, intervalle jusqu'à 3,5 mois, test jusqu'à 1 an ; « the optimal gap declined from about **20 to 40% of a 1-week test delay** to about **5 to 10% of a 1-year test delay** ». **CORRIGÉ** : la règle « 10–20 % » est une simplification de vulgarisation, pas la formulation de l'article. Valeurs par délai (secondaire, blog) : environ 1 jour d'intervalle optimal pour un test à 7 jours, environ 21 jours pour un test à 350 jours. Les valeurs à 35 et 70 jours ne sont pas vérifiées. Le tableau du PDF n'a pas pu être lu — [PubMed 19076480](https://pubmed.ncbi.nlm.nih.gov/19076480/) ; [DOI 10.1111/j.1467-9280.2008.02209.x](https://doi.org/10.1111/j.1467-9280.2008.02209.x) (résout correctement) ; [Substack Dynamic Learning, secondaire](https://dynamiclearning.substack.com/p/the-spacing-effect)
- **Murre & Dros 2015** — Un seul sujet, 70 h d'apprentissage, réapprentissage après 20 min, 1 h, 9 h, 1 j, 2 j et 31 j. La courbe d'Ebbinghaus est répliquée, avec un « jump upwards starting at the 24 hour data point ». **CONFIRMÉ** (N = 1) — [PubMed 26148023](https://pubmed.ncbi.nlm.nih.gov/26148023/)
- **Kornell 2009 (90 % et 72 %), Rohrer et al. 2005 (surapprentissage), Pyc & Rawson 2009, Barcroft 2007** — Les DOI résolvent vers les bons articles (Crossref), mais aucun abstract n'a été obtenu. Chiffres **NON VÉRIFIÉS** — [Crossref Kornell](https://doi.org/10.1002/acp.1537) ; [Rohrer](https://doi.org/10.1002/acp.1083) ; [Pyc & Rawson](https://doi.org/10.1016/j.jml.2009.01.004) ; [Barcroft](https://doi.org/10.1111/j.1467-9922.2007.00398.x)

**Entrelacement**
- **Brunmair & Richter 2019 (Psych Bull 145:1029)** — Abstract : 59 études, 238 tailles d'effet, 158 échantillons. Effet global **g = 0,42**, peintures g = 0,67, maths **g = 0,34**. Textes expositifs et goûts : effets non significatifs. « An advantage of blocking compared with interleaving was found for studies based on **words** (g = −0.39) ». L'entrelacement est plus efficace quand les catégories se ressemblent entre elles et que les exemples d'une même catégorie se ressemblent peu. **Chiffres CONFIRMÉS, interprétation NUANCÉE** : la méta-analyse porte sur l'apprentissage **inductif de catégories**. « Words » désigne les études dont le matériel est fait de mots ; ce n'est pas une mesure de la mémorisation de listes de vocabulaire bilingue par flashcards. Le rapport écrit « nuit pour les listes de mots » puis « regrouper du vocabulaire par thème ne l'est pas [pertinent] ». Or ce résultat va plutôt dans le sens du **blocage** pour les mots : la méta-analyse ne soutient pas la consigne anti-thème, qui relève d'une autre littérature (interférence sémantique, non vérifiée ici) — [PubMed 31556629](https://pubmed.ncbi.nlm.nih.gov/31556629/)
- **Nakata & Suzuki 2019 (MLJ 103(3):629–647)** — Titre exact (Crossref) : « Mixing Grammar Exercises Facilitates Long-Term Retention: Effects of Blocking, Interleaving, and Increasing Practice ». Selon une source secondaire, 115 apprenants japonais d'anglais ont travaillé dans trois conditions : bloqué, entrelacé, et croissant (bloqué puis entrelacé). **Direction CONFIRMÉE par le titre.** Le détail « plusieurs temps verbaux » et les scores du post-test différé sont **NON VÉRIFIÉS** (pas d'abstract accessible). Un extrait de moteur de recherche indique qu'un article qui la cite juge le tableau « mixed » en grammaire L2 ; l'article exact n'a pas été identifié, c'est donc NON VÉRIFIÉ — [DOI 10.1111/modl.12581](https://doi.org/10.1111/modl.12581) ; [résumé secondaire SlideShare](https://www.slideshare.net/MadisenHawes/a-summary-of-optimizing-second-language-practice-in-the-classroom-perspectives-from-cognitive-psychology)

**Auto-référence et multimodalité**
- **Symons & Johnson 1997 (Psych Bull 121:371)** — Notes et rapport : d ≈ 0,5 contre l'encodage sémantique. Trouvé dans l'abstract : l'effet d'auto-référence est confirmé, supérieur à l'encodage sémantique et à l'encodage centré sur autrui. Il est **plus petit** quand on compare à l'encodage centré sur autrui et quand la tâche de comparaison favorise organisation et élaboration. Aucune taille d'effet dans l'abstract. Une source secondaire donne une moyenne de **0,45** (métrique non précisée). **d ≈ 0,5 NON VÉRIFIÉ** : écrire « effet modéré (environ 0,45 à 0,5 selon les sources secondaires) » — [PubMed 9136641](https://pubmed.ncbi.nlm.nih.gov/9136641/) ; [résumé de recherche secondaire listant 0,45](https://www.crumplab.com/self-reference)
- **Mayer et al. 2015 (Current Biology)** — Abstract : apprendre avec des gestes est plus efficace qu'avec des images, et les deux battent l'apprentissage verbal seul. Le cortex visuel (LOC) et le cortex moteur (bmSTS, aires motrices) codent les mots appris selon la modalité d'enrichissement. **CONFIRMÉ.** Les délais « 2 et 6 mois » ne figurent pas dans l'abstract (NON VÉRIFIÉS) — [PubMed 25660537](https://pubmed.ncbi.nlm.nih.gov/25660537/)
- **Ludke, Ferreira & Overy 2014** — 60 adultes, phrases hongroises, 15 min d'apprentissage. Le chant est supérieur, significativement (p < .05) sur les deux tests de rappel et de production orale. **CONFIRMÉ** (effet à court terme seulement) — [PubMed 23860945](https://pubmed.ncbi.nlm.nih.gov/23860945/)
- **Smith & Vela 2001** — Effets de contexte environnemental fiables, réduits par la réinstauration mentale du contexte. **CONFIRMÉ** qualitativement (taille non vérifiée) — [PubMed 11495110](https://pubmed.ncbi.nlm.nih.gov/11495110/)

### Inferences
- Pour le rapport : garder « environ 80 % contre environ 35 % », en précisant « 36 % et 33 % selon la condition, 10 étudiants par groupe ». Retirer la mention « non revérifiés dans l'article original » : les chiffres sont confirmés par le communiqué officiel de Purdue, même s'ils ne viennent pas du PDF.
- Remplacer « environ 20 % du délai… vers 5 % pour un an » par « 20 à 40 % pour un délai d'une semaine, 5 à 10 % pour un an ». En pratique, pour un objectif de rétention de plusieurs mois, cela donne des intervalles de quelques semaines.
- La phrase « C'est exactement ce que calcule FSRS » est une inférence trop forte. FSRS ne calcule pas un ratio de Cepeda : il programme la révision au moment où la probabilité de rappel prédite tombe à la rétention désirée (90 % par défaut, voir la section 2). Les deux logiques produisent des intervalles croissants. Mieux vaut écrire « va dans le même sens ».
- Entrelacement : reformuler en « aide pour les catégories qui se ressemblent (g = 0,42 au global), mais dans les études qui utilisent des mots comme matériel, le blocage l'emporte (g = −0,39) ». Le conseil « mélanger present perfect, prétérit, for/since » reste soutenu par Nakata & Suzuki (direction confirmée). La consigne « ne pas grouper le vocabulaire par thème » doit être retirée ou sourcée ailleurs.

### Gaps
- Valeurs exactes non vérifiées : Adesope 2017 (g = 0,61 et 0,70), Rowland 2014 (au-delà du secondaire), Roediger & Karpicke 2006 (61 % et 40 %), Kornell 2009 (90 % et 72 %), Symons & Johnson 1997 (d), tableau complet de Cepeda 2008. Cause : PDF illisibles et articles hors PubMed.
- Taille d'effet poolée de Kim & Webb 2022 (espacement en L2) : toujours non récupérée.
- Littérature sur l'interférence sémantique (apprendre ensemble des mots d'un même thème) : non vérifiée ; c'est elle qui pourrait justifier la consigne anti-thème.

---

## 2. FSRS ou SM-2 : chiffres actuels du srs-benchmark, consignes du manuel d'Anki, économie de révisions

### Takeaway
Les chiffres de précision sont confirmés : FSRS-6 a une log loss plus faible que SM-2 pour 99,6 % des collections. Mais SM-2 ne figure plus dans le tableau texte du benchmark, et les auteurs eux-mêmes jugent la comparaison imparfaite. Le chiffre « 20 à 30 % de révisions en moins » n'a **aucune source primaire** retrouvée : il circule chez des éditeurs d'applications et des blogs, et vient de simulations. Le manuel d'Anki confirme 90 % par défaut, rester sous 97 %, et des étapes d'apprentissage de moins d'un jour.

### Cited Findings
- **srs-benchmark (README GitHub, consulté le 10/11/2026)** — 9 999 collections et 349 923 850 révisions d'évaluation (sans révisions du même jour) ; 10 000 collections et 519 296 315 révisions avec. Sans révisions du même jour (log loss / RMSE(bins) / AUC) :
  - FSRS-6 (21 paramètres) : 0,3460 / 0,0653 / 0,7034
  - FSRS-5 : 0,3561 / 0,0742 / 0,7010
  - FSRS-4.5 : 0,3625 / 0,0764 / 0,6891
  - FSRS-7 recency (34 paramètres) : 0,3370 / 0,0593 / 0,7220
  - HLR : 0,4694 / 0,1275 / 0,6369
  
  **SM-2 et le planificateur par défaut d'Anki n'apparaissent pas dans le tableau texte.** La section Dataset est incohérente : elle mentionne à la fois 20 000 personnes et environ 1,7 milliard de révisions, et 10 000 utilisateurs et environ 727 millions de révisions. **CONFIRMÉ** (chiffres identiques à ceux des notes) — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)
- **Supériorité sur SM-2** — Expertium : « FSRS-6 (with recency weighting) has a **99.6%** superiority over Anki SM-2, meaning that for 99.6% of users, log loss will be lower with FSRS-6 than with SM-2. » Base : 9 999 collections et 349 923 850 révisions. Réserves de l'auteur : « SM-2 wasn't designed to predict probabilities », et « there is no way to have a truly fair, no caveats, comparison between FSRS and SM-2 ». Aucun pourcentage FSRS contre SM-2 n'est donné pour la RMSE, et aucune valeur de log loss de SM-2 n'est en texte. **CONFIRMÉ** — [Expertium, Benchmark](https://expertium.github.io/Benchmark.html)
- **Économie de travail (« 20 à 30 % de révisions en moins »)** — Rien dans le README du benchmark, rien sur la page Benchmark d'Expertium (« no statement about workload »), rien sur la page wiki « The optimal retention ». Celle-ci ne contient qu'un exemple hypothétique (30 min par jour pour 80 % de rétention, 31 min pour 90 %), et aucune comparaison chiffrée FSRS contre SM-2. Le dépôt SSP-MMC (algorithme de MaiMemo par l'auteur de FSRS, KDD 2022, 220 millions de logs) ne donne pas de pourcentage dans son README. Les chiffres en circulation sont : 20 à 30 % (RemNote, Mindomax, « based on simulation data »), environ 25 % (Diane, attribué à Expertium, non retrouvé), 30 à 50 % (Diane, marketing), 10 à 20 % (Voccle). **NON VÉRIFIÉ, ne pas citer comme fait** — [wiki fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-optimal-retention) ; [dépôt SSP-MMC](https://github.com/maimemo/ssp-mmc) ; [Mindomax (secondaire)](https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm) ; [RemNote (secondaire)](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm) ; [Diane (marketing)](https://www.diane.app/en/guides/fsrs-vs-sm2)
- **FAQ officielle d'Anki** — Avec FSRS, il faut faire moins de révisions qu'avec l'algorithme par défaut pour une même rétention. Aucun pourcentage n'est donné — [FAQ Anki](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm)
- **Manuel d'Anki, Deck Options** :
  - « The default value of 90% will schedule cards so you have a 90% chance of » se souvenir de la carte.
  - « Above 90% the workload increases very quickly, and above 97% the workload can be overwhelming » ; le manuel recommande de rester « lower than 97% ».
  - « Ensure that all your learning and re-learning steps are shorter than 1d » ; « Steps such as 10m or 30m are good » ; garder le nombre d'étapes « to a minimum ».
  - Optimiseur : FSRS peut mal fonctionner avec un « low number of reviews (less than a few hundred) ».
  - Le manuel ne dit pas que FSRS réduit le nombre de révisions ; il dit qu'il « can help you remember more material in the same amount of time ».
  - FSRS est pris en charge depuis Anki 23.10 (AnkiDroid 2.17+). La fonction « Compute Minimum Recommended Retention » « has been removed as of anki version 25.07 ».
  
  **CONFIRMÉ** — [Anki Manual, Deck Options](https://docs.ankiweb.net/deck-options.html)

### Inferences
- La phrase du rapport (« près de 10 000 collections et 350 millions de révisions… 99,6 % des collections ») est exacte. Il faudrait y ajouter la réserve de l'auteur : SM-2 ne prédit pas de probabilités, la comparaison est donc structurellement favorable à FSRS.
- Ce que le benchmark mesure, c'est la qualité de **prédiction** du rappel, pas la rétention réelle ni le temps économisé. Pour la vitesse, la seule affirmation primaire disponible est qualitative (« moins de révisions », « plus de matière dans le même temps »).

### Gaps
- Aucune source primaire chiffrant l'économie de révisions de FSRS par rapport à SM-2 à rétention égale (article ou page d'Expertium dédiée non retrouvés).
- Aucun essai contrôlé indépendant mesurant la rétention réelle avec SM-2 et avec FSRS.
- Version exacte de FSRS dans Anki 25.x : non confirmée (le manuel ne mentionne FSRS-5 qu'en passant).

---

## 3. Sommeil : consolidation, encodage, durée recommandée, alcool, critiques de Walker

### Takeaway
Les affirmations qualitatives sont confirmées. Il y a trois corrections de détail. Les participants de Gais 2006 étaient des lycéens **américains** qui apprenaient de l'allemand, testés à 24 h et 36 h (48 h dans l'expérience 2), avec de tout petits N. Le « déficit d'encodage de 40 % » de Yoo 2007 est une formule de Walker (« as much as 40 percent worse ») ; l'écart moyen rapporté est de **19 %**. Cousins 2019 montre que la sieste fait **mieux** que le bachotage à une semaine, pas seulement aussi bien.

### Cited Findings
- **Gais, Lucas & Born 2006 (Learn Mem 13:259)** :
  - Expérience 1 : 12 lycéens américains anglophones sans connaissance de l'allemand ; listes de 24 paires anglais–allemand ; apprentissage à 8 h ou à 20 h ; rappel à **24 h et 36 h**. L'oubli est bien plus fort après l'apprentissage du matin (F₁,₁₁ = 9,8, p < 0,01). Pas de différence entre 24 h et 36 h.
  - Expérience 2 : 14 lycéens ; apprentissage à 20 h, suivi de sommeil ou de privation de sommeil ; rappel à **48 h**. Le rappel est meilleur après le sommeil (F₁,₁₃ = 7,1, p < 0,05), même après une nuit de récupération.
  
  Notes : « vocabulaire anglais–allemand appris le soir… mieux retenu à 24 h et 48 h ». **CORRIGÉ** : 24 h et 36 h pour la comparaison matin/soir ; 48 h vient de l'expérience de privation de sommeil ; apprenants anglophones. Qualité : texte intégral (PMC), N très petits — [PMC10807868](https://pmc.ncbi.nlm.nih.gov/articles/PMC10807868/) ; [PubMed 16741280](https://pubmed.ncbi.nlm.nih.gov/16741280/)
- **Mazza et al. 2016 (Psych Sci 27:1321)** — 40 participants, vocabulaire étranger appris jusqu'au niveau parfait, deux sessions à 12 h d'écart (matin puis soir, ou soir, sommeil, puis matin), rétention à 1 semaine et 6 mois. Dormir entre les sessions « reduced the amount of practice needed by half » et « ensured much better long-term retention ». **CONFIRMÉ et précisé** (moitié moins de pratique, suivi à 6 mois). Résumé seul, N = 40 — [PubMed 27530500](https://pubmed.ncbi.nlm.nih.gov/27530500/)
- **Yoo, Hu, Gujar, Jolesz & Walker 2007 (Nat Neurosci 10:385)** — Abstract : une nuit de privation entraîne « a significant deficit in hippocampal activity during episodic memory encoding, resulting in worse subsequent retention ». Harvard Gazette : participants éveillés 35 h, images mémorisées en moyenne « **19 percent worse** » deux jours plus tard, après récupération ; citation de Walker : « as much as **40 percent** worse ». Selon CBS : 28 adultes de 18 à 30 ans. **CORRIGÉ** : le « ≈ 40 % » est un maximum cité oralement par Walker ; l'écart moyen est d'environ 19 %. Le rapport final ne cite pas les 40 %, ce qui est correct — [PubMed 17293859](https://pubmed.ncbi.nlm.nih.gov/17293859/) ; [Harvard Gazette 2007](https://news.harvard.edu/gazette/story/2007/02/study-shows-importance-of-sleep-for-optimal-memory-functioning) ; [CBS News](https://www.cbsnews.com/news/sleep-deprivation-may-impair-memory-12-02-2007/)
- **Watson et al. 2015 (consensus AASM/SRS)** — « Adults should sleep **7 or more hours** per night on a regular basis to promote optimal health. » Dormir moins de 7 h est associé à des effets délétères, dont « impaired performance, increased errors ». Plus de 9 h « may be appropriate for young adults, individuals recovering from sleep debt ». **CONFIRMÉ** (texte intégral) — [PMC4434546](https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/)
- **Ebrahim et al. 2013 (Alcohol Clin Exp Res 37:539)** — Revue qualitative : « At all dosages, alcohol causes a reduction in sleep onset latency, a more consolidated first half sleep and an increase in sleep disruption in the second half ». Le sommeil paradoxal total diminue à doses modérées et fortes, pas de tendance nette à faible dose ; le sommeil lent profond augmente en première moitié de nuit. **CONFIRMÉ.** Qualité : revue narrative, pas une méta-analyse — [PubMed 23347102](https://pubmed.ncbi.nlm.nih.gov/23347102/)
- **Diekelmann & Born 2010 ; Rasch & Born 2013** — Les abstracts confirment le rôle du sommeil lent (oscillations lentes, fuseaux, ripples) dans la réactivation et la redistribution des souvenirs hippocampiques, et celui du sommeil paradoxal dans la consolidation synaptique. **CONFIRMÉ** — [PubMed 20046194](https://pubmed.ncbi.nlm.nih.gov/20046194/) ; [PubMed 23589831](https://pubmed.ncbi.nlm.nih.gov/23589831/)
- **Dumay & Gaskell 2007** (cité dans le rapport) — Des mots appris à 20 h entrent en compétition lexicale après 12 h incluant une nuit. Appris à 8 h, ils ne le font qu'à 24 h, une fois le sommeil passé. **CONFIRMÉ** — [PubMed 17362375](https://pubmed.ncbi.nlm.nih.gov/17362375/)
- **Lim & Dinges 2010** — 70 articles, 147 tests cognitifs. Les effets vont de g = −0,125 (raisonnement, non significatif) à **g = −0,776** (pertes d'attention simple). **CONFIRMÉ** — [PubMed 20438143](https://pubmed.ncbi.nlm.nih.gov/20438143/)
- **Siestes** :
  - Lahl 2008 : une sieste d'environ 6 min en moyenne améliore déjà le rappel de mots ; une sieste longue fait mieux encore. **CONFIRMÉ** — [PubMed 18275549](https://pubmed.ncbi.nlm.nih.gov/18275549/)
  - Cousins 2019 : sieste d'1 h (n = 27), pause (n = 27) ou bachotage (n = 30). À 30 min, sieste et bachotage battent la pause. À une semaine, « napping maintained this significant advantage, but cramming did not ». **CORRIGÉ** : les notes disaient « comparable » ; la sieste fait mieux à une semaine — [PubMed 30371902](https://pubmed.ncbi.nlm.nih.gov/30371902/)
  - Dutheil 2021 : 11 études, 381 participants, sieste moyenne de 55 min. Effet global sur la cognition : **0,18** [0,09–0,27] ; vigilance : **0,29**. Pas d'effet de la durée de la sieste. Notes : « non revérifié » ; **désormais CONFIRMÉ** — [PubMed 34639511](https://pubmed.ncbi.nlm.nih.gov/34639511/)
- **Guzey 2019, « Matthew Walker's Why We Sleep is riddled with scientific and factual errors »** — Essai publié en novembre 2019 et mis à jour le 22/11/2019. Exemples de points relevés :
  - « Every species sleeps » serait contredit par la source même de Walker.
  - « The shorter your sleep, the shorter your life span » serait faux d'après la méta-analyse de Shen et al. 2016 : mortalité minimale juste sous 7 h ; à 5 h, comparable à 8 h.
  - L'affirmation sur le risque de cancer ne serait pas étayée.
  
  Andrew Gelman a relayé l'essai sur son blog (posts de novembre et décembre 2019, dont « Why we sleep data manipulation: A smoking gun? »). Walker a répondu en décembre 2019 sans traiter les points un par un. **CONFIRMÉ** (existence et contenu). L'essai **ne traite pas** le chiffre de 40 % de Yoo 2007. Qualité : critique non évaluée par des pairs, mais documentée et sourcée — [Guzey 2019](https://guzey.com/books/why-we-sleep/)
- **Réactivation pendant le sommeil (TMR)** — Hu et al. 2020 : 91 expériences, 212 tailles d'effet, N = 2 004 ; **g = 0,29** [0,21–0,38] ; efficace en NREM 2 et en sommeil lent, pas en sommeil paradoxal ni à l'éveil. Schreiner & Rasch 2015 : rejouer des mots néerlandais pendant le NREM améliore le rappel de leur traduction allemande. **CONFIRMÉ** — [PubMed 32027149](https://pubmed.ncbi.nlm.nih.gov/32027149/) ; [PubMed 24962994](https://pubmed.ncbi.nlm.nih.gov/24962994/)
- **Züst et al. 2019** — **Le DOI cité dans les notes est faux.** 10.1016/j.cub.2019.01.038 renvoie, selon Crossref, à un autre article de Current Biology (premier auteur « Lukeš »). Bonne référence : Current Biology 29(4):541–553.e7, **DOI 10.1016/j.cub.2018.12.038**, PMID 30713104. 41 participants en sommeil lent pendant une sieste ; associations pseudo-mot/mot allemand ; rappel implicite au-dessus du hasard quand le second mot tombe sur un pic d'onde lente. **CORRIGÉ (DOI)** — [notice BORIS, Univ. Berne](https://boris.unibe.ch/126044) ; [communiqué Univ. Berne](https://mediarelations.unibe.ch/media_releases/2019/medienmitteilungen_2019/learning_new_vocabulary_during_deep_sleep/index_eng.html)

### Inferences
- La section sommeil du rapport peut rester telle quelle. Deux précisions utiles : Mazza montre une division par deux du temps de réapprentissage, ce qui est un argument « vitesse » direct pour l'utilisateur ; et Gais repose sur 12 et 14 lycéens.
- Si un chiffre de privation de sommeil est cité, préférer « environ 19 % de moins en moyenne après une nuit blanche (Yoo 2007, via Harvard Gazette) » aux « 40 % ».

### Gaps
- Le tableau des pourcentages de Gais 2006 (tableau 1) et les chiffres exacts de Yoo 2007 dans l'article lui-même n'ont pas été consultés (secondaire pour le 19 %).
- Méta-analyse du « sleep benefit » (Berres & Erdfelder 2021) : toujours non vérifiée.

---

## 4. Exercice physique : Schmidt-Kassow, Liu, méta-analyses sur l'exercice aigu et la mémoire, et sur le vocabulaire L2

### Takeaway
Roig 2013 est confirmé : l'exercice aigu a un effet modéré à grand sur la mémoire à long terme (SMD = 0,52), alors que l'exercice chronique n'a pas d'effet significatif sur celle-ci (0,07). Il y a une **nuance importante** pour le conseil « pédaler pendant ». Deux méta-analyses sur la mémoire épisodique trouvent un effet nul ou négatif de l'exercice **pendant** l'encodage : Loprinzi 2019, d = −0,12 ; Qazi 2024, d = −0,04, non significatif. Les bénéfices apparaissent avant (d = 0,23, avec un biais de publication probable) ou après l'encodage (d = 0,33). **Aucune méta-analyse « exercice et vocabulaire L2 » n'a été trouvée.**

### Cited Findings
- **Schmidt-Kassow et al. 2013 et Liu et al. 2017** — Déjà vérifiés [V] dans les notes sur PLOS ONE (28,4 contre 20,9 mots, d = 0,84 ; 93,6 % contre 85,0 % et 83,1 % contre 65,3 %). Rien de neuf : aucune réplication indépendante trouvée. Liu 2017 est en accès libre — [Liu et al. 2017, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5436710/)
- **Roig et al. 2013 (Neurosci Biobehav Rev 37:1645)** — 29 études (aigu) et 21 études (long terme).
  - Mémoire à court terme : aigu **SMD = 0,26** [0,03–0,49] ; long terme **0,15** [0,02–0,27].
  - Mémoire à long terme : aigu **SMD = 0,52** [0,28–0,75], p < 0,0001 ; long terme **0,07** [−0,13–0,26], non significatif.
  
  **CONFIRMÉ et précisé** — [PubMed 23806438](https://pubmed.ncbi.nlm.nih.gov/23806438/)
- **Loprinzi et al. 2019 (Brain Sciences)** — 25 articles. L'exercice **pendant** l'encodage a un effet négatif sur la mémoire épisodique : d = −0,12 [−0,22 ; −0,02], p = 0,02. L'exercice intense, et l'exercice chez les jeunes adultes, a plus d'effet quand il précède l'encodage ou se situe au début de la consolidation. Les valeurs poolées avant et après encodage n'ont pas été lues (la page PMC exigeait une vérification de navigateur) — [Loprinzi et al. 2019, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6523402/)
- **Qazi et al. 2024 (Frontiers in Cognition)** — 42 expériences sur la mémoire épisodique à long terme :
  - Avant l'encodage : **d = 0,23** [0,13–0,34], avec biais de publication significatif (Egger p = 0,002).
  - Après l'encodage : **d = 0,33** (p = 0,007 ; l'intervalle de confiance imprimé contient une coquille).
  - Pendant l'encodage : **d = −0,04** [−0,31 ; 0,24], non significatif.
  
  La discussion donne d'autres valeurs (0,29 et 0,37) : il y a une incohérence interne — [Qazi et al. 2024](https://www.frontiersin.org/articles/10.3389/fcogn.2024.1367569)
- **Winter et al. 2007** — 27 sujets, plan croisé. Vocabulaire appris « 20 percent faster » après des sprints intenses qu'après une course légère ou du repos. **CONFIRMÉ** — [PubMed 17185007](https://pubmed.ncbi.nlm.nih.gov/17185007/)
- **van Dongen et al. 2016** — Exercice réalisé 4 h après l'encodage (et non immédiatement) : meilleure rétention à 48 h d'associations image–lieu. **CONFIRMÉ** — [PubMed 27321998](https://pubmed.ncbi.nlm.nih.gov/27321998/)
- **Szuhany, Bugatti & Otto 2015** — 29 études, N = 1 111. BDNF après une séance : g = 0,46 ; une séance après un programme régulier : g = 0,59 ; BDNF au repos après un programme : g = 0,27. Effet plus faible chez les femmes. **CONFIRMÉ** — [PubMed 25455510](https://pubmed.ncbi.nlm.nih.gov/25455510/)
- **Erickson et al. 2011** — Essai randomisé sur 120 adultes âgés : volume de l'hippocampe +2 %, ce qui inverse 1 à 2 ans de perte liée à l'âge. **CONFIRMÉ** — [PubMed 21282661](https://pubmed.ncbi.nlm.nih.gov/21282661/)
- **OMS 2020 (Bull et al.)** — 150 à 300 min par semaine d'activité modérée, ou 75 à 150 min d'activité intense. **CONFIRMÉ** — [PubMed 33239350](https://pubmed.ncbi.nlm.nih.gov/33239350/)
- **Méta-analyse « exercice et vocabulaire L2 »** — Aucune trouvée. Il existe des études primaires (Liu 2017 ; études chez l'enfant) et une revue narrative (Pastorino Campos 2018) — [revue narrative, Cambridge](https://www.mml.cam.ac.uk/files/copil_11_7_pastorino.pdf)

### Inferences
- Le conseil du rapport (« pédaler en révisant apporte un petit bonus bien documenté ») est un peu trop affirmatif. « Bien documenté » ne vaut que pour deux petites études L2 à intensité légère à modérée. Les méta-analyses générales sur la mémoire épisodique ne trouvent pas de bénéfice pendant l'encodage, et trouvent même un léger coût en double tâche ou à forte intensité. Formulation plus juste : « à intensité légère (on peut parler), réviser en pédalant semble sans coût et peut-être utile (deux petites études L2) ; une séance d'exercice soutenu avant la session, ou quelques heures après, a de meilleures preuves générales ».
- Le choix de rendement pour l'utilisateur : faire son sport habituel avant la session d'Anki, ou 2 à 4 h après une session dense, plutôt que de chercher à combiner les deux.

### Gaps
- Valeurs poolées de Loprinzi 2019 avant et après encodage non lues.
- Aucune méta-analyse propre au vocabulaire L2 ; aucune réplication préenregistrée de Schmidt-Kassow ou de Liu.

---

## 5. Attention : multitâche, notifications, présence du téléphone, caféine

### Takeaway
L'effet de la simple présence du smartphone (« brain drain ») est désormais **probablement nul**. Il y a deux échecs de réplication : Hartmann 2020 (N = 302) et la réplication directe préenregistrée de Ruiz Pardo & Minda 2022. La méta-analyse de Hartanto 2024 (33 études, 4 368 participants) trouve d = −0,02, non significatif. Seul Parry 2024 garde un petit effet sur la mémoire de travail. **Le DOI de Hartmann 2020 cité dans les notes et le rapport est faux.** Stothart 2015 et Drake 2013 sont confirmés. Les chiffres de Sana 2013 (11 % et 17 %) n'ont pas pu être vérifiés.

### Cited Findings
- **Sana, Weston & Cepeda 2013 (Computers & Education 62:24–31)** — Notes et rapport : environ 11 % de moins pour ceux qui font du multitâche, environ 17 % pour leurs voisins. Trouvé : direction confirmée par l'abstract et la FAQ de l'auteur. Les multitâcheurs ont de moins bons scores, et les étudiants qui voient l'écran d'un pair aussi. La FAQ précise : cours **simulé**, étudiants universitaires, quiz **immédiatement** après le cours (« cannot speak directly to long-term retention »). **Pourcentages 11 % et 17 % NON VÉRIFIÉS** (PDF illisible, article hors PubMed) — [FAQ de N. Cepeda](https://www.yorku.ca/ncepeda/laptopFAQ.html) ; [DOI 10.1016/j.compedu.2012.10.003](https://doi.org/10.1016/j.compedu.2012.10.003) (résout correctement) ; [communiqué York U](https://news.yorku.ca/2013/03/13/multitasking-on-laptop-impedes-classroom-learning-york-u-study-shows/)
- **Stothart, Mitchum & Yehnert 2015 (JEP:HPP 41:893)** — Les notifications seules « significantly disrupted performance on an attention-demanding task », avec une ampleur « comparable » à l'usage actif (appel ou SMS). **CONFIRMÉ** (résumé) — [PubMed 26121498](https://pubmed.ncbi.nlm.nih.gov/26121498/)
- **Ward et al. 2017 (J Assoc Consumer Research)** — DOI 10.1086/691462 : bon article (« Brain Drain: The Mere Presence of One's Own Smartphone Reduces Available Cognitive Capacity »). L'Atlas de réplication FORRT liste **deux échecs**, Ruiz Pardo & Minda 2021 (preprint) et 2022, et aucun succès — [FORRT Replication Atlas](https://forrt.org/flora-replication-atlas/doi/10.1086/691462/)
- **Hartmann, Martarelli, Reber & Rothen 2020** — **Le DOI cité (10.1016/j.concog.2020.102966) renvoie une erreur 404 chez Crossref. Bon DOI : 10.1016/j.concog.2020.103033** (Consciousness and Cognition, vol. 86), confirmé par OpenAlex. Titre : « Does a smartphone on the desk drain our brain? No evidence of cognitive costs due to smartphone presence in a short-term and prospective memory task ». 302 participants, téléphone sur le bureau ou à l'autre bout de la pièce : aucun effet global sur la mémoire à court terme ni sur la mémoire prospective. **CORRIGÉ (DOI), CONFIRMÉ (contenu)** — [BPS Research Digest](https://www.bps.org.uk/research-digest/revisiting-brain-drain-effect) ; [manuscrit accepté, UniDistance](https://sonar.unidistance.ch/fernuni/documents/322142)
- **Ruiz Pardo & Minda 2022 (Acta Psychologica 230:103717)** — Réplication directe préenregistrée de l'expérience 2 de Ward : six conditions (lieu du téléphone × allumé ou éteint), OSpan et go/no-go. Résultat : « the "brain drain" effect did not replicate: there was no difference between smartphone location conditions ». N = 383 selon un extrait de moteur de recherche (non vérifié). **CONFIRMÉ** (résumé) — [PubMed 36007374](https://pubmed.ncbi.nlm.nih.gov/36007374/)
- **Méta-analyses** :
  - Hartanto et al. 2024 (Technology, Mind, and Behavior) : 166 tailles d'effet, 53 échantillons, 33 études, 4 368 participants ; **d = −0,02** [−0,06 ; 0,01], p = 0,246 ; pas de modérateur (dépendance au téléphone, méthode).
  - Parry 2024 (Media Psychology ; k = 56, n = 7 093) : effet négatif seulement sur la capacité de mémoire de travail, nul ailleurs, puissance statistique faible.
  - Böttger et al. 2023 (Behavioral Sciences) : effet négatif global.
  
  Détails tirés des résumés et d'extraits — [Hartanto et al. 2024, JCU](https://researchonline.jcu.edu.au/91280/) ; [Böttger et al. 2023, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10525686/)
- **Drake, Roehrs, Shambroom & Roth 2013 (JCSM 9:1195)** — 12 dormeurs sains, plan croisé en double aveugle, 400 mg de caféine à 0, 3 ou 6 h du coucher, ou placebo. Au moniteur objectif, le temps de sommeil baisse dans toutes les conditions (« reducing TST between 1.1 to 1.2 hours »). Discussion : « Even at 6 hours, caffeine reduced sleep by more than 1 hour. » Au journal subjectif, la baisse à 6 h n'est que de 41 min (p = 0,08). **CONFIRMÉ et précisé** : plus d'une heure en mesure objective, N = 12 — [PMC3805807](https://pmc.ncbi.nlm.nih.gov/articles/PMC3805807/)
- **Caféine et mémoire** :
  - Borota 2014 : caféine après l'étude, meilleure performance à 24 h selon une courbe en U inversé, effet propre à la consolidation. La dose de 200 mg n'est pas dans l'abstract.
  - McLellan 2016 : à 40–300 mg, vigilance, attention et temps de réaction s'améliorent ; « less consistent effects are observed on memory ».
  
  **CONFIRMÉ.** Aucune méta-analyse récente (2023–2026) sur la caféine et la mémoire à long terme chez l'adulte sain n'a été trouvée — [PubMed 24413697](https://pubmed.ncbi.nlm.nih.gov/24413697/) ; [PubMed 27612937](https://pubmed.ncbi.nlm.nih.gov/27612937/)
- **Mrazek 2013** — Essai randomisé : 2 semaines de pleine conscience améliorent la compréhension écrite au GRE et la mémoire de travail, et réduisent le vagabondage mental. **CONFIRMÉ** (résumé ; une seule étude) — [PubMed 23538911](https://pubmed.ncbi.nlm.nih.gov/23538911/)
- **Rubinstein 2001, Monsell 2003, Ophir 2009** — Coûts de changement de tâche et résultats d'Ophir confirmés qualitativement dans les abstracts — [PubMed 11518143](https://pubmed.ncbi.nlm.nih.gov/11518143/) ; [PubMed 12639695](https://pubmed.ncbi.nlm.nih.gov/12639695/) ; [PubMed 19706386](https://pubmed.ncbi.nlm.nih.gov/19706386/)

### Inferences
- Pour le rapport : remplacer « une réplication ne l'a pas retrouvé » par « deux réplications, dont une directe préenregistrée, et une méta-analyse de 33 études ne le retrouvent pas (d ≈ 0) ». Corriger le DOI de Hartmann.
- La règle pratique « téléphone ailleurs » reste justifiée par les **notifications** (Stothart) et par le multitâche, pas par la simple présence de l'appareil.
- Caféine : le chiffre d'une heure est bien objectif, mais il repose sur 12 personnes et une forte dose (400 mg, environ 4 expressos). Pour une dose habituelle, la règle des 6 h est une extrapolation prudente.

### Gaps
- Pourcentages 11 % et 17 % de Sana 2013 : non vérifiés (texte intégral inaccessible).
- Nombre de participants de Ward 2017 et de Ruiz Pardo & Minda 2022 : non vérifiés à la source.
- Méta-analyse récente sur la pleine conscience et l'attention chez l'adulte sain : non cherchée.

---

## 6. Motivation et habitudes : Al-Hoorie, Lally, Gollwitzer & Sheeran, Teimouri, growth mindset

### Takeaway
Teimouri 2019 (r = −0,36) et les méta-analyses sur le growth mindset (Macnamara & Burgoyne : d = 0,05 ; Burnette : d = 0,14 pour les sous-groupes ciblés) sont confirmés. Il y a deux nuances. Les 66 jours de Lally ne viennent que de 39 participants sur 96 dont la courbe était bien ajustée, et les valeurs hautes de l'étendue sont extrapolées au-delà des 84 jours de suivi. Le d = 0,65 des intentions de mise en œuvre est l'estimation de 2006. La méta-analyse de 2024 (642 tests) donne 0,27 à 0,66 selon les résultats mesurés, et les corrections de biais de publication la ramènent à environ 0,15–0,35 (chiffres secondaires).

### Cited Findings
- **Al-Hoorie 2018** — Déjà [V] dans les notes : r = 0,61 avec l'effort déclaré et r = 0,20 avec la réussite ; 32 078 apprenants. La mention « plus de 32 000 » du rapport est exacte. Non revérifié dans cette passe — [Al-Hoorie 2018](https://pressto.amu.edu.pl/index.php/ssllt/article/view/12295)
- **Lally, van Jaarsveld, Potts & Wardle 2010 (EJSP 40:998, en ligne en 2009)** — DOI correct (Crossref, « How are habits formed: Modelling habit formation in the real world »). Une analyse détaillée de l'article (secondaire) donne :
  - 96 volontaires recrutés, 82 avec assez de données, **39 dont la courbe est bien ajustée** ;
  - médiane jusqu'à 95 % de l'asymptote : **66 jours** ; étendue : **18 à 254 jours** ;
  - suivi de **84 jours**, donc toute valeur au-delà est une projection du modèle ; médiane de 91 jours pour l'exercice physique ;
  - rater une occasion isolée « did not materially disrupt » l'automatisme.
  
  **Chiffres CONFIRMÉS, interprétation NUANCÉE** — [The Behavioral Scientist (analyse secondaire)](https://www.thebehavioralscientist.com/articles/how-long-to-form-a-habit) ; [DOI 10.1002/ejsp.674](https://doi.org/10.1002/ejsp.674)
- **Singh et al. 2024 (Healthcare 12:2488)** — 20 études, 2 601 participants ; médianes de 59 à 66 jours, moyennes de 106 à 154 jours, variabilité individuelle de 4 à 335 jours ; amélioration des scores d'habitude SMD = 0,69. Les habitudes du matin et celles choisies par la personne sont plus fortes. 11 études sur 20 ont un risque de biais élevé. **CONFIRMÉ** — [PubMed 39685110](https://pubmed.ncbi.nlm.nih.gov/39685110/)
- **Gollwitzer & Sheeran 2006 (Adv Exp Soc Psychol 38:69–119)** — Plusieurs sources secondaires concordent : 94 tests indépendants, plus de 8 000 participants, **d = 0,65** sur l'atteinte des objectifs. **CONFIRMÉ (secondaire ; abstract non lu directement).** **Mise à jour** : Sheeran, Listrom & Gollwitzer 2024 (European Review of Social Psychology, 642 tests, DOI 10.1080/10463283.2024.2334563) donnent, d'après l'abstract cité, une efficacité sur les résultats cognitifs, affectifs et comportementaux de « .27 ≤ d ≤ .66 ». Les estimations corrigées du biais de publication, d = 0,35 (trim-and-fill) et d = 0,15 [0,08–0,22] (méta-analyse bayésienne robuste), ne sont rapportées que par des sources secondaires — [Sheeran et al. 2024, éditeur](https://informahealthcare.com/doi/full/10.1080/10463283.2024.2334563?src=exp-la) ; [synthèse secondaire des 642 tests](https://goalsandprogress.com/implementation-intentions-research/)
- **Teimouri, Goetze & Plonsky 2019 (SSLA 41(2):363–387)** — 97 rapports, 105 échantillons indépendants, N = 19 933, 23 pays, 216 corrélations ; **r = −0,36** entre anxiété L2 et réussite. L'effet varie selon la mesure de réussite, le niveau d'études, la langue cible et le type d'anxiété. Un erratum a été publié pour une référence omise, sans changement des statistiques. **CONFIRMÉ** (résumé) — [NAU Experts, résumé](https://experts.nau.edu/en/publications/second-language-anxiety-and-achievement/) ; [erratum, Cambridge](https://core-prod.cambridgecore.org/core/services/aop-cambridge-core/content/view/1726B408D549071AC135A1FE53AFA918/S0272263119000445a.pdf/second_language_anxiety_and_achievement_a_metaanalysis_erratum.pdf)
- **Sisk et al. 2018 (Psych Sci 29:549)** — Méta-analyse 1 (mindset et réussite) : k = 273, N = 365 915. Méta-analyse 2 (interventions) : k = 43, N = 57 155. « Overall effects were weak for both meta-analyses » ; bénéfice possible pour les élèves défavorisés ou à risque. **Valeurs r ≈ 0,10 et d ≈ 0,08 NON VÉRIFIÉES** : elles ne sont pas dans l'abstract, ni dans le communiqué ScienceDaily — [PubMed 29505339](https://pubmed.ncbi.nlm.nih.gov/29505339/) ; [ScienceDaily 2018](https://sciencedaily.com/releases/2018/05/180522114523.htm)
- **Macnamara & Burgoyne 2023 (Psych Bull 149:133)** — 63 études, N = 97 672. **d = 0,05** [0,02–0,09], non significatif après correction du biais de publication. Pour les études où le mindset a bien changé : d = 0,04, non significatif. Études de meilleure qualité (6 études, N = 13 571) : **d = 0,02**, non significatif. Les auteurs ayant un intérêt financier publient des effets plus grands. **CONFIRMÉ** — [PubMed 36326645](https://pubmed.ncbi.nlm.nih.gov/36326645/)
- **Burnette et al. 2023 (Psych Bull 149:174)** — 53 échantillons indépendants. Sous-groupes ciblés et forte fidélité de mise en œuvre : réussite scolaire **d = 0,14** [0,06–0,22] ; santé mentale d = 0,32. L'intervalle de prédiction pour la réussite va de −0,08 à 0,35. **CONFIRMÉ** — [PubMed 36227318](https://pubmed.ncbi.nlm.nih.gov/36227318/)
- **Botes, Dewaele & Greiff 2020** — DOI 10.52598/jpll/2/1/3 : bon article selon Crossref (« The Foreign Language Classroom Anxiety Scale and Academic Achievement… A Meta-analysis »). Le r ≈ −0,39 n'a pas été vérifié — [DOI](https://doi.org/10.52598/jpll/2/1/3)

### Inferences
- « Une habitude met en médiane 66 jours » peut rester dans le rapport, mais l'étendue doit être présentée comme modélisée (au-delà de 84 jours, il s'agit de projections). L'effet « moins de 6 mois pour une habitude solide » est très variable.
- Intentions de mise en œuvre : écrire « effet moyen (d ≈ 0,65 en 2006 ; plus modeste, environ 0,3, dans la méta-analyse de 2024 sur 642 tests, qui reste à lire directement) ». Pour l'utilisateur, la stratégie reste rentable : un plan « si… alors » coûte quelques secondes.
- Growth mindset : la conclusion du rapport (« effet quasi nul ») est solide. Mieux vaut citer Macnamara & Burgoyne (d = 0,05, ≈ 0 après correction) que le d = 0,08 de Sisk, qui n'a pas pu être vérifié.

### Gaps
- r ≈ 0,10 et d ≈ 0,08 de Sisk 2018, abstract de Gollwitzer & Sheeran 2006, et estimations corrigées de Sheeran 2024 : non lus à la source.
- r ≈ −0,39 de Botes 2020 : non vérifié.

---

## 7. Mythes et compléments (styles d'apprentissage, brain training, lecture rapide, oméga-3, créatine, caféine, etc.)

### Takeaway
Pashler 2008, Simons 2016, Rayner 2016, Laws 2012 (ginkgo, d ≈ 0), Horvath 2015 (tDCS, 0 sur 59 analyses), Dekker 2012 (49 %) et Wittbrodt 2018 sont confirmés. Pour la créatine, l'effet est concentré chez les personnes âgées (SMD = 0,88), avec **0,03, non significatif, chez les 11–31 ans** (Prokopidis 2023). Une méta-analyse de 2024, qui mélange sujets sains et malades, donne SMD = 0,31 sur la mémoire. Pour les oméga-3, on ne trouve aucun bénéfice chez les sujets sains bien nourris. Le DOI attribué à Chabris 1999 est en réalité celui de la réponse de Steele.

### Cited Findings
- **Pashler, McDaniel, Rohrer & Bjork 2008** — « Virtually no evidence for the interaction pattern » ; parmi les études méthodologiquement adéquates, « several found results that flatly contradict the popular meshing hypothesis ». **CONFIRMÉ** — [PubMed 26162104](https://pubmed.ncbi.nlm.nih.gov/26162104/). Rogowsky et al. 2015 : pas d'interaction entre le style préféré et le mode de présentation (livre audio ou e-texte), ni en test immédiat ni à 2 semaines. **CONFIRMÉ** — [DOI 10.1037/a0037478](https://doi.org/10.1037/a0037478)
- **Simons et al. 2016** — « Extensive evidence » d'amélioration sur les tâches entraînées, « less evidence » sur les tâches proches, « little evidence » sur les tâches éloignées et la cognition quotidienne. Aucune étude citée par les entreprises ne respecte toutes les bonnes pratiques. **CONFIRMÉ** — [PubMed 27697851](https://pubmed.ncbi.nlm.nih.gov/27697851/). Melby-Lervåg & Hulme 2013 (23 études, 30 comparaisons) : gains à court terme spécifiques, sans généralisation. **CONFIRMÉ** — [PubMed 22612437](https://pubmed.ncbi.nlm.nih.gov/22612437/)
- **Rayner et al. 2016** — Compromis vitesse/précision. Il est peu probable de doubler ou tripler sa vitesse (« from around 250 to 500–750 words per minute ») sans perte de compréhension ; « language skill is at the heart of reading speed ». **CONFIRMÉ** — [PubMed 26769745](https://pubmed.ncbi.nlm.nih.gov/26769745/)
- **Dekker et al. 2012** — 242 enseignants ; ils croient en moyenne **49 %** des neuromythes, et plus de connaissances générales sur le cerveau prédisent **plus** d'adhésion. **CONFIRMÉ** — [PubMed 23087664](https://pubmed.ncbi.nlm.nih.gov/23087664/)
- **Nielsen et al. 2013** — 1 011 sujets de 7 à 29 ans ; la latéralisation est une propriété locale, pas un phénotype « cerveau gauche » ou « cerveau droit ». **CONFIRMÉ** — [PubMed 23967180](https://pubmed.ncbi.nlm.nih.gov/23967180/)
- **Effet Mozart** — **Le DOI attribué à Chabris (10.1038/23611) correspond à la réponse de Steele et al. (Nature 400:827–828). La méta-analyse de Chabris est le DOI 10.1038/23608** (Nature 400:826–827), confirmé par OpenAlex. **CORRIGÉ (DOI)** — [Crossref/DOI Chabris](https://doi.org/10.1038/23608) ; [PubMed 10476959 (Steele)](https://pubmed.ncbi.nlm.nih.gov/10476959/)
- **Beats binauraux** — Garcia-Argibay 2019 : 22 études, 35 tailles d'effet, « overall medium, significant, **consistent** effect size (g = 0.45) ». Les notes disaient « très hétérogène » : **CONTREDIT dans les termes de l'abstract**, même si les études sont petites. Ingendoh 2023 conclut à des résultats incohérents sur l'entraînement des ondes cérébrales. **CONFIRMÉ** — [PubMed 30073406](https://pubmed.ncbi.nlm.nih.gov/30073406/) ; [PubMed 37205669](https://pubmed.ncbi.nlm.nih.gov/37205669/)
- **Oméga-3** :
  - Sydenham 2012 (Cochrane) : 3 essais chez des personnes de 60 ans et plus, sans troubles cognitifs ; pas de différence au MMSE (MD −0,07 [−0,25 ; 0,10], 3 221 participants) ni aux autres tests. Porte uniquement sur des personnes âgées. **CONFIRMÉ** — [PubMed 22696350](https://pubmed.ncbi.nlm.nih.gov/22696350/)
  - Cooper et al. 2015 (24 essais randomisés, toutes populations) : aucune amélioration cognitive dans l'échantillon total ni chez les sujets au développement typique ; mémoire à court terme améliorée seulement chez les personnes à faible statut en oméga-3 (d'après l'extrait PubMed) — [PubMed 26040902](https://pubmed.ncbi.nlm.nih.gov/26040902/)
- **Créatine** :
  - Prokopidis et al. 2023 (Nutr Rev 81:416) : 8 essais méta-analysés ; mémoire **SMD = 0,29** [0,04–0,53], I² = 66 % ; adultes âgés de 66 à 76 ans SMD = 0,88 ; **11–31 ans SMD = 0,03** [−0,14 ; 0,20], non significatif. **CONFIRMÉ** (les notes taguaient ces chiffres [M]) — [PubMed 35984306](https://pubmed.ncbi.nlm.nih.gov/35984306/)
  - Xu et al. 2024 (Frontiers in Nutrition) : 16 essais, 492 participants de 21 à 76 ans, **y compris des malades** ; mémoire **SMD = 0,31** [0,18–0,44], certitude modérée ; plus d'effet chez les 18–60 ans, les femmes et les malades. Un corrigendum de 2025 révise les analyses d'attention et de vitesse de traitement — [Xu et al. 2024](https://www.frontiersin.org/articles/10.3389/fnut.2024.1424972/full) ; [corrigendum 2025](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1570800/pdf)
- **Ginkgo** — Laws 2012 : d = −0,04 (mémoire), −0,05 (fonctions exécutives), −0,08 (attention), tous non significatifs. **CONFIRMÉ** — [PubMed 23001963](https://pubmed.ncbi.nlm.nih.gov/23001963/)
- **Modafinil** :
  - Battleday & Brem 2015 : avec des tests de base, environ la moitié des études seulement montrent un gain en attention et en apprentissage ; avec des évaluations complexes, gains plus constants.
  - Repantis 2010 : chez les sujets reposés, amélioration de l'attention seulement.
  
  **CONFIRMÉ** — [PubMed 26381811](https://pubmed.ncbi.nlm.nih.gov/26381811/) ; [PubMed 20416377](https://pubmed.ncbi.nlm.nih.gov/20416377/)
- **tDCS** — Horvath 2015 : aucune des 59 analyses n'est significative, y compris en mémoire de travail et en production de langage. **CONFIRMÉ** — [PubMed 25701175](https://pubmed.ncbi.nlm.nih.gov/25701175/)
- **Hydratation** — Wittbrodt & Millard-Stafford 2018 : 33 études, 413 sujets ; effet global ES = −0,21 ; attention −0,52 ; au-delà de 2 % de perte de masse −0,28, contre −0,14 à 2 % ou moins. **CONFIRMÉ** — [PubMed 29933347](https://pubmed.ncbi.nlm.nih.gov/29933347/)
- **Gueule de bois** — Gunn 2018 : mémoire à court terme g = 0,64, mémoire à long terme g = 0,59, attention soutenue g = 0,47, vitesse psychomotrice g = 0,66 (11 articles méta-analysés). **CONFIRMÉ** — [PubMed 30144191](https://pubmed.ncbi.nlm.nih.gov/30144191/)
- **Stress** — Shields 2017 : 113 études, 6 216 participants. Le stress juste avant ou pendant le rappel dégrade la mémoire. Le stress avant l'encodage la dégrade aussi, sauf si le délai est très court et le matériel lié au stresseur. Le stress après l'encodage l'améliore. **CONFIRMÉ** — [PubMed 28368148](https://pubmed.ncbi.nlm.nih.gov/28368148/)

### Inferences
- Pour un adulte jeune et bien nourri qui apprend l'anglais, aucun complément n'a de preuve d'accélérer l'apprentissage. La créatine a un effet nul chez les 11–31 ans dans Prokopidis ; la méta-analyse de 2024 qui trouve 0,31 mélange des malades. Les oméga-3 n'ont aucun effet chez les sujets sains bien nourris. La caféine aide la vigilance, pas de façon fiable la mémoire.

### Gaps
- Aucune méta-analyse récente propre à la caféine et à la mémoire à long terme chez l'adulte sain.
- Pas de méta-analyse sur les oméga-3 restreinte aux jeunes adultes sains.

---

## 8. Conception des sessions : durée, pauses, heure de la journée

### Takeaway
Il n'existe toujours aucune preuve solide d'une « durée de session optimale » pour l'apprentissage d'une langue. Les meilleures données disponibles concernent trois points. Des pauses planifiées (24 min de travail et 6 min de pause, ou 12 et 3) réduisent la fatigue sans réduire le travail fait (Biwer 2023, une journée, N = 87). Les micro-pauses donnent un petit gain de vigueur et une baisse de fatigue (d ≈ 0,35), sans effet net sur la performance pour les tâches exigeantes (Albulescu 2022). L'effet de l'heure de la journée est inconstant chez l'adulte jeune.

### Cited Findings
- **Biwer et al. 2023 (BJEP 93:353)** — 87 étudiants, une journée d'étude réelle. Pauses autogérées (n = 35), pauses de 6 min après 24 min de travail (« Pomodoro », n = 25) ou de 3 min après 12 min (n = 27). Les pauses autogérées s'accompagnent de séances et de pauses plus longues, de plus de fatigue et de distraction, et de moins de concentration et de motivation. Aucune différence d'effort ni de tâches accomplies : il y a donc un gain d'efficacité (même travail en moins de temps). **CONFIRMÉ et précisé** (résumé) — [PubMed 36859717](https://pubmed.ncbi.nlm.nih.gov/36859717/)
- **Albulescu et al. 2022 (PLOS ONE 17:e0272460)** — 22 échantillons, N = 2 335. Vigueur **d = 0,36**, fatigue **d = 0,35**, performance **d = 0,16** (p = 0,116, non significatif). Effet significatif seulement pour les tâches peu exigeantes cognitivement. Plus la pause est longue, plus la performance gagne ; pour les tâches très épuisantes, il faudrait « more than 10-minute breaks » — [DOAJ, résumé](https://doaj.org/article/c6f37b6ba159469296b2cb968b65505f)
- **Heure de la journée et chronotype** — Chauhan et al. 2025 (Chronobiology International 42(4):463–499) : 64 études sur des adultes de 18 à 45 ans ; environ 45 % rapportent un effet de synchronie (meilleure performance au moment préféré de la journée), surtout en attention, inhibition et mémoire. Résultats contradictoires en mémoire de travail ; preuves plus nettes chez les personnes âgées (10 études sur 12). Rey-Mermet & Rothen 2023 jugent la plupart des études sous-dimensionnées — [Chauhan et al. 2025, Kingston](https://researchinnovation.kingston.ac.uk/en/publications/chronotype-and-synchrony-effects-in-human-cognitive-performance-a/) ; [Rey-Mermet & Rothen 2023, PDF](https://sonar.unidistance.ch/documents/329143/files/Rey-Mermet%20and%20Rothen%20-%202023%20-%20The%20Interplay%20of%20Time-of-day%20and%20Chronotype%20Result.pdf)
- **Siestes, sommeil entre les sessions et espacement** — Voir les sections 1 et 3 : Cousins 2019, Dutheil 2021, Mazza 2016 et Cepeda 2008 sont les seuls résultats chiffrés qui touchent directement la planification.

### Inferences
- La recommandation du rapport (« blocs de 25 à 50 min avec 5 à 10 min de pause ») est compatible avec ces données, sans être prouvée. Biwer soutient des pauses planifiées plutôt qu'autogérées ; Albulescu suggère des pauses plus longues (plus de 10 min) après une tâche très exigeante comme une conversation intense.
- Heure de la journée : inutile d'optimiser au-delà de deux règles. Étudier quand on est vigilant, et placer une petite session avant le coucher, qui a un effet de consolidation mieux étayé (Gais, Mazza) que l'effet de synchronie.

### Gaps
- Aucune étude sur la durée optimale d'une session de langue ni sur le seuil de rendement décroissant au-delà de quelques heures par jour.
- Biwer 2023 ne mesure pas l'apprentissage à long terme (une journée, accomplissement des tâches seulement).

---

## 9. Les DOI cités renvoient-ils au bon article ?

### Takeaway
Sur 105 DOI vérifiés via Crossref, **101 résolvent vers le bon article**. **Quatre sont erronés** : Hartmann 2020 (erreur 404), Züst 2019 (autre article), Chabris 1999 (réponse de Steele) et Li & Qian dans le rapport (autre article de Li, sur l'amorçage syntaxique). Quelques écarts d'année (publication en ligne ou en version imprimée) sont sans conséquence.

### Cited Findings
- **Erronés** :
  - Hartmann et al. 2020 : 10.1016/j.concog.2020.102966 renvoie une erreur 404 ; **correct : 10.1016/j.concog.2020.103033** — [DOI correct](https://doi.org/10.1016/j.concog.2020.103033)
  - Züst et al. 2019 : 10.1016/j.cub.2019.01.038 renvoie, selon Crossref, à un article sans rapport (premier auteur « Lukeš ») ; **correct : 10.1016/j.cub.2018.12.038** — [notice Univ. Berne](https://boris.unibe.ch/126044)
  - Chabris 1999 : 10.1038/23611 désigne Steele et al., « Prelude or requiem… », pp. 827–8 ; **Chabris : 10.1038/23608** — [DOI Chabris](https://doi.org/10.1038/23608)
  - Rapport, section sur l'aptitude (hors périmètre, mais repéré) : « Li & Qian, SSLA », 10.1017/S0272263120000698, résout vers « Exploring syntactic priming as a measure of implicit language aptitude » (Li, 2021), pas vers une méta-analyse donnant r ≈ 0,5. La méta-analyse d'aptitude de référence est probablement Li 2016 (SSLA, « The construct validity of language aptitude: A meta-analysis »), non vérifiée ici — [DOI cité](https://doi.org/10.1017/S0272263120000698)
- **Écarts d'année sans gravité** (Crossref donne la date de mise en ligne) : Rohrer 2004 pour 2005, Lally 2009 pour 2010, Ludke 2013 pour 2014, Cousins 2018 pour 2019, Schreiner 2014 pour 2015, Garcia-Argibay 2018 pour 2019, Rogowsky 2014 pour 2015, Prokopidis 2022 pour 2023 — [API Crossref](https://api.crossref.org/works/10.1002/ejsp.674)
- **Tous les autres DOI** des notes et des sections vérifiées (Dunlosky, Rowland, Adesope, Yang, Karpicke, Cepeda 2006 et 2008, Kim & Webb, Nakata & Suzuki, Gais, Mazza, Yoo, Watson, Ebrahim, Sana, Stothart, Ward, Drake, Lally, Gollwitzer & Sheeran, Teimouri, Sisk, Macnamara & Burgoyne, Burnette, Symons, Pashler, Simons, Rayner, etc.) renvoient au titre attendu. Le DOI de Gollwitzer & Sheeran est encodé (%28 et %29) dans le rapport, ce qui fonctionne — [doi.org](https://doi.org/10.1016/S0065-2601(06)38002-1)

### Inferences
- Il faut corriger trois DOI dans les notes (Hartmann, Züst, Chabris) et un dans le rapport (Hartmann, section « Une seule tâche à la fois »). Le DOI de Li & Qian, dans la première partie du rapport, est à revoir par le rédacteur.

### Gaps
- Pour Li 2016, le DOI supposé (10.1017/S027226311500042X) n'a renvoyé aucune métadonnée OpenAlex : non vérifié.
