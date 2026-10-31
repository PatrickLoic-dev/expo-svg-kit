import fs from 'node:fs';
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

function assertValidConfigShape(
  config: unknown,
  configPath: string
): asserts config is SvgKitConfig {
  if (typeof config !== 'object' || config === null) {
    throw new Error(
      `Invalid svg-kit.config.js at ${configPath}: expected an object, got ${typeof config}.`
    );
  }
  const { input, output, svgo } = config as Record<string, unknown>;
  if (input !== undefined && typeof input !== 'string') {
    throw new Error(`Invalid svg-kit.config.js at ${configPath}: "input" must be a string.`);
  }
  if (output !== undefined && typeof output !== 'string') {
    throw new Error(`Invalid svg-kit.config.js at ${configPath}: "output" must be a string.`);
  }
  if (svgo !== undefined && (typeof svgo !== 'object' || svgo === null)) {
    throw new Error(`Invalid svg-kit.config.js at ${configPath}: "svgo" must be an object.`);
  }
}

/** Loads svg-kit.config.js from the cwd (if present) and merges CLI flags over it. */
export function resolveConfig(
  cwd: string,
  cliOverrides: { input?: string; output?: string }
): ResolvedConfig {
  let fileConfig: SvgKitConfig = {};
  const configPath = path.join(cwd, 'svg-kit.config.js');

  if (fs.existsSync(configPath)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- user config, loaded at runtime
    const required = require(configPath);
    fileConfig = required.default ?? required;
    assertValidConfigShape(fileConfig, configPath);
  }

  const input = cliOverrides.input ?? fileConfig.input ?? DEFAULTS.input;
  const output = cliOverrides.output ?? fileConfig.output ?? DEFAULTS.output;

  return {
    input: path.isAbsolute(input) ? input : path.join(cwd, input),
    output: path.isAbsolute(output) ? output : path.join(cwd, output),
    svgo: fileConfig.svgo ?? {},
  };
}
