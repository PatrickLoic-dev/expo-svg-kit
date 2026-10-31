# expo-svg-kit

Typed SVG registry and a themeable `<Icon/>` component for Expo / React Native. Pure JS/TS,
no native code — works in Expo Go, iOS, Android, and web.

## Install

```bash
npx expo install react-native-svg
npm install expo-svg-kit
```

`react-native-svg` is a peer dependency.

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

## Example app

See [`example/`](../../example) for a runnable Expo app with a gallery screen, a props demo
screen, and 15 sample SVGs covering fills, strokes, multicolor logos, transforms, and files
exported from Figma/Illustrator.

```bash
npm install
npm run generate --workspace=example
npm run example:web
```

## Roadmap

- **v0.2**: a Metro transformer (`import Logo from './logo.svg'`), `<RemoteSvg/>` with an
  `expo-file-system` cache.
- **v0.3**: Reanimated-powered animations (draw, pulse, spin, color, imperative API).
- **v0.4**: morphing, staggered animations, optional Skia renderer.

## License

MIT
