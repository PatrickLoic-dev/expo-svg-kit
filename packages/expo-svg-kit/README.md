<div align="center">

# expo-svg-kit

[![npm version](https://img.shields.io/npm/v/expo-svg-kit?color=10b981&style=flat-square)](https://www.npmjs.com/package/expo-svg-kit)
[![License: MIT](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](https://github.com/PatrickLoic-dev/expo-svg-kit/blob/master/LICENSE)
[![Built for Expo](https://img.shields.io/badge/built%20for-Expo-10b981?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![GitHub stars](https://img.shields.io/github/stars/PatrickLoic-dev/expo-svg-kit?color=10b981&style=flat-square)](https://github.com/PatrickLoic-dev/expo-svg-kit)

<p>
  Typed SVG registry and a themeable <code>&lt;Icon/&gt;</code> component for Expo / React Native.<br/>
  Pure JS/TS, no native code — works in Expo Go, iOS, Android, and web.
</p>

**[View on GitHub](https://github.com/PatrickLoic-dev/expo-svg-kit)** — if this saves you time, a ⭐ helps others find it.

</div>

---

## Why expo-svg-kit?

- **Typed by construction** — the CLI generates a registry, so `<Icon name="..."/>` is
  autocompleted and typo-checked against your actual SVG files.
- **One `color` prop, everywhere** — fixed `fill`/`stroke` values are rewritten to
  `currentColor` at build time, so a single prop recolors an icon (or a theme key recolors a
  whole app).
- **Three ways to render an SVG**, depending on where it lives: a typed registry (`<Icon/>`),
  a direct bundled import (`import Logo from './logo.svg'`), or a URL fetched on-device
  (`<RemoteSvg/>`).
- **Animations when you want them, not when you don't** — `<AnimatedIcon/>` (spin, pulse,
  color, draw) lives behind a separate `expo-svg-kit/animated` entry point, so Reanimated is
  only pulled in if you actually use it.
- **No native code** — pure JS/TS on top of `react-native-svg`. Works in Expo Go.
- **Safe by default** — every SVG is sanitized (`<script>`, `on*` handlers, external
  references stripped) whether it comes from disk or a URL.

## Install

```bash
npx expo install react-native-svg
npm install expo-svg-kit
```

`react-native-svg` is a peer dependency.

## Implementation guide: the new v0.2 tags

Two new ways to render an SVG were added in v0.2, on top of the existing `<Icon/>` +
registry workflow. Pick whichever fits the asset:

### `<Logo/>`-style direct `.svg` imports (bundled files, no registry)

1. Point Metro at the kit's transformer, in `metro.config.js`:
   ```js
   const { getDefaultConfig } = require('expo/metro-config');
   const config = getDefaultConfig(__dirname);

   config.transformer.babelTransformerPath = require.resolve('expo-svg-kit/metro-transformer');
   config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
   config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

   module.exports = config;
   ```
2. Declare the `.svg` module type once, in a `global.d.ts` at the project root:
   ```ts
   /// <reference types="expo-svg-kit/svg-module" />
   ```
3. Import and render the file directly, as a component:
   ```tsx
   import Logo from './assets/logo.svg';

   <Logo size={32} color="#4F46E5" />;
   ```
   No `<SvgKitProvider/>` or registry needed — `color`/`colors` only take literal values
   here, not theme keys (see [Direct `.svg` imports](#direct-svg-imports-metro-transformer)
   below for details and limitations).

### `<RemoteSvg/>` (SVGs fetched from a URL)

1. Install the peer dependency it needs to cache files on-device:
   ```bash
   npx expo install expo-file-system
   ```
2. Render it with a `uri`:
   ```tsx
   import { RemoteSvg } from 'expo-svg-kit';

   <RemoteSvg uri="https://example.com/logo.svg" size={40} color="primary" fallback={<Spinner />} />;
   ```
3. Optional: wrap it in `<SvgKitProvider/>` to resolve `color`/`colors` against a theme
   instead of literal values — see [`<RemoteSvg/>`](#remotesvg-svgs-from-a-url) below for
   the full props table.

## CLI: `svg-kit generate`

Compiles a folder of SVG files into a typed registry file.

```bash
npx svg-kit generate
npx svg-kit generate --input assets/svg --output svg-registry.ts
npx svg-kit generate --watch
```

What it does, per SVG file:

- Optimizes the markup with [SVGO](https://github.com/svg/svgo).
- Replaces fixed `fill`/`stroke` colors with `currentColor` so icons follow `<Icon color/>`.
  Skip this for multicolor assets (logos, illustrations) by naming the file `*.multicolor.svg`
  — e.g. `Brand-Logo.multicolor.svg`.
- Converts the SVG into a lightweight JSON tree (tag, attributes, children, viewBox).
- Precomputes the total length of `<path>`/`<line>`/`<polyline>`/`<polygon>` geometry, for
  future draw-style animations.
- Strips `<script>`, `on*` event handlers, and external `href`/`xlink:href` references.
- Derives a kebab-case icon name from the filename (`ArrowRight.svg` → `arrow-right`). A
  collision between two files raises a clear error.

### Configuration

Add an optional `svg-kit.config.js` at the root of the consuming project:

```js
/** @type {import('expo-svg-kit').SvgKitConfig} */
module.exports = {
  input: 'assets/svg',
  output: 'svg-registry.ts',
  svgo: {/* merged over the kit's default SVGO config */},
};
```

CLI flags (`--input`, `--output`) take priority over the config file.

Each run writes a `<output>.cache.json` file next to the registry (e.g. `svg-registry.ts.cache.json`),
keyed by a hash of each file's content and the active SVGO options. Unchanged files skip SVGO/parsing
entirely on the next run — add this file to `.gitignore`.

## Runtime: `<SvgKitProvider/>` and `<Icon/>`

```tsx
import { SvgKitProvider, Icon } from 'expo-svg-kit';
import { registry } from './svg-registry';

const theme = { primary: '#4F46E5', danger: '#DC2626' };

function App() {
  return (
    <SvgKitProvider registry={registry} theme={theme}>
      <Icon name="star" size={24} color="primary" />
    </SvgKitProvider>
  );
}
```

### `<Icon/>` props

| Prop                 | Type                     | Description                                                                         |
| -------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `name`               | `string`                 | Icon name from the registry (`IconName` is inferred from your registry).            |
| `size`               | `number` (default `24`)  | Width and height.                                                                   |
| `color`              | `string`                 | A literal color, or a key in the active theme.                                      |
| `strokeWidth`        | `number`                 | Forwarded to the underlying `<Svg/>`.                                               |
| `colors`             | `Record<string, string>` | Override individual layers by their SVG element `id`. Values accept theme keys too. |
| `accessibilityLabel` | `string`                 | Makes the icon an accessible element with this label.                               |

Unknown icon names render nothing and log a warning in development — they never crash.

## Direct `.svg` imports (Metro transformer)

Skip the registry/CLI entirely and import a single SVG as a component, via a custom Metro
`babelTransformerPath`. In `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('expo-svg-kit/metro-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
```

Then, in a `global.d.ts` at your project root (so TypeScript recognizes `.svg` imports):

```ts
/// <reference types="expo-svg-kit/svg-module" />
```

```tsx
import Logo from './logo.svg';

<Logo size={32} color="#4F46E5" />;
```

The generated component goes through the same SVGO config, sanitization, and `currentColor`
theming as `svg-kit generate` — but it's self-contained (no `<SvgKitProvider/>` needed) and its
`color`/`colors` props only accept literal colors, not theme keys, since it has no registry or
theme to resolve against.

## `<RemoteSvg/>`: SVGs from a URL

For SVGs that aren't bundled with the app — user uploads, a CMS, an icon API — `<RemoteSvg/>`
downloads, caches (via `expo-file-system`), and compiles them on-device:

```tsx
import { RemoteSvg } from 'expo-svg-kit';

<RemoteSvg uri="https://example.com/logo.svg" size={40} color="primary" fallback={<Spinner />} />;
```

It requires `expo-file-system` as a peer dependency (`npx expo install expo-file-system`).
Downloaded files are cached under `Paths.cache/expo-svg-kit/`, keyed by a hash of the `uri`; pass
`forceRefresh` to bypass the cache. Unlike direct `.svg` imports, `<RemoteSvg/>` participates in
the nearest `<SvgKitProvider/>`'s theme when one is present, so `color`/`colors` accept theme
keys there too. On-device compilation uses `svgo/browser` (svgo's dedicated browser/Hermes-safe
build) rather than its Node entry point.

### `<RemoteSvg/>` props

| Prop                 | Type                     | Description                                                              |
| --------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `uri`                 | `string`                 | URL of the SVG to fetch.                                                   |
| `size`                | `number` (default `24`)  | Width and height.                                                          |
| `color`               | `string`                 | A literal color, or (inside an `<SvgKitProvider/>`) a theme key.           |
| `strokeWidth`         | `number`                 | Forwarded to the underlying `<Svg/>`.                                      |
| `colors`              | `Record<string, string>` | Override individual layers by their SVG element `id`.                      |
| `multicolor`          | `boolean`                | Skip `currentColor` theming, for multicolor assets.                        |
| `forceRefresh`        | `boolean`                | Re-download even if a cached copy exists.                                  |
| `fallback`            | `ReactNode`               | Rendered while the SVG is being downloaded/compiled.                       |
| `onError`             | `(error: Error) => void` | Called if the download or compilation fails.                               |
| `accessibilityLabel`  | `string`                  | Makes the icon an accessible element with this label.                      |

## Animations: `<AnimatedIcon/>` (v0.3)

`spin`, `pulse`, `color`, and `draw` animations, powered by
[`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/). It lives in a
separate entry point, `expo-svg-kit/animated`, so installing `expo-svg-kit` never pulls in
Reanimated for consumers who only use `<Icon/>` — it's an optional peer dependency.

```bash
npx expo install react-native-reanimated
```

```tsx
import { AnimatedIcon } from 'expo-svg-kit/animated';

<AnimatedIcon name="refresh" animation="spin" size={32} color="primary" />;
```

Like `<Icon/>`, `<AnimatedIcon/>` reads from the active `<SvgKitProvider/>` registry and theme.

- **`spin`** — continuous rotation. Loops by default.
- **`pulse`** — scales up and back down. Loops by default.
- **`color`** — fades from `color` to `toColor`. One-shot by default.
- **`draw`** — reveals `<path>`/`<line>`/`<polyline>`/`<polygon>` shapes by animating
  `strokeDashoffset` from the CLI/transformer's precomputed `pathLength`. One-shot by default.
  Works best with stroke-based (outline) icons — shapes without a stroke, or without a
  precomputed length (e.g. `<circle>`), render immediately instead of drawing in.

Control playback imperatively with a ref:

```tsx
import { useRef } from 'react';
import { AnimatedIcon, type AnimatedIconHandle } from 'expo-svg-kit/animated';

const ref = useRef<AnimatedIconHandle>(null);

<AnimatedIcon ref={ref} name="check" animation="draw" autoPlay={false} />;
// later: ref.current?.play() / .pause() / .reset()
```

### `<AnimatedIcon/>` props

All `<Icon/>` props, plus:

| Prop         | Type                | Description                                                                  |
| ------------ | ------------------- | ----------------------------------------------------------------------------- |
| `animation`  | `'spin' \| 'pulse' \| 'color' \| 'draw'` | Which animation to play.                                 |
| `duration`   | `number`             | Length of one cycle, in ms. Defaults depend on `animation`.                  |
| `loop`       | `boolean`            | Repeat forever. Defaults to `true` for `spin`/`pulse`, `false` for `color`/`draw`. |
| `autoPlay`   | `boolean` (default `true`) | Play automatically on mount, and whenever `animation`/`duration`/`loop` change. |
| `pulseScale` | `number` (default `1.15`) | `pulse` only: the peak scale factor.                              |
| `toColor`    | `string`             | `color` only: the color to animate toward. Accepts theme keys too.           |

## Example app

See [`example/`](../../example) for a runnable Expo app with a gallery screen, a props demo
screen, an animations screen, and 15 sample SVGs covering fills, strokes, multicolor logos,
transforms, and files exported from Figma/Illustrator.

```bash
npm install
npm run generate --workspace=example
npm run example:web
```

## Roadmap

- **v0.1** (done): CLI `generate`, `<SvgKitProvider/>` + `<Icon/>`, example app, tests, CI.
- **v0.2** (done): a Metro transformer (`import Logo from './logo.svg'`), `<RemoteSvg/>` with an
  `expo-file-system` cache.
- **v0.3** (done): Reanimated-powered animations (`<AnimatedIcon/>`: draw, pulse, spin, color,
  imperative API).
- **v0.4**: morphing, staggered animations, optional Skia renderer.

## Development

```bash
git clone https://github.com/PatrickLoic-dev/expo-svg-kit.git
cd expo-svg-kit
npm install
npm run build --workspace=expo-svg-kit
npm run test --workspace=expo-svg-kit
npm run typecheck --workspace=expo-svg-kit
```

## Contributing

Issues and pull requests are welcome on
[github.com/PatrickLoic-dev/expo-svg-kit](https://github.com/PatrickLoic-dev/expo-svg-kit).
If this package is useful to you, consider **starring the repo** — it helps others discover it.

## License

MIT © [Patrick Loïc Kangue](https://github.com/PatrickLoic-dev)
