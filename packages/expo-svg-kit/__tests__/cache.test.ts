import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRegistry } from '../src/cli/generate';
import { hashInput, hashSvgoOptions } from '../src/cli/cache';

function tmpSvgDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-kit-cache-'));
  fs.writeFileSync(
    path.join(dir, 'star.svg'),
    '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="red"/></svg>'
  );
  return dir;
}

function readCache(cachePath: string): Record<string, { hash: string }> {
  return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

describe('buildRegistry caching', () => {
  it('writes a cache entry whose hash matches the source content and svgo options', async () => {
    const dir = tmpSvgDir();
    const cachePath = path.join(dir, 'registry.ts.cache.json');

    await buildRegistry(dir, {}, cachePath);

    const raw = fs.readFileSync(path.join(dir, 'star.svg'), 'utf8');
    const expectedHash = hashInput(raw, hashSvgoOptions({}), false);
    expect(readCache(cachePath).star.hash).toBe(expectedHash);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns an identical registry on a second run with unchanged input', async () => {
    const dir = tmpSvgDir();
    const cachePath = path.join(dir, 'registry.ts.cache.json');

    const first = await buildRegistry(dir, {}, cachePath);
    const second = await buildRegistry(dir, {}, cachePath);

    expect(second).toEqual(first);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('updates the cache hash when the file content changes', async () => {
    const dir = tmpSvgDir();
    const cachePath = path.join(dir, 'registry.ts.cache.json');

    await buildRegistry(dir, {}, cachePath);
    const firstHash = readCache(cachePath).star.hash;

    fs.writeFileSync(
      path.join(dir, 'star.svg'),
      '<svg viewBox="0 0 24 24"><path d="M0 0L10 0L10 10Z" fill="blue"/></svg>'
    );
    const registry = await buildRegistry(dir, {}, cachePath);

    expect(readCache(cachePath).star.hash).not.toBe(firstHash);
    expect(registry.star.tree[0].props.fill).toBe('currentColor');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('invalidates every cache entry when the svgo options change, even with unchanged content', async () => {
    const dir = tmpSvgDir();
    const cachePath = path.join(dir, 'registry.ts.cache.json');

    await buildRegistry(dir, {}, cachePath);
    const firstHash = readCache(cachePath).star.hash;

    await buildRegistry(dir, { multipass: true }, cachePath);
    expect(readCache(cachePath).star.hash).not.toBe(firstHash);

    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('drops stale entries for deleted files from the cache', async () => {
    const dir = tmpSvgDir();
    const cachePath = path.join(dir, 'registry.ts.cache.json');

    await buildRegistry(dir, {}, cachePath);
    fs.rmSync(path.join(dir, 'star.svg'));
    const registry = await buildRegistry(dir, {}, cachePath);

    expect(registry).toEqual({});
    expect(readCache(cachePath)).toEqual({});
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
