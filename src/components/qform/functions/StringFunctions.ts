export function slugify(string: string) {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^A-Za-z0-9]/, '-');
}
