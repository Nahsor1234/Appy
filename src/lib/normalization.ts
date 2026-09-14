/** Text normalization shared by Appy v2 discovery and ranking. */

const DIACRITICS_RE = /[\u0300-\u036f]/g;

export function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(" ") : [];
}

export function compactText(value: string): string {
  return normalizeText(value).replace(/\s+/g, "");
}

export function identityKey(title: string, artist: string): string {
  return `${compactText(title)}::${compactText(artist)}`;
}
