// A github value may be a bare handle ("janedoe"), an "@handle", or a full URL
// pasted by a contributor. Normalize all three to a clickable profile link.
export function profileUrl(github: string): string {
  if (/^https?:\/\//i.test(github)) return github;
  return `https://github.com/${github.replace(/^@/, '')}`;
}
