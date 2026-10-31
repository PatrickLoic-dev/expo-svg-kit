import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveConfig } from '../src/cli/config';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'svg-kit-config-'));
}

describe('resolveConfig', () => {
  it('falls back to defaults when there is no svg-kit.config.js', () => {
    const dir = tmpDir();
    const config = resolveConfig(dir, {});
    expect(config.input).toBe(path.join(dir, 'assets/svg'));
    expect(config.output).toBe(path.join(dir, 'svg-registry.ts'));
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('reads input/output/svgo from svg-kit.config.js', () => {
    const dir = tmpDir();
    fs.writeFileSync(
      path.join(dir, 'svg-kit.config.js'),
      "module.exports = { input: 'icons', output: 'out.ts', svgo: { multipass: true } };"
    );
    const config = resolveConfig(dir, {});
    expect(config.input).toBe(path.join(dir, 'icons'));
    expect(config.output).toBe(path.join(dir, 'out.ts'));
    expect(config.svgo).toEqual({ multipass: true });
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('lets CLI overrides win over the config file', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'svg-kit.config.js'), "module.exports = { input: 'icons' };");
    const config = resolveConfig(dir, { input: 'cli-icons' });
    expect(config.input).toBe(path.join(dir, 'cli-icons'));
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('throws a clear error when svg-kit.config.js has the wrong shape', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'svg-kit.config.js'), 'module.exports = { input: 42 };');
    expect(() => resolveConfig(dir, {})).toThrow(/"input" must be a string/);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('throws when svg-kit.config.js itself throws (syntax/runtime error)', () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'svg-kit.config.js'), 'throw new Error("boom");');
    expect(() => resolveConfig(dir, {})).toThrow(/boom/);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
