# expo-svg-kit

## Objectif

Package open source Expo / React Native pour gérer des SVG personnalisés : un registre typé
généré par CLI, un composant `<Icon/>` thémable, et plus tard des animations (Reanimated).
JS/TS pur, aucun code natif, compatible Expo Go, iOS, Android, web.

## Structure

```
packages/expo-svg-kit/   le package publié (CLI + runtime)
  src/cli/                svg-kit generate : SVGO, parsing, sanitization, génération du registre
  src/runtime/            SvgKitProvider, Icon, renderer récursif react-native-svg
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

- **v0.1** (en cours) : CLI `generate`, `<SvgKitProvider/>` + `<Icon/>`, app example, tests,
  CI, publication npm.
- **v0.2** : transformer Metro (`import Logo from './logo.svg'`), `<RemoteSvg/>` avec cache
  `expo-file-system`.
- **v0.3** : animations Reanimated (draw, pulse, spin, color, API impérative) — ajoute
  `react-native-reanimated` en peer dependency à ce moment, pas avant.
- **v0.4** : morph, stagger, renderer Skia optionnel.

## État v0.1 (mis à jour en fin de session)

Fait : CLI `svg-kit generate` (SVGO, sanitization, arbre JSON, pathLength, registre typé,
`--watch`, `svg-kit.config.js`) ; runtime `<SvgKitProvider/>` + `<Icon/>` (thème, override de
calque par id, warning dev sur nom inconnu) ; app `example/` (15 SVG de test, écrans Gallery et
Props demo, thème clair/sombre) vérifiée dans le navigateur et avec `expo export --platform web` ;
13 tests (CLI + composants, snapshot, `tsc --noEmit` sur le registre généré) ; ESLint, Prettier,
CI GitHub Actions, script `verify-pack`.

Reste pour la suite : tester sur iOS/Android réels (seul le web a été vérifié dans cette
session) ; publication npm effective ; v0.2 (transformer Metro, `<RemoteSvg/>`).
