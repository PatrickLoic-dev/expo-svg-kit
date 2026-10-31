import path from 'node:path';
import { compileSvgToComponentSource } from './compileSvgToComponentSource';

interface BabelTransformerArgs {
  filename: string;
  src: string;
  options: Record<string, unknown>;
  plugins?: unknown[];
}

interface BabelTransformerResult {
  ast: unknown;
  metadata?: unknown;
}

interface UpstreamBabelTransformer {
  transform: (
    args: BabelTransformerArgs
  ) => BabelTransformerResult | Promise<BabelTransformerResult>;
  getCacheKey?: (options: Record<string, unknown>) => string;
}

let cachedUpstream: UpstreamBabelTransformer | undefined;

/**
 * Resolves the project's own JS/TS Babel transformer, so non-SVG files keep going through the
 * exact same pipeline as if expo-svg-kit's transformer were not installed. Defaults to Expo's
 * own transformer, which every Expo project already depends on transitively.
 */
function loadUpstreamTransformer(): UpstreamBabelTransformer {
  if (!cachedUpstream) {
    const upstreamPath =
      process.env.EXPO_SVG_KIT_UPSTREAM_TRANSFORMER ?? '@expo/metro-config/babel-transformer';
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- resolved at runtime, inside the consuming app's Metro process
    cachedUpstream = require(upstreamPath) as UpstreamBabelTransformer;
  }
  return cachedUpstream;
}

function isSvgFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.svg');
}

/**
 * Metro `babelTransformerPath` implementation: rewrites `.svg` files into a generated React
 * component's source before handing off to the project's normal (Expo) Babel transformer.
 * Every other file passes through untouched.
 *
 * Usage, in metro.config.js:
 *
 *   config.transformer.babelTransformerPath = require.resolve('expo-svg-kit/metro-transformer');
 */
export async function transform(args: BabelTransformerArgs): Promise<BabelTransformerResult> {
  const upstream = loadUpstreamTransformer();

  if (!isSvgFile(args.filename)) {
    return upstream.transform(args);
  }

  const componentSource = compileSvgToComponentSource(args.src, path.basename(args.filename));
  return upstream.transform({ ...args, src: componentSource });
}

export function getCacheKey(options: Record<string, unknown>): string {
  const upstream = loadUpstreamTransformer();
  return typeof upstream.getCacheKey === 'function' ? upstream.getCacheKey(options) : '';
}
