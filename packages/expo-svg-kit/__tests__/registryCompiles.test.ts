import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRegistry } from '../src/cli/generate';
import { renderRegistryFile } from '../src/cli/registryGen';

const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__', 'svg');
const PACKAGE_ROOT = path.join(__dirname, '..');

describe('generated registry', () => {
  it('type-checks with tsc --noEmit against the real expo-svg-kit types', async () => {
    const registry = await buildRegistry(FIXTURES_DIR, {});
    const source = renderRegistryFile(registry);

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-kit-tsc-'));
    fs.writeFileSync(path.join(dir, 'svg-registry.ts'), source, 'utf8');
    fs.writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'esnext',
            module: 'esnext',
            moduleResolution: 'bundler',
            jsx: 'react-jsx',
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            baseUrl: '.',
            paths: { 'expo-svg-kit': [path.join(PACKAGE_ROOT, 'src', 'index.ts')] },
          },
          include: ['svg-registry.ts'],
        },
        null,
        2
      ),
      'utf8'
    );

    const tscScript = require.resolve('typescript/bin/tsc');
    expect(() =>
      execFileSync(process.execPath, [tscScript, '--noEmit', '-p', dir], { stdio: 'pipe' })
    ).not.toThrow();

    fs.rmSync(dir, { recursive: true, force: true });
  });
});
