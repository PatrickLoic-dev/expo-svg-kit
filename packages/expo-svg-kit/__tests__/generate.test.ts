import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRegistry } from '../src/cli/generate';
import { renderRegistryFile } from '../src/cli/registryGen';

const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__', 'svg');

describe('buildRegistry', () => {
  it('compiles every fixture SVG into the registry, matching the snapshot', async () => {
    const registry = await buildRegistry(FIXTURES_DIR, {});
    expect(registry).toMatchSnapshot();
  });

  it('replaces fixed colors with currentColor unless the file is marked .multicolor', async () => {
    const registry = await buildRegistry(FIXTURES_DIR, {});
    expect(registry.star.tree[0].props.fill).toBe('currentColor');
    expect(registry['brand-logo'].multicolor).toBe(true);
    expect(registry['brand-logo'].tree.find((n) => n.props.id === 'bg')?.props.fill).toBe('#123456');
  });

  it('sanitizes dangerous content from malicious.svg', async () => {
    const registry = await buildRegistry(FIXTURES_DIR, {});
    const tags = registry.malicious.tree.map((node) => node.tag);
    expect(tags).not.toContain('script');
  });

  it('throws a clear error on duplicate derived names', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-kit-dup-'));
    fs.writeFileSync(path.join(dir, 'add-circle.svg'), '<svg viewBox="0 0 24 24"><path d="M0 0" /></svg>');
    fs.writeFileSync(path.join(dir, 'add_circle.svg'), '<svg viewBox="0 0 24 24"><path d="M0 0" /></svg>');

    await expect(buildRegistry(dir, {})).rejects.toThrow(/Duplicate icon name/);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('generates a registry whose TypeScript compiles cleanly', async () => {
    const registry = await buildRegistry(FIXTURES_DIR, {});
    const source = renderRegistryFile(registry);
    expect(source).toContain("export type IconName =");
    expect(source).toContain("'star'");
  });
});
