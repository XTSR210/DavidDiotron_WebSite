# README-IA — Site de David Drioton

> **À lire en premier par toute IA qui travaille sur ce projet.**
> Lis ce document en entier avant d'agir, puis mets-le à jour dans la même
> session dès que tu changes la structure, le design ou les règles. Un
> README-IA périmé fait prendre de mauvaises décisions.

## 1. Le projet en une phrase

Site vitrine de **David Drioton**, artiste peintre pop art à Barjols (Var) :
montrer ses toiles, raconter son parcours et recevoir des **demandes de devis**
pour des toiles sur mesure. Ce n'est pas une boutique : aucun paiement en
ligne, la demande part par email ou WhatsApp.

À ne pas confondre avec les projets voisins du Bureau : `Ecomsia-master`
(SaaS eBay) et `ORVELLAN` (agence web, dont ce site reprend l'idée des scènes
pilotées au défilement).

## 2. Stack

| Brique | Choix | À savoir |
|---|---|---|
| Framework | **Next.js 15** (App Router), React 19, TypeScript strict | |
| Rendu | Pages générées à l'avance (ISR) + fonctions Vercel pour l'atelier | Les pages se régénèrent dès que l'atelier enregistre (étiquette de cache `artworks`) |
| Données | **Vercel Blob**, magasin `david-drioton-atelier` (public, région cdg1) | `atelier/artworks.json` (galerie), `atelier/auth.json` (connexion, chiffrée), `toiles/*` (photos). À défaut : `data/artworks.json` du dépôt |
| Hébergement | **Vercel**, projet `david-drioton` (équipe Ecomsia) → https://david-drioton.vercel.app | Relié au dépôt `XTSR210/DavidDiotron_WebSite` : chaque push sur `main` redéploie |
| Ancienne adresse | GitHub Pages (`xtsr210.github.io/DavidDiotron_WebSite`) | Ne fait plus que rediriger vers Vercel en gardant la page demandée : le workflow existant lance `npm run build` avec `GITHUB_PAGES=true`, et `scripts/build.mjs` publie alors `.github/redirect/` au lieu du site |
| Style | Tailwind CSS v4 + classes maison dans `src/app/globals.css` | Voir §5 |
| Police | Bricolage Grotesque (variable, axes `wdth` + `opsz`) via `next/font` | Une seule famille pour tout le site |
| Dépendances UI | Aucune | Icônes SVG maison (`components/icons.tsx`), animations en CSS |
| Tests | Vitest (`src/lib/__tests__`) | Couvre la grille de prix |

