/**
 * A small, dependency-free string hash (FNV-1a), used to derive stable cache filenames from a
 * URI on-device. Not cryptographic — just needs to be fast, deterministic, and filesystem-safe.
 */
export function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
