import type { Patient } from 'fhir/r4';

/**
 * Expected `Patient` for QDuplicateValueMerge/QRDuplicateValueMerge.
 *
 * `given` has both occurrences of the duplicate answer - `mergeArrayByIndex` must append a
 * repeated primitive value rather than treating it as already-present static data and dropping it.
 */
export const extractedDuplicateValueMergePatient: Patient = {
  resourceType: 'Patient',
  name: [
    {
      family: 'Citizen',
      given: ['Alex', 'Alex']
    }
  ]
};