## 3. Commandes

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # à passer avant de livrer
npx vitest run       # tests de la grille de prix
npm run thumbs       # vignettes téléphone (lancé tout seul avant dev et build)
npm run build        # export statique dans out/
npx vercel deploy --prod           # mise en ligne manuelle (sinon : push sur main)
```

Aperçu dans Claude Code : configuration `site` de `.claude/launch.json` (port 3210).

### Espace Atelier (`/admin/`) — entièrement sur Vercel

Rien ne tourne sur l'ordinateur de l'artiste : il ouvre
https://david-drioton.vercel.app/admin/ depuis n'importe quel appareil.

- **Installation** (une fois) : code d'installation `ATELIER_SETUP_CODE`
  (variable Vercel) + choix du mot de passe. Une **clé de secours**
  (16 caractères) s'affiche une seule fois, à noter.
- **Mot de passe oublié** : clé de secours + nouveau mot de passe (une
  nouvelle clé est alors remise). Clé perdue aussi : effacer
  `atelier/auth.json` du magasin Blob et remettre un nouveau
  `ATELIER_SETUP_CODE`, puis refaire l'installation.
- **Sécurité** : empreintes scrypt du mot de passe et de la clé, dans
  `atelier/auth.json` chiffré en AES-256-GCM (clé tirée de `ATELIER_SECRET`,
  le magasin étant public). Session : cookie httpOnly signé (HMAC), 12 h,
  `SameSite=Strict`, invalidée à chaque changement de mot de passe. Contrôle
  de l'origine sur les écritures, 5 essais ratés = blocage 10 min (par
  instance), 0,7 s de pause par erreur.
- **Enregistrer** = en ligne aussitôt : l'API écrit la galerie puis vide le
  cache `artworks` (`revalidateTag`) ; plus de bouton « Publier », plus de
  commit Git pour les toiles.
- **Photos** : préparées dans le navigateur (1600 px + 600 px, JPEG), envoyées
  à `/api/atelier/upload/` (limite Vercel : 4,5 Mo par requête).
- **Variables Vercel** : `BLOB_READ_WRITE_TOKEN` (créée avec le magasin),
  `ATELIER_SECRET` (à ne jamais changer : sinon `auth.json` devient illisible
  et il faut réinstaller), `ATELIER_SETUP_CODE`. En local :
  `npx vercel env pull .env.local`.
- **Tester sans toucher aux vraies données** : `ATELIER_STORE_PREFIX=test-atelier`
  (et un `ATELIER_SETUP_CODE` de test) au lancement de `next dev`, puis
  supprimer le préfixe `test-atelier/` du magasin.

## 4. Architecture

```
src/app/
  layout.tsx            Police, métadonnées, JSON-LD, script data-anim (rien de visible)
  (site)/layout.tsx     En-tête, pied de page, barre mobile des pages publiques
  globals.css           Tout le système visuel (jetons, blocs, scènes, composants)
  (site)/page.tsx       Accueil : enchaînement des scènes et des blocs
  (site)/artiste/ gallery/ order/ rendez-vous/   Pages publiques
  (site)/cgu/ cgv/ mentions-legales/             Pages légales (composant LegalPage)
  admin/                Espace Atelier, avec sa propre barre (layout.tsx) :
                        tableau de bord, liste des toiles, fiche d'édition
  api/atelier/[action]/ API de l'atelier (status, setup, login, logout, reset,
                        password, artworks GET/PUT, upload)
  not-found.tsx  robots.ts  sitemap.ts
src/components/
  scenes/HeroWall.tsx      Scène 1 : le mur de toiles qui défilent (accueil)
  scenes/PaintingBand.tsx  Scène 2 : bande diagonale de toiles et de mots
  scenes/Hanging.tsx       Scène 3 : l'accrochage (cimaise horizontale)
  scenes/CanvasFan.tsx     Scène 4 : l'éventail de toiles de l'appel final
  Section.tsx  PageHero.tsx  TornEdge.tsx   Briques de mise en page
  SiteHeader.tsx  SiteFooter.tsx  MobileCtaBar.tsx  BackToTop.tsx
  ArtCard.tsx  GalleryLightbox.tsx          Galerie et visionneuse
  atelier/AtelierLogin.tsx   Connexion (installation, clé de secours, oubli)
  atelier/ArtworkEditor.tsx  Fiche d'une toile (tous les champs de Artwork)
  atelier/ImageDrop.tsx      Photo : glisser-déposer, réduite à 1600 px en JPEG
  PriceCalculator.tsx  WallPreview.tsx  OrderForm.tsx   Simulateur et commande
  commercial.tsx           CtaBanner, Guarantees, Testimonials, Faq, ProjectStrip
  LegalPage.tsx  icons.tsx
src/lib/
  site.ts               Adresse du site, coordonnées, réseaux, waLink()
  artworks.ts           Galerie : Vercel Blob, sinon data/artworks.json (+ ratio, vignette)
  server/store.ts       Lecture / écriture Vercel Blob (galerie, photos, connexion chiffrée)
  server/auth.ts        Mot de passe, clé de secours, sessions
  atelier-api.ts        Appels du navigateur vers l'API de l'atelier
  image-size.ts         Lit largeur/hauteur des JPEG/PNG au build (serveur seulement)
  ratio.ts              canvasSize() : attributs width/height d'une toile
  use-scroll-progress.ts  Écrit la progression de défilement d'une scène dans --p
  pricing.ts / quote.ts Grille i-CAC et calcul de l'estimation
  testimonials.ts       Avis affichés (voir §7)
  events.ts             Agenda de la page Rendez-vous (vide = texte par défaut)
