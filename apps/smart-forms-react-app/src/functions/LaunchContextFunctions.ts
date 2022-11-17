import { HumanName, Patient, Practitioner } from 'fhir/r5';
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

/**
 * Check if SMART Launch is still authenticating/fetching patient and user context
 * Used to trigger a loading spinner if authenticating is still true
 *
 * @author Sean Fong
 */
export function isStillAuthenticating(
  hasClient: boolean | null,
  patient: Patient | null,
  user: Practitioner | null
): boolean {
  const patientUserFound = patient && user;
  return hasClient === null || (hasClient && !patientUserFound);
}
