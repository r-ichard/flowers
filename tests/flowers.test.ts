// The contribution gate. Runs in CI on every pull request: it reads every real
// file in the repo-root `flowers/` folder and asserts it is a valid, safe flower.
// A malformed or unsafe submission fails here before it can be merged.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseFlower } from '../src/flowers/parseFlower';
import { idFromPath } from '../src/flowers/loader';

const flowersDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'flowers');
const svgFiles = readdirSync(flowersDir).filter((f) => f.toLowerCase().endsWith('.svg'));

describe('flowers/ contribution gate', () => {
  it('contains at least one flower', () => {
    expect(svgFiles.length).toBeGreaterThan(0);
  });

  it.each(svgFiles)('%s parses into a valid, safe flower', (file) => {
    const source = readFileSync(join(flowersDir, file), 'utf8');
    const result = parseFlower(idFromPath(file), source);
    // Surface the exact reasons in the failure message so a contributor knows
    // what to fix without reading this test.
    const reasons = result.ok ? '' : result.errors.join('; ');
    expect(result.ok, `${file}: ${reasons}`).toBe(true);
  });

  it('has no duplicate flower ids', () => {
    const ids = svgFiles.map(idFromPath);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
