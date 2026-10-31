#!/usr/bin/env node
// Runs `npm pack`, inspects the resulting tarball, and fails if required files are missing
// or if files that should never be published (tests, fixtures, source maps) leaked in.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const packageRoot = path.join(__dirname, '..');

const REQUIRED_FILES = [
  'package.json',
  'README.md',
  'bin/svg-kit.js',
  'lib/commonjs/index.js',
  'lib/module/index.js',
  'lib/typescript/commonjs/index.d.ts',
];

const FORBIDDEN_PATTERNS = [/__tests__\//, /__fixtures__\//, /\.test\./, /\.snap$/];

function listTarballEntries(tarballPath) {
  const gunzipped = zlib.gunzipSync(fs.readFileSync(tarballPath));
  const entries = [];
  let offset = 0;
  while (offset + 512 <= gunzipped.length) {
    const header = gunzipped.subarray(offset, offset + 512);
    const nameRaw = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    if (!nameRaw) break;
    const sizeOctal = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    const size = parseInt(sizeOctal, 8) || 0;
    entries.push(nameRaw.replace(/^package\//, ''));
    const consumed = 512 + Math.ceil(size / 512) * 512;
    offset += consumed;
  }
  return entries;
}

function main() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['pack', '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(`npm pack failed: ${result.stderr || result.error}`);
  }
  // The prepack/prepare hooks print their own output before the --json array, on the same
  // stream, and may themselves contain a literal "[" (e.g. bob's "[typescript] ..." logs).
  // npm's own JSON output starts at a line that is just "[".
  const match = result.stdout.match(/^\[\s*$/m);
  if (!match) {
    throw new Error(`Could not find npm pack --json output in:\n${result.stdout}`);
  }
  const [{ filename }] = JSON.parse(result.stdout.slice(match.index));
  const tarballPath = path.join(packageRoot, filename);

  const entries = listTarballEntries(tarballPath);

  const missing = REQUIRED_FILES.filter((required) => !entries.includes(required));
  const forbidden = entries.filter((entry) =>
    FORBIDDEN_PATTERNS.some((pattern) => pattern.test(entry))
  );

  fs.rmSync(tarballPath, { force: true });

  if (missing.length > 0 || forbidden.length > 0) {
    if (missing.length > 0) console.error('Missing required files in tarball:', missing);
    if (forbidden.length > 0) console.error('Forbidden files leaked into tarball:', forbidden);
    process.exit(1);
  }

  console.log(
    `[verify-pack] OK - ${entries.length} files packed, all required files present, no leaks.`
  );
}

main();
