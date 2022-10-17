import { HumanName } from 'fhir/r5';

/**
 * Construct a proper name from various name variations from different implementations
 *
 * @author Sean Fong
 */
export function constructName(name: HumanName[] | undefined): string {
  if (name?.[0]['text']) {
    return `${name?.[0].text}`;
  } else {
    const prefix = name?.[0].prefix?.[0] ?? '';
    const givenName = name?.[0].given?.[0] ?? '';
    const familyName = name?.[0].family ?? '';

    return `${prefix} ${givenName} ${familyName}`;
  }
}
