import type { Bundle } from 'fhir/r4';

export const extractedRegularMedicationsModified: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-1d83cf325a6c',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T12:43:51.137Z',
  entry: [
    {
      fullUrl: 'urn:uuid:5455d37a-aa09-4ab1-ab98-c39047062ddc',
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
            text: 'I am a dummy CodeableConcept'
          },
          {
            extension: [
              {
                url: 'dummy-extension-coding',
                valueString: 'I am a dummy extension for coding'
              }
            ],
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '444780001',
                display: 'Glucose in blood specimen above reference range'
              }
            ]
          },
          {
            extension: [
              {
                url: 'dummy-extension-coding',
                valueString: 'I am a dummy extension for coding'
              }
            ],
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '444780001',
                display: 'Glucose in blood specimen above reference range'
              }
            ]
          },
          {
            text: 'I am also a dummy CodeableConcept'
          }
        ],
        note: [
          {
            text: 'comment'
          }
        ],
        dosage: [
          {
            text: 'Twice a day'
          }
        ],
        dateAsserted: '2025-05-28T22:13:51.124+09:30'
      },
      request: {
        method: 'POST',
        url: 'MedicationStatement'
      }
    },
    {
      fullUrl: 'urn:uuid:e874b38a-4bae-4798-b209-9aa0b8f44aa2',
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
            text: 'I am a dummy CodeableConcept'
          },
          {
            extension: [
              {
                url: 'dummy-extension-coding',
                valueString: 'I am a dummy extension for coding'
              }
            ],
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '271807003',
                display: 'Rash'
              }
            ]
          },
          {
            extension: [
              {
                url: 'dummy-extension-coding',
                valueString: 'I am a dummy extension for coding'
              }
            ],
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '386661006',
                display: 'Fever'
              }
            ]
          },
          {
            text: 'I am also a dummy CodeableConcept'
          },
          {
            extension: [
              {
                url: 'dummy-extension-text',
                valueString: 'I am a dummy extension for text'
              }
            ],
            text: 'Fever (text)'
          },
          {
            extension: [
              {
                url: 'dummy-extension-text',
                valueString: 'I am a dummy extension for text'
              }
            ],
            text: 'really bad pain (text)'
          }
        ],
        note: [
          {
            text: 'hope it works'
          }
        ],
        dosage: [
          {
            text: 'Once a day'
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
