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

Voir le récapitulatif de fin de session dans la conversation pour le détail de ce qui est fait
et ce qui reste.
