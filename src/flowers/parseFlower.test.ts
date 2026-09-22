import { describe, it, expect } from 'vitest';
import { parseFlower } from './parseFlower';

const HEADER = `<!--
  name: Sunflower
  author: Jane Doe
  model: claude-opus-4-8
  comment: Took about a minute; worked on the first try.
  github: janedoe
-->`;
const BODY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></svg>';
const validSource = `${HEADER}\n${BODY}`;

// A header with every required field, minus whichever one a test wants missing.
const headerWithout = (omit: string) => {
  const lines = [
    'name: Rose',
    'author: Sam',
    'model: claude-sonnet-5',
    'comment: Three tries before it looked right.',
  ].filter((line) => !line.startsWith(`${omit}:`));
  return `<!--\n  ${lines.join('\n  ')}\n-->\n${BODY}`;
};

describe('parseFlower', () => {
  it('accepts a flower without a prompt and returns only the supported experiment fields', () => {
    const result = parseFlower('sunflower', validSource);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower).toEqual({
      id: 'sunflower',
      name: 'Sunflower',
      author: 'Jane Doe',
      model: 'claude-opus-4-8',
      comment: 'Took about a minute; worked on the first try.',
      github: 'janedoe',
      svg: validSource,
    });
  });

  it('omits github when the header does not provide it', () => {
    const result = parseFlower('rose', headerWithout('github'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower.github).toBeUndefined();
  });

  it.each(['name', 'author', 'model', 'comment'])(
    'reports an error when the required field %s is missing',
    (field) => {
      const result = parseFlower('x', headerWithout(field));
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors).toContain(`missing required field: ${field}`);
    },
  );

  it('treats an empty field value as missing', () => {
    const source = `<!--\n  name:\n  author: S\n  model: m\n  comment: c\n-->\n${BODY}`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('missing required field: name');
  });

  it('reports every missing field at once', () => {
    const result = parseFlower('x', BODY);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    for (const field of ['name', 'author', 'model', 'comment']) {
      expect(result.errors).toContain(`missing required field: ${field}`);
    }
  });

  it('keeps colons inside a value (only splits on the first colon)', () => {
    const source = `<!--\n  name: R\n  author: S\n  model: m\n  comment: Asked for: a big flower\n-->\n${BODY}`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower.comment).toBe('Asked for: a big flower');
  });

  it('trims whitespace around keys and values', () => {
    const source = `<!--\n     name  :   Daisy   \n  author :  Lee \n  model: m\n  comment: c\n-->\n${BODY}`;
    const result = parseFlower('daisy', source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower.name).toBe('Daisy');
    expect(result.flower.author).toBe('Lee');
  });

  it('ignores header lines without a colon', () => {
    const source = validSource.replace('-->', 'nameX\n-->');
    const result = parseFlower('sunflower', source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower.name).toBe('Sunflower');
  });

  it('keeps an existing value when a later header entry is empty', () => {
    const source = validSource.replace('-->', 'name:   \n-->');
    const result = parseFlower('sunflower', source);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flower.name).toBe('Sunflower');
  });

  it('reports an error when there is no svg element', () => {
    const source = HEADER.replace('-->', '-->\n<div>not an svg</div>');
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('no <svg> element found');
  });

  it('detects the svg element case-insensitively', () => {
    const source = `${HEADER}\n<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255"></SVG>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(true);
  });

  it('reports an error when the viewBox is missing', () => {
    const source = `${HEADER}\n<svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('svg must declare viewBox="0 0 255 255"');
  });

  it('reports an error when the viewBox is not 0 0 255 255', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 100 100"></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('svg must declare viewBox="0 0 255 255"');
  });

  it('accepts a viewBox with extra surrounding whitespace', () => {
    const source = `${HEADER}\n<svg viewBox=" 0  0  255  255 "></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(true);
  });

  it('accepts whitespace around the viewBox equals sign', () => {
    const source = `${HEADER}\n<svg viewBox = "0 0 255 255"></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(true);
  });

  it('rejects a source containing a <script> tag', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 255 255"><script>alert(1)</script></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('disallowed content: <script> tag');
  });

  it('rejects a <script> tag that has attributes (space after the tag name)', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 255 255"><script src="evil.js"></script></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('disallowed content: <script> tag');
  });

  it('rejects an inline event handler even with spaces around the equals sign', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 255 255" onload = "alert(1)"></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('disallowed content: inline event handler');
  });

  it('rejects a source containing an inline event handler', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 255 255" onload="alert(1)"></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('disallowed content: inline event handler');
  });

  it('rejects a source containing a javascript: URI', () => {
    const source = `${HEADER}\n<svg viewBox="0 0 255 255"><a href="javascript:alert(1)">x</a></svg>`;
    const result = parseFlower('x', source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContain('disallowed content: javascript: URI');
  });
});
