import { parse } from 'svgson';
// Runs on-device: svgo's default entry point touches Node built-ins, so this uses the
// dedicated browser build instead (safe in Hermes / React Native / web).
import { optimize } from 'svgo/browser';
import { sanitizeSvgTree } from '../cli/sanitize';
import { DEFAULT_SVGO_CONFIG } from '../cli/svgoConfig';
import { svgTreeToIconDefinition } from '../cli/svgToTree';
import type { IconDefinition } from '../types';

/** Compiles raw SVG markup (e.g. just downloaded by <RemoteSvg/>) into an IconDefinition, on-device. */
export async function compileRemoteSvg(
  rawSvg: string,
  multicolor: boolean
): Promise<IconDefinition> {
  const optimized = optimize(rawSvg, DEFAULT_SVGO_CONFIG).data;
  const parsed = await parse(optimized);
  const sanitized = sanitizeSvgTree(parsed);
  return svgTreeToIconDefinition(sanitized, multicolor);
}
