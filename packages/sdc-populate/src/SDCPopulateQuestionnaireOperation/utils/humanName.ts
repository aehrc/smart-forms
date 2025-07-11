import type { HumanName } from 'fhir/r4';

export function getDisplayName(name: HumanName[] | undefined): string {
  if (name?.[0]?.['text']) {
    return `${name?.[0].text ?? null}`;
  }

  const prefix = name?.[0]?.prefix?.[0] ?? '';
  const givenName = name?.[0]?.given?.[0] ?? '';
  const familyName = name?.[0]?.family ?? '';

  const fullName = `${prefix} ${givenName} ${familyName}`;

  if (fullName.length === 0) {
    return 'null';
  }

  return fullName;
}
