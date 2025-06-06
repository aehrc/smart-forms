import type { Bundle } from 'fhir/r4';

export const extractedImmunisation: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-2bf31b76cc1b',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T00:39:27.936Z',
  entry: [
    {
      fullUrl: 'urn:uuid:32567ce2-9a90-4af7-9c47-0fbfd7a5f9a9',
      resource: {
        resourceType: 'Immunization',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
        },
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system:
                'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
              code: 'COVAST',
              display: 'AstraZeneca Vaxzevria'
            }
          ]
        },
        patient: {
          reference: 'Patient/pat-sf'
        },
        note: [
          {
            text: 'comment'
          }
        ],
        occurrenceDateTime: '2025-01-15',
        lotNumber: '123'
      },
      request: {
        method: 'POST',
        url: 'Immunization'
      }
    },
    {
      fullUrl: 'urn:uuid:f909568a-e06b-4edc-8f98-598a9e17b68e',
      resource: {
        resourceType: 'Immunization',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
        },
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system:
                'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
              code: 'COVAST',
              display: 'AstraZeneca Vaxzevria'
            }
          ]
        },
        patient: {
          reference: 'Patient/pat-sf'
        },
        note: [
          {
            text: 'first one'
          }
        ],
        occurrenceDateTime: '2020-12-15'
      },
      request: {
        method: 'POST',
        url: 'Immunization'
      }
    },
    {
      fullUrl: 'urn:uuid:0192dffe-f126-4ef3-8c93-16e3ab790209',
      resource: {
        resourceType: 'Immunization',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
        },
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '837621000168102',
              display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
            }
          ]
        },
        patient: {
          reference: 'Patient/pat-sf'
        },
        note: [
          {
            text: 'test'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'Immunization'
      }
    }
  ]
};
