// Discovers every flower under the repo-root `flowers/` folder and parses it.
// Contributing a flower is exactly "add one file here" — no registry to edit:
// Vite inlines each SVG as a raw string at build time via import.meta.glob.

import { parseFlower, type Flower } from './parseFlower';

export interface LoadResult {
  flowers: Flower[];
  invalid: { id: string; errors: string[] }[];
}

export function idFromPath(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.svg$/i, '');
}

export function collectFlowers(modules: Record<string, string>): LoadResult {
  const flowers: Flower[] = [];
  const invalid: { id: string; errors: string[] }[] = [];

  for (const [path, source] of Object.entries(modules)) {
    const id = idFromPath(path);
    const result = parseFlower(id, source);
    if (result.ok) flowers.push(result.flower);
    else invalid.push({ id, errors: result.errors });
  }

  flowers.sort((a, b) => a.id.localeCompare(b.id));
  return { flowers, invalid };
}

// Glue: the one Vite-specific line. Kept thin so collectFlowers stays testable.
const modules = import.meta.glob('/flowers/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function loadFlowers(): LoadResult {
  return collectFlowers(modules);
}
