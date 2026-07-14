import { describe, it, expect } from 'vitest';
import { profileUrl } from './profileUrl';

describe('profileUrl', () => {
  it('builds a github profile url from a bare handle', () => {
    expect(profileUrl('janedoe')).toBe('https://github.com/janedoe');
  });

  it('passes through a value that is already a full url', () => {
    expect(profileUrl('https://example.com/jane')).toBe('https://example.com/jane');
  });

  it('strips a leading @ from a handle', () => {
    expect(profileUrl('@janedoe')).toBe('https://github.com/janedoe');
  });
});
