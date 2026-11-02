# Benchmark: expo-svg-kit vs. react-native-nano-icons

**TL;DR:** `expo-svg-kit` renders icons as a tree of `react-native-svg` primitives from a
JSON description. [`react-native-nano-icons`](https://github.com/software-mansion-labs/react-native-nano-icons)
(Software Mansion) converts your SVGs into a font at build time and renders icons as stacked
font glyphs. The glyph approach is measurably cheaper per icon, especially at large counts —
but it requires React Native's New Architecture, a build step with native font linking, and
gives up a few things `expo-svg-kit` does: arbitrary runtime SVGs, per-layer color overrides
on multicolor art, and animations. See [When to use which](#when-to-use-which) below.

## Our measurement (expo-svg-kit)

- **What:** mount 50 `<Icon/>` instances (cycling through the example app's 15-icon registry)
  inside a `ScrollView`, wrapped in React's `<Profiler>`.
- **Metric:** `actualDuration` reported by `Profiler`'s `onRender` callback for the `'mount'`
  phase — React's own measurement of the time spent rendering that subtree.
- **Where:** web (Chromium, via `react-native-web` + `react-native-svg`'s web renderer), **dev
  build** (`expo start --web`, unminified, with React's extra dev-mode checks). This is a slower
  environment than a release build — treat the number below as an upper bound, not a best case.
- **Sample:** 20 runs (full remount each time), same session, same machine.

| | |
|---|---|
| Average | **12.11 ms** |
| Range | 9.6 ms – 18.9 ms (first run was the slowest — JIT warmup) |
| Raw samples (ms) | `18.9, 15, 15.8, 14, 12.8, 13.2, 13.3, 11.4, 10, 11.7, 9.6, 11.1, 13, 10.1, 10.4, 10.0, 9.7, 10, 11.2, 11` |

Reproduce it yourself: the harness is small enough to paste into a throwaway screen — see
[Reproduction](#reproduction) below.

## react-native-nano-icons' own published numbers

We did not reproduce these ourselves (they require a release iOS build profiled with Xcode
Instruments, which this environment doesn't have). Quoting their
[BENCHMARKS.md](https://github.com/software-mansion-labs/react-native-nano-icons/blob/main/packages/react-native-nano-icons/docs/BENCHMARKS.md)
directly, with full attribution:

- **What:** 1,000 different multicolor icons in a `ScrollView`.
- **Where:** iPhone 15 Pro, iOS 18, React Native 0.84 (New Architecture, Fabric), **release**
  build, measured with Xcode Instruments.
- **Sample:** averaged over 20 runs.

| Library | JS Thread (ms) | Main Thread (ms) | Hang (ms) |
|---|---:|---:|---:|
| `react-native-svg` | 192.03 | 292.15 | — |
| **`react-native-nano-icons`** | **74.97** | **155.04** | — |

## Why these numbers aren't directly comparable

Different icon count (50 vs. 1,000), different platform (web dev build vs. native release
build), different tooling (React Profiler vs. Xcode Instruments). We're not claiming a 1:1
ratio here — we're citing both because the *qualitative* story holds regardless of
methodology: `react-native-svg` (and therefore `expo-svg-kit`, which is built on it) mounts a
real native view per SVG element, while nano-icons mounts a handful of text/glyph layers no
matter how complex the source SVG was. That gap grows with icon count, which is exactly what
nano-icons' own `react-native-svg` baseline (192ms/292ms at 1,000 icons) illustrates.

## When to use which

| | `expo-svg-kit` | `react-native-nano-icons` |
|---|---|---|
| **Icon source** | Any SVG, including ones only known at runtime (CMS, user uploads via `<RemoteSvg/>`) | A fixed icon set, converted to a font at build time |
| **Per-layer recolor** | Yes — override any layer by its SVG `id` | Yes — per-layer `color` array, order-based |
| **Animation** | `spin`/`pulse`/`color`/`draw` via `expo-svg-kit/animated`, imperative `play()`/`pause()`/`reset()` | Not supported on `<Icon/>` (native tab-bar symbols can use SF Symbol effects on iOS only) |
| **Setup** | `npm install`, works in **Expo Go** immediately | CLI/config-plugin step to build the font; Expo Go falls back to stacked `<Text>` |
| **Platform floor** | Any RN + `react-native-svg` version | RN 0.81+, **New Architecture only** |
| **Best for** | A few to a few dozen icons on screen, icons that change at runtime, icons that need to animate | Large, static icon sets rendered in bulk (big lists, grids) where raw render cost matters most |

If you're building a typical app screen — a handful of icons in a header, a list, a settings
page — the render-time difference is not something a user will ever perceive; pick based on
features (multicolor overrides, animations, Expo Go support) rather than performance. If
you're rendering hundreds of icons at once (a dense grid, a huge list), nano-icons' glyph
approach is built exactly for that case.

## Reproduction

```tsx
import React, { Profiler, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, SvgKitProvider } from 'expo-svg-kit';
import { registry, type IconName } from './svg-registry';

const names = Object.keys(registry) as IconName[];
const icons = Array.from({ length: 50 }, (_, i) => names[i % names.length]);

function Bench() {
  const [runId, setRunId] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  return (
    <ScrollView>
      <Text>avg: {(results.reduce((a, b) => a + b, 0) / results.length || 0).toFixed(3)} ms</Text>
      <Pressable onPress={() => setRunId((id) => id + 1)}>
        <Text>Run once</Text>
      </Pressable>
      <Profiler
        key={runId}
        id="bench"
        onRender={(_id, phase, actualDuration) => {
          if (phase === 'mount') setResults((prev) => [...prev, actualDuration]);
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {icons.map((name, i) => (
            <Icon key={i} name={name} size={24} />
          ))}
        </View>
      </Profiler>
    </ScrollView>
  );
}
```
