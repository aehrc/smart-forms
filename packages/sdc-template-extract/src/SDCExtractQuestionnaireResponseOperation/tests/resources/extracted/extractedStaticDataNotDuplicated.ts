import type { Patient } from 'fhir/r4';

/**
 * Expected `Patient` for QStaticDataNotDuplicated/QRStaticDataNotDuplicated.
 *
 * `prefix` is static template data, unrelated to any of the three templateExtractValues - it must
 * appear exactly once, not once per sibling value (`family`, `use`, `given`) merged into the same
 * element, including the repeating `given` merge (which itself has two evaluated values).
 */
export const extractedStaticDataNotDuplicatedPatient: Patient = {
  resourceType: 'Patient',
  name: [
    {
      prefix: ['Dr'],
      family: 'Citizen',
      use: 'official',
      given: ['Alex', 'Chris']
    }
  ]
};
