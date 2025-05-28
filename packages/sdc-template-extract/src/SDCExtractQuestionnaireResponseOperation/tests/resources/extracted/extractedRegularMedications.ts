import type { Bundle } from 'fhir/r4';

// TODO Add dosage answers
export const extractedRegularMedications: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-e958fd16c6e6',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T00:46:40.712Z',
  entry: [
    {
      fullUrl: 'urn:uuid:c1511f99-8831-43fd-a3c4-97437a073f8f',
      resource: {
        resourceType: 'MedicationStatement',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
        },
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '3738011000036101',
              display: 'Amoxil'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        reasonCode: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '444780001',
                display: 'Glucose in blood specimen above reference range'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '444780001',
                display: 'Glucose in blood specimen above reference range'
              }
            ]
          }
        ],
        note: [
          {
            text: 'comment'
          }
        ],
        dateAsserted: '2025-05-28T10:16:40.703+09:30'
      },
      request: {
        method: 'POST',
        url: 'MedicationStatement'
      }
    },
    {
      fullUrl: 'urn:uuid:2d9366b4-0258-4b0d-ae4c-dc03d68cca55',
      resource: {
        resourceType: 'MedicationStatement',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
        },
        status: 'active',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '3738011000036101',
              display: 'Amoxil'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        reasonCode: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '271807003',
                display: 'Rash'
              }
            ]
          },
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '386661006',
                display: 'Fever'
              }
            ]
          }
        ],
        note: [
          {
            text: 'hope it works'
          }
        ],
        dateAsserted: '2025-05-28T10:16:40.710+09:30'
      },
      request: {
        method: 'POST',
        url: 'MedicationStatement'
      }
    }
  ]
};
