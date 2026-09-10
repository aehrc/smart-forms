import type { Immunization } from 'fhir/r4';

/**
 * Expected `Immunization` for QArrayElementMerge/QRArrayElementMerge.
 *
 * `protocolApplied` has exactly ONE element: the evaluated `doseNumberPositiveInt` is merged into
 * the element the value path names (index 0), alongside the static `targetDisease` declared in the
 * template — rather than being appended as a second, half-populated element.
 */
export const extractedArrayElementMergeImmunization: Immunization = {
  resourceType: 'Immunization',
  status: 'completed',
  vaccineCode: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '1290624003'
      }
    ]
  },
  patient: {
    reference: 'Patient/example'
  },
  occurrenceDateTime: '2025-01-01',
  protocolApplied: [
    {
      targetDisease: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '67924001'
            }
          ]
        }
      ],
      doseNumberPositiveInt: 2
    }
  ]
};
