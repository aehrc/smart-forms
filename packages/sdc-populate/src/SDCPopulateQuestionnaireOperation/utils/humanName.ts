import type { HumanName } from 'fhir/r4';

/**
 * Returns a display name string from a FHIR HumanName array.
 * Uses the text field if available, otherwise constructs from prefix, given, and family.
 */
export function getDisplayName(name: HumanName[] | undefined): string {
  if (name?.[0]?.text) {
    return `${name?.[0].text ?? null}`;
  }

  const prefix = name?.[0]?.prefix?.[0] ?? '';
  const givenName = name?.[0]?.given?.[0] ?? '';
  const familyName = name?.[0]?.family ?? '';

  const fullName = [prefix, givenName, familyName].filter(Boolean).join(' ');

  if (fullName.length === 0) {
    return 'null';
  }

  return fullName;
}
