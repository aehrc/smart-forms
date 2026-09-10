import type { Immunization } from 'fhir/r4';

/**
 * Expected `Immunization` for QRepeatingComplexValueMerge/QRRepeatingComplexValueMerge.
 *
 * `protocolApplied[0].targetDisease` must have both evaluated Codings - a repeating
 * templateExtractValue whose values are objects must append them, not merge the second into the
 * first at the same array index.
 *
 * `targetDisease` is typed as `CodeableConcept[]`, but the engine's Coding-result handling
 * (`getValueFromResult`) inserts a bare Coding shape rather than wrapping it in `{ coding: [...] }`.
 * That's a pre-existing, separate quirk unrelated to this fix - this fixture reflects what the
 * engine actually produces, hence the `@ts-ignore`s below.
 */
export const extractedRepeatingComplexValueMergeImmunization: Immunization = {
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
      doseNumberPositiveInt: 2,
      // Bare Coding shapes, not CodeableConcept - see comment above.
      targetDisease: [
        {
          system: 'http://snomed.info/sct',
          code: '14189004',
          display: 'Measles'
        },
        {
          system: 'http://snomed.info/sct',
          code: '36989005',
          display: 'Mumps'
        }
      ] as any[]
    }
  ]
};