data/artworks.json      Galerie d'origine (18 œuvres), utilisée tant que l'atelier n'a rien enregistré
public/artworks/        Images des toiles ; public/artist/ : portrait
```

Navigation dans le code : une carte **Graphify** est générée dans
`graphify-out/graph.json` (hors Git). La régénérer après un changement de
structure : `graphify extract src --code-only --no-cluster --max-workers 2 --out . --force`.
Le CSS n'y figure pas.

## 5. Système visuel — « le mur d'affiches »

Direction : l'affiche imprimée et déchirée, d'après les affiches lacérées que
David colle sur ses toiles.

- **Couleurs** : les quatre encres d'imprimerie sur papier journal.
  `--noir #0b0a0c`, `--papier #edebe5`, `--magenta #ec008c`, `--jaune #ffe500`,
  `--cyan #00aeef`. Les anciens noms (`--ink`, `--amber`, `--teal`…) sont
  conservés pour `/admin`.
- **Blocs** : chaque section est un aplat pleine largeur, `<Section tone="…">`
  (`noir`, `papier`, `jaune`, `magenta`, `cyan`). Un bloc redéfinit `--bg`,
  `--fg`, `--fg-soft`, `--line`, `--mark` et les couleurs des boutons : les
  composants n'écrivent jamais une couleur de texte en dur, ils utilisent
  `.soft`, `.faint`, `var(--fg)`. La classe s'appelle `.bloc` (pas `.block`,
  qui est un utilitaire Tailwind).
- **Bord déchiré** : `<TornEdge seed={n} />` ou `torn={n}` sur `Section`, à
  chaque changement de couleur. Le tracé est déterministe (graine).
- **Typographie** : `.poster` (étroite, grasse, capitales) pour les titres,
  avec les tailles `.t-hero`, `.t-page`, `.t-xl`, `.t-lg`, `.t-md`, `.t-sm`.
  Texte courant en largeur normale ; `.lead` pour les chapeaux.
- **Boutons** : `.btn` (aplat, filet noir, ombre portée franche et décalée),
  `.btn-ghost`, `.btn-sm`, `.btn-wa`. Liens de texte : `.link`.
- **Toiles** : jamais recadrées dans la galerie ni l'accrochage ; chaque image
  garde son vrai format grâce à `artwork.ratio`.
- Pas de cartes arrondies, pas d'étiquettes en petites capitales au-dessus des
  titres, pas de flèche ajoutée aux liens.

Les classes maison sont dans `@layer components` : un utilitaire Tailwind
posé sur le même élément gagne toujours.

## 6. Les scènes pilotées au défilement

