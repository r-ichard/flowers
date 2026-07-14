import { describe, it, expect } from 'vitest';
import { idFromPath, collectFlowers } from './loader';

const BODY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>';
const flowerSource = (name: string, author: string) =>
  `<!--\n  name: ${name}\n  author: ${author}\n  model: m\n  prompt: p\n  comment: c\n-->\n${BODY}`;

describe('idFromPath', () => {
  it('derives the id from the file name without directory or extension', () => {
    expect(idFromPath('/flowers/sunflower.svg')).toBe('sunflower');
  });

  it('strips the extension case-insensitively', () => {
    expect(idFromPath('/flowers/Tulip.SVG')).toBe('Tulip');
  });
});

describe('collectFlowers', () => {
  it('returns valid flowers sorted by id and no invalid entries', () => {
    const result = collectFlowers({
      '/flowers/tulip.svg': flowerSource('Tulip', 'Sam'),
      '/flowers/daisy.svg': flowerSource('Daisy', 'Lee'),
    });
    expect(result.invalid).toEqual([]);
    expect(result.flowers.map((f) => f.id)).toEqual(['daisy', 'tulip']);
  });

  it('separates invalid flowers with their errors instead of dropping them silently', () => {
    const result = collectFlowers({
      '/flowers/good.svg': flowerSource('Good', 'Sam'),
      '/flowers/bad.svg': BODY, // valid canvas, but no author header
    });
    expect(result.flowers.map((f) => f.id)).toEqual(['good']);
    expect(result.invalid).toEqual([
      {
        id: 'bad',
        errors: [
          'missing required field: name',
          'missing required field: author',
          'missing required field: model',
          'missing required field: prompt',
          'missing required field: comment',
        ],
      },
    ]);
  });
});
