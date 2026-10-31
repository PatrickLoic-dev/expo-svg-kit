import path from 'node:path';
import type { SvgKitConfig } from '../types';

export interface ResolvedConfig {
  input: string;
  output: string;
  svgo: Record<string, unknown>;
}

const DEFAULTS: Required<Pick<SvgKitConfig, 'input' | 'output'>> = {
  input: 'assets/svg',
  output: 'svg-registry.ts',
};

/** Loads svg-kit.config.js from the cwd (if present) and merges CLI flags over it. */
export function resolveConfig(
  cwd: string,
  cliOverrides: { input?: string; output?: string }
): ResolvedConfig {
  let fileConfig: SvgKitConfig = {};
  const configPath = path.join(cwd, 'svg-kit.config.js');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- user config, loaded at runtime
    const required = require(configPath);
    fileConfig = required.default ?? required;
  } catch {
    // No svg-kit.config.js in cwd: fall back to defaults.
  }

  const input = cliOverrides.input ?? fileConfig.input ?? DEFAULTS.input;
  const output = cliOverrides.output ?? fileConfig.output ?? DEFAULTS.output;

  return {
    input: path.isAbsolute(input) ? input : path.join(cwd, input),
    output: path.isAbsolute(output) ? output : path.join(cwd, output),
    svgo: fileConfig.svgo ?? {},
  };
}
