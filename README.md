# expo-svg-kit

Typed SVG registry and a themeable `<Icon/>` component for Expo / React Native. Pure
JavaScript/TypeScript, no native code — works in Expo Go, iOS, Android, and web.

This is the monorepo root. The published package lives in
[`packages/expo-svg-kit`](packages/expo-svg-kit) — see its
[README](packages/expo-svg-kit/README.md) for the full API reference. A runnable demo app
lives in [`example/`](example).

## Status: v0.1

- CLI: `svg-kit generate` — compiles a folder of SVGs into a typed registry (SVGO
  optimization, `currentColor` theming, layer ids preserved, sanitization, kebab-case
  naming).
- Runtime: `<SvgKitProvider/>` + `<Icon/>` — theme-aware, per-layer color overrides,
  graceful fallback on unknown icon names.
- Example app with a gallery screen, a props demo screen, and 15 sample SVGs (fills,
  strokes, multicolor logos, transforms, Figma/Illustrator exports).
- 13 tests, ESLint + Prettier, GitHub Actions CI, `npm pack` verification.

Not yet implemented (see [Roadmap](#roadmap)): a Metro transformer for `import Logo from
'./logo.svg'`, remote/external SVG loading, and animations.

## Quick start

```bash
npm install
npm run generate --workspace=example   # svg-kit generate on example/assets/svg
npm run example:web                    # expo start --web
```

For iOS/Android, from `example/`:

```bash
npx expo start
```

Then scan the QR code with Expo Go, or press `i` / `a` for a simulator/emulator.

## Monorepo layout

```
packages/expo-svg-kit/   the published package (CLI + runtime)
example/                 Expo app consuming the package via npm workspaces
```

See [CLAUDE.md](CLAUDE.md) for the full set of commands, conventions, and commit rules.

## Roadmap

| Version | Scope |
| ------- | ----- |
| **v0.1** (done) | CLI `generate`, `<SvgKitProvider/>` + `<Icon/>`, example app, tests, CI, publish-ready package. |
| **v0.2** | Metro transformer (`import Logo from './logo.svg'`), `<RemoteSvg/>` with an `expo-file-system` cache for external SVGs. |
| **v0.3** | Reanimated-powered animations (draw, pulse, spin, color, imperative API). `react-native-reanimated` becomes a peer dependency only at this point. |
| **v0.4** | Shape morphing, staggered animations, optional Skia renderer. |

## License

MIT