Principe (repris d'ORVELLAN) : `useScrollProgress(ref, mode)` écrit une
variable CSS `--p` (0 à 1) sur la section ; **tout le mouvement est décrit en
CSS** à partir de `--p`. Deux modes : `pin` (scène épinglée en `sticky`) et
`pass` (scène qui traverse l'écran).

- Les scènes ne s'animent que sous `<html data-anim>`, posé avant le premier
  affichage par un script du `layout` si le visiteur n'a pas demandé « moins
  de mouvement ». Sans JavaScript ou en mouvement réduit, chaque scène a un
  **état fixe lisible** (règles CSS par défaut, hors `html[data-anim]`).
- **HeroWall** : 7 colonnes de toiles qui défilent en boucle (4 sur téléphone,
  5 sur tablette). Le plan, couché en perspective, se redresse entre `--p` 0 et
  0,62 ; le titre s'efface ; l'encart « Entrer dans la galerie » arrive à 0,66.
  Hauteur de la scène : `270svh`.
- **Hanging** : sur ordinateur (≥ 900 px, souris), la scène s'épingle et le
  défilement vertical fait avancer la cimaise ; la course (`--travel`) est
  mesurée en JavaScript. Ailleurs, la rangée se fait glisser au doigt.
- N'animer que `transform` et `opacity`.

## 7. Règles à respecter

1. **Site statique** : pas d'API, pas d'action serveur, pas de `node:*` dans
   un composant client. `lib/artworks.ts` et `lib/image-size.ts` sont réservés
   au serveur ; côté client, utiliser `lib/ratio.ts`.
2. **Liens internes** avec `next/link`. Le site est servi à la racine du
   domaine : chemins de `public/` écrits tels quels (`/artworks/…`).
3. **Aucune donnée inventée présentée comme réelle.** `lib/testimonials.ts`
   ne doit contenir que de vrais avis, avec l'accord de leur auteur ; liste
   vide = section masquée.
4. **Coordonnées** : tout se règle dans `lib/site.ts`.
5. **Réactivité** : vérifier 320, 390, 768, 1024 et 1440 px. `html` et `body`
   sont en `overflow-x: clip` : un débordement ne se voit pas à la barre de
   défilement, il faut contrôler les éléments. Toute grille responsive porte
   `grid-cols-1` en base. Champs de formulaire à 16 px (pas de zoom iPhone).
6. **Accessibilité** : focus clavier visible, `prefers-reduced-motion`
   respecté, cibles tactiles d'au moins 44 px.
7. **Images** : les toiles font 400 px de large. Ne pas les afficher beaucoup
   plus grandes (d'où des murs de nombreuses petites toiles plutôt qu'une
   seule image plein écran).
   Sur téléphone (≤ 640 px), le mur et la bande chargent des vignettes WebP
   de 280 px (`public/artworks/wall/`, générées par `scripts/make-thumbs.mjs`
   avant chaque build, hors Git) ; `artwork.thumb` n'existe que si la
   vignette a été produite, sinon l'image d'origine sert partout.
8. **Prix** : l'estimation vient de la grille i-CAC (`lib/pricing.ts`) ; elle
   est toujours présentée comme indicative, le devis ferme vient de l'atelier.
9. `/admin` : aucun mot de passe ni secret dans le code. Toute vérification
   se fait côté serveur (`lib/server/auth.ts`, `import "server-only"`) ; le
   navigateur passe par `lib/atelier-api.ts`. Ne jamais changer
   `ATELIER_SECRET` sans réinstaller l'atelier.

## 8. État actuel

Fonctionnel : accueil en scènes, page artiste, galerie avec visionneuse
(clavier, flèches, glissement du doigt), simulateur de prix avec aperçu à
l'échelle, formulaire de devis (email, WhatsApp, copie), page rendez-vous,
pages légales, 404, panneau `/admin`.

À faire par le propriétaire :

- `lib/site.ts` : le **téléphone** (`+33 6 00 00 00 00`), le **WhatsApp** et
  l'**email** sont des valeurs provisoires.
- `lib/testimonials.ts` : trois avis dont l'origine n'est pas vérifiée — à
  confirmer ou à vider.
- `public/artworks/art-mtiq2mko.png` (2 Mo) : capture de plan satellite,
  présente dans le dossier mais utilisée nulle part — à supprimer si c'est
  bien une erreur d'envoi.
- `lib/events.ts` : agenda vide.
- Les toiles n'ont ni dimensions, ni année, ni prix dans `data/artworks.json` ;
  les cartels affichent donc seulement le titre et la technique.
- Images des toiles en 400 px : des fichiers plus grands permettraient une
  visionneuse plus nette.

## 9. Journal

### 30 septembre 2026 — Refonte complète

Tout le site public a été redessiné (direction « mur d'affiches », §5) :
nouvelles scènes au défilement (§6), nouvel en-tête avec menu plein écran sur
téléphone, nouveau pied de page, galerie en mur à formats réels, simulateur
avec aperçu à l'échelle, formulaire de commande avec choix visuel de la toile
de référence et lecture des dimensions dans l'adresse (`?w=&h=&ref=`).
Supprimés : `Reveal`, `FloatingArtwork`, `PageTransition`, `useTilt`,
`NavLinks`. Textes conservés, resserrés par endroits. Corrigé au passage :
liens internes en `<a>` qui ignoraient le `basePath`, icône et manifeste sans
`assetPath()`, titres d'onglet en double (« … — David Drioton — David Drioton »).

Vérifié : typecheck, 7 tests Vitest, build statique (avec et sans
`GITHUB_PAGES`), rendu à 320 / 390 / 768 / 820 / 1024 / 1440 / 1920 px sans
débordement, mouvement réduit, menu, visionneuse, simulateur, envoi du
formulaire. L'ancien site est archivé dans `avant-refonte-2026-09-30.tar.gz`
(hors Git).

### 30 septembre 2026 — Optimisation après mesure

Mesure Lighthouse du site en ligne avant correctifs : ordinateur 99 en
performance, téléphone 89 (plus grande image affichée en 3,7 s, 1,3 Mo
d'images), accessibilité 97, SEO 100. Corrigé : vignettes WebP pour le mur et
la bande sur téléphone, priorité de chargement sur les premières toiles du
mur, contraste du texte secondaire discret (`--fg-faint`), et
`trailingSlash: true` (le préchargement du lien vers l'accueil demandait
`/DavidDiotron_WebSite.txt`, introuvable sous GitHub Pages). Non corrigeable
ici : la durée de cache, fixée à 10 minutes par GitHub Pages.

### 1er octobre 2026 — Nouvelle connexion à l'atelier

L'ancien mot de passe (`atelier-2026`) était écrit en clair dans le code du
site, donc lisible par tout visiteur, et la base acceptait les appels de
n'importe quel site. Remplacés par : empreinte scrypt sur l'ordinateur,
création du mot de passe au premier passage, récupération par code affiché
dans la fenêtre de la base, sessions de 12 h, limitation des essais,
origines autorisées. Écran de connexion et panneau refaits dans le style du
site ; ajout de `atelier.command` (Mac), `npm run atelier`, `npm run
atelier:mdp`, et `noindex` sur `/admin/`. Vérifié de bout en bout sur une copie
de la base : création, déconnexion, mauvais mot de passe, code oublié,
rechargement de page, ajout d'une toile avec prix, refus d'une origine
étrangère et d'un appel sans session.

### 1er octobre 2026 — Passage de GitHub Pages à Vercel

Hébergement déplacé sur Vercel (projet `david-drioton`, équipe Ecomsia),
relié au dépôt GitHub : un push sur `main`, y compris le bouton « Publier »
de l'atelier, redéploie le site. Fin du sous-dossier `/DavidDiotron_WebSite` :
suppression de `basePath`, `assetPath()` et des contournements de `/admin`.
L'ancienne adresse GitHub Pages redirige vers Vercel en gardant la page
demandée. La base de l'atelier accepte désormais `david-drioton.vercel.app`
au lieu de `xtsr210.github.io`.

### 1er octobre 2026 — Espace Atelier professionnel

L'espace Atelier a sa propre barre (les pages publiques passent dans le
groupe de routes `app/(site)/`). Tableau de bord : nombre de toiles,
disponibles, vendues, total des prix affichés, et compteur des changements
pas encore publiés (`/api/pending` de la base, d'après `git status`). Liste
en vignettes avec recherche, filtres (prix fixe, sur devis, vendues) et
flèches pour régler l'ordre de la galerie. Fiche complète par toile : photo
par glisser-déposer (réduite à 1600 px dans le navigateur, nom de fichier
unique à chaque remplacement), titre, technique avec suggestions,
dimensions, année, prix fixe ou sur devis, statut, note (affichée dans la
visionneuse). Rien n'est enregistré avant « Enregistrer » ; alerte si on
quitte une fiche modifiée. Sur téléphone, la fiche s'ouvre en plein écran.
Test isolé possible : `ATELIER_PORT` (base) et `NEXT_PUBLIC_ATELIER_URL`
(site) pour viser une copie de la base.

### 1er octobre 2026 — Atelier 100 % en ligne

Demande du propriétaire : rien sur son ordinateur. Suppression de la base
locale (`local-server.mjs`, `atelier.command`, `atelier.bat`) et du mode
GitHub de l'atelier. L'atelier tourne sur Vercel : API `app/api/atelier`,
stockage Vercel Blob, connexion par mot de passe + clé de secours, mise en
ligne immédiate à l'enregistrement (fin de `output: "export"`, pages
régénérées par étiquette de cache). Les toiles d'origine restent servies
depuis `public/artworks/` ; les nouvelles photos (1600 et 600 px) depuis Blob.
Vérifié sur un préfixe de test : installation (mauvais code refusé), clé de
secours, ajout d'une toile avec photo visible aussitôt dans la galerie
publique, mot de passe oublié, ancien mot de passe refusé, API refusée sans
session ou depuis une autre origine, réinstallation bloquée. Données de test
supprimées ensuite.
