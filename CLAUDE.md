# expo-svg-kit

## Objectif

Package open source Expo / React Native pour gérer des SVG personnalisés : un registre typé
généré par CLI, un composant `<Icon/>` thémable, et des animations (`<AnimatedIcon/>`, Reanimated).
JS/TS pur, aucun code natif, compatible Expo Go, iOS, Android, web.

## Structure

```
packages/expo-svg-kit/   le package publié (CLI + runtime)
  src/cli/                svg-kit generate : SVGO, parsing, sanitization, cache, génération du registre
  src/runtime/            SvgKitProvider, Icon, RemoteSvg, renderer récursif react-native-svg
  src/metro/              transformer Metro (import direct d'un .svg sans registre)
  src/animated/           AnimatedIcon (spin/pulse/color/draw via react-native-reanimated),
                          exporté séparément sous expo-svg-kit/animated
  bin/svg-kit.js          point d'entrée CLI (compilé en CJS par bob)
example/                  app Expo qui consomme le package via le workspace npm
```

## Commandes

Depuis la racine du monorepo :

```bash
npm install                        # installe tout le workspace
npm run build                      # build du package (react-native-builder-bob)
npm run typecheck                  # tsc --noEmit sur le package
npm run test                       # jest sur le package
npm run generate                   # svg-kit generate sur example/assets/svg
npm run example:web                # lance l'app example sur le web (expo start --web)
```

Dans `example/` : `npx expo start` (iOS/Android, nécessite Expo Go ou un simulateur) ou
`npx expo start --web`.

## Conventions de code

- Code, identifiants et commentaires en anglais ; commentaires courts, uniquement quand le
  "pourquoi" n'est pas évident.
- README en anglais ; échanges avec l'auteur en français.
- Pas de dépendance ajoutée sans raison explicite dans le récapitulatif de session.
- TypeScript strict partout.

### Règle permanente sur les commits

- Aucun commit ni aucune pull request ne doit mentionner Claude comme auteur ou co-auteur :
  pas de `Co-Authored-By: Claude…`, pas de "Generated with Claude Code".
- L'auteur des commits est uniquement celui de la config git locale (`git config user.name` /
  `user.email`), jamais modifiée par un assistant.
- `.claude/settings.json` désactive l'attribution automatique (`includeCoAuthoredBy: false`).
- Cette règle s'applique à toutes les sessions futures sur ce projet.

## Roadmap

- **v0.1** (fait) : CLI `generate`, `<SvgKitProvider/>` + `<Icon/>`, app example, tests,
  CI, publication npm.
- **v0.2** (fait) : transformer Metro (`import Logo from './logo.svg'`), `<RemoteSvg/>` avec
  cache `expo-file-system`.
- **v0.3** (fait) : animations Reanimated (draw, pulse, spin, color, API impérative).
- **v0.4** : morph, stagger, renderer Skia optionnel.

## Dépôt GitHub

https://github.com/PatrickLoic-dev/expo-svg-kit (remote `origin`, branche `master`). Le monorepo
entier y est poussé (package + example + docs).

## Démo publique

- GIF de chaque preset d'animation : `packages/expo-svg-kit/docs/demo-{spin,pulse,color,draw}.gif`,
  générés par `scripts/generate.js` (scratch, pas dans le repo) via `@resvg/resvg-js` + `gifenc` —
  rendu déterministe de l'exacte courbe d'easing utilisée par `AnimatedIcon`, pas une capture
  d'écran. Référencés dans le README via raw.githubusercontent.com.
- Expo Snack (compte de l'auteur) : https://snack.expo.dev/@patrickloic/98e1ca — vendorise le
  runtime (`SvgKitProvider`, `Icon`, `AnimatedIcon`) directement dans `App.js` en JS simple (pas de
  TS), car le package n'est pas encore sur npm. À refaire avec un vrai `npm install expo-svg-kit`
  une fois publié. Tourne sur Expo SDK v54.0.0 (plafond disponible dans Snack) ; reanimated/svg
  ajoutés via le panneau "Problems" → "Add dependency" (versions auto-résolues par Snack).

## État v0.3 (mis à jour en fin de session)

Fait (v0.1) : CLI `svg-kit generate` (SVGO, sanitization, arbre JSON, pathLength, registre typé,
`--watch`, `svg-kit.config.js`, cache incrémental par hash) ; runtime `<SvgKitProvider/>` +
`<Icon/>` (thème, override de calque par id, warning dev sur nom inconnu) ; app `example/`
(15 SVG de test, écrans Gallery et Props demo, thème clair/sombre) vérifiée dans le navigateur
et avec `expo export --platform web` ; ESLint, Prettier, CI GitHub Actions, script `verify-pack`.

Fait (v0.2) : transformer Metro (`src/metro/`) — `import Logo from './logo.svg'` génère un
composant autonome (même pipeline SVGO/sanitization/`currentColor` que le CLI), vérifié en live
dans le navigateur via l'app example (section "Direct import" du Props demo) ; `<RemoteSvg/>`
(`src/runtime/RemoteSvg.tsx`) — télécharge, met en cache (`expo-file-system`, API `File`/
`Directory`/`Paths`) et compile un SVG distant à la volée (`svgo/browser`, pas l'entrée Node de
svgo) ; participe au thème du `<SvgKitProvider/>` le plus proche s'il existe.

Fait (v0.3) : `<AnimatedIcon/>` (`src/animated/`, exporté sous `expo-svg-kit/animated` pour ne
pas forcer `react-native-reanimated` — optionnelle en peer dependency — sur les consommateurs de
`<Icon/>` seul) — animations `spin`/`pulse`/`color` (wrapper `Animated.View`/`Animated.Svg`) et
`draw` (révèle les `path`/`line`/`polyline`/`polygon` via `strokeDashoffset` animé, à partir du
`pathLength` déjà précalculé par le CLI/transformer) ; API impérative `play()`/`pause()`/`reset()`
via ref. Jest configuré avec le resolver web de Reanimated (`react-native-reanimated/jest/resolver`
+ `setUpTests()`) pour exécuter les animations réelles sous Jest. App `example/` : nouvel onglet
"Animations" (spin sur refresh, pulse sur bell, color sur heart, draw sur check), vérifié en live
dans le navigateur (le spin tourne réellement, pas de nouvelle erreur console).

Bug corrigé pendant la review : l'effet qui démarre l'animation s'exécutait même pour un nom
d'icône inconnu (avant le bail-out `!definition`) — corrigé pour ne jamais démarrer d'animation
sur une icône introuvable. Un premier jet des tests a aussi fait planter Jest (boucle infinie
réelle quand `autoPlay` par défaut + `loop: true` tournait sans jamais être arrêtée) — tous les
tests passent désormais `autoPlay={false}` sauf pour tester explicitement play/pause/reset.

51 tests au total (CLI, cache, config, transformer Metro mocké, `RemoteSvg` avec
`expo-file-system` mocké, `AnimatedIcon`).

Reste pour la suite : tester sur iOS/Android réels (seul le web a été vérifié) ; démo live de
`<RemoteSvg/>` dans l'app example (toujours pas de vraie démo réseau) ; publication npm effective
(version package.json toujours à 0.1.0 malgré v0.1→v0.3 livrées — à bumper avant publication) ;
v0.4 (morph, stagger, Skia).
