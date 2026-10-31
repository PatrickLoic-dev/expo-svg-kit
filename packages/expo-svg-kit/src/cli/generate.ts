import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'svgson';
import { optimize, type Config as SvgoConfig } from 'svgo';
import type { IconRegistry } from '../types';
import { resolveConfig } from './config';
import { fileNameToIconName } from './kebabCase';
import { renderRegistryFile } from './registryGen';
import { sanitizeSvgTree } from './sanitize';
import { svgTreeToIconDefinition } from './svgToTree';

// Typed loosely: svgo's PluginConfig union doesn't model passing `params` to a builtin preset by name.
const DEFAULT_SVGO_CONFIG = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Element ids are load-bearing: <Icon colors={{ [id]: ... }}/> overrides layers by id.
          cleanupIds: false,
        },
      },
    },
    // removeViewBox lives outside preset-default in svgo 4; disable it explicitly instead.
    { name: 'removeViewBox', active: false },
  ],
} as unknown as SvgoConfig;

export interface GenerateOptions {
  cwd: string;
  input?: string;
  output?: string;
  watch?: boolean;
}

function listSvgFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith('.svg'))
    .sort();
}

/** Builds the full icon registry from every SVG file in `input` and returns it alongside its name list. */
export async function buildRegistry(
  inputDir: string,
  svgoOptions: Record<string, unknown>
): Promise<IconRegistry> {
  const registry: IconRegistry = {};
  const seen = new Map<string, string>();

  for (const file of listSvgFiles(inputDir)) {
    const { name, multicolor } = fileNameToIconName(file);
    if (!name) {
      throw new Error(`Could not derive an icon name from file "${file}".`);
    }
    if (seen.has(name)) {
      throw new Error(
        `Duplicate icon name "${name}" derived from "${file}" and "${seen.get(name)}". Rename one of the files.`
      );
    }
    seen.set(name, file);

    const raw = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const optimized = optimize(raw, { ...DEFAULT_SVGO_CONFIG, ...svgoOptions, path: file }).data;
    const parsed = await parse(optimized);
    const sanitized = sanitizeSvgTree(parsed);
    registry[name] = svgTreeToIconDefinition(sanitized, multicolor);
  }

  return registry;
}

async function runOnce(
  options: GenerateOptions
): Promise<{ input: string; output: string; count: number }> {
  const config = resolveConfig(options.cwd, { input: options.input, output: options.output });
  const registry = await buildRegistry(config.input, config.svgo);
  fs.mkdirSync(path.dirname(config.output), { recursive: true });
  fs.writeFileSync(config.output, renderRegistryFile(registry), 'utf8');
  return { input: config.input, output: config.output, count: Object.keys(registry).length };
}

export async function generate(options: GenerateOptions): Promise<void> {
  const result = await runOnce(options);
  console.log(
    `[svg-kit] generated ${result.count} icon(s) -> ${path.relative(options.cwd, result.output)}`
  );

  if (options.watch) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dependency, only loaded in watch mode
    const chokidar = require('chokidar');
    console.log(`[svg-kit] watching ${path.relative(options.cwd, result.input)} for changes...`);
    chokidar.watch(result.input, { ignoreInitial: true }).on('all', async () => {
      try {
        const next = await runOnce(options);
        console.log(
          `[svg-kit] regenerated ${next.count} icon(s) -> ${path.relative(options.cwd, next.output)}`
        );
      } catch (error) {
        console.error(
          '[svg-kit] generation failed:',
          error instanceof Error ? error.message : error
        );
      }
    });
  }
}
