/**
 * Turns any string text to a url formatted string
 *
 * @author Sean Fong
 */
export function slugify(string: string) {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^A-Za-z0-9]/, '-');
}
