import type { SvgKitTheme } from '../types';

/** Resolves a color prop that may be a literal color or a key into the active theme. */
export function resolveColor(value: string | undefined, theme: SvgKitTheme): string | undefined {
  if (!value) return undefined;
  return theme[value] ?? value;
}
