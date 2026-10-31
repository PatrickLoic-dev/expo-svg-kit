import crypto from 'node:crypto';
import fs from 'node:fs';
import type { IconDefinition } from '../types';

export interface CacheEntry {
  hash: string;
  definition: IconDefinition;
}

export type Cache = Record<string, CacheEntry>;

export function hashInput(raw: string, svgoOptionsHash: string, multicolor: boolean): string {
  return crypto
    .createHash('sha1')
    .update(raw)
    .update(svgoOptionsHash)
    .update(multicolor ? '1' : '0')
    .digest('hex');
}

export function hashSvgoOptions(svgoOptions: Record<string, unknown>): string {
  return crypto.createHash('sha1').update(JSON.stringify(svgoOptions)).digest('hex');
}

/** Loads a previous run's cache, when present and readable; returns an empty cache otherwise. */
export function loadCache(cachePath: string): Cache {
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Cache;
  } catch {
    return {};
  }
}

export function saveCache(cachePath: string, cache: Cache): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache), 'utf8');
}
