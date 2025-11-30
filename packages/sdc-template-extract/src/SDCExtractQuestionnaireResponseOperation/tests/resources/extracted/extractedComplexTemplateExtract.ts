import type { Bundle } from 'fhir/r4';

export const extractedComplexTemplateExtract: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-5170829e925b',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T05:11:40.850Z',
  entry: [
    {
      fullUrl: 'urn:uuid:7579e19d-4e79-4305-aad4-531147ee710f',
      resource: {
        resourceType: 'Patient',
        id: '7579e19d-4e79-4305-aad4-531147ee710f',
        identifier: [
          {
            type: {
              text: 'National Identifier (IHI)'
            },
            system: 'http://example.org/nhio',
            value: '8003608833357361'
          }
        ],
        name: [
          {
            text: 'Smart Form',
            family: 'Form',
            given: ['Smart']
          },
          {
            text: 'Smartie Demo Forms',
            family: 'Forms',
            given: ['Smartie', 'Demo']
          }
        ],
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0491 572 665'
          }
        ],
        gender: 'female'
      },
      request: {
        method: 'PUT',
        url: 'Patient/7579e19d-4e79-4305-aad4-531147ee710f'
      }
    },
    {
      fullUrl: 'urn:uuid:0be665fe-c9ad-40c7-a94b-d405c349427a',
      resource: {
        resourceType: 'RelatedPerson',
        patient: {
          reference: 'Patient/7579e19d-4e79-4305-aad4-531147ee710f'
        },
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'C',
                display: 'Emergency Contact'
              }
            ]
          }
        ],
        name: [
          {
            text: 'Ms Phone A Friend'
          }
        ],
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0987654321'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'RelatedPerson'
      }
    },
    {
      fullUrl: 'urn:uuid:36cc059a-290a-4061-9a93-37e55cea4592',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Body height'
            }
          ]
        },
        subject: {
          reference: 'Patient/7579e19d-4e79-4305-aad4-531147ee710f'
        },
        effectiveDateTime: '2025-05-28T05:11:40.833Z',
        performer: [
          {
            reference: 'Practitioner/bobrester-bob'
          }
        ],
        valueQuantity: {
          unit: 'cm',
          system: 'http://unitsofmeasure.org',
          code: 'cm',
          value: 163
        },
        issued: '2025-05-28T05:11:40.833Z'
      },
      request: {
        method: 'POST',
        url: 'Observation'
      }
    },
    {
      fullUrl: 'urn:uuid:7a7d4e08-4bde-40d5-83a0-2d3fbb2fe559',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Weight'
            }
          ]
        },
        subject: {
          reference: 'Patient/7579e19d-4e79-4305-aad4-531147ee710f'
        },
        effectiveDateTime: '2025-05-28T05:11:40.833Z',
        performer: [
          {
            reference: 'Practitioner/bobrester-bob'
          }
        ],
        valueQuantity: {
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg',
          value: 77.3
        },
        issued: '2025-05-28T05:11:40.833Z'
      },
      request: {
        method: 'POST',
        url: 'Observation'
      }
    },
    {
      fullUrl: 'urn:uuid:ee96f0ab-43e6-4029-90ae-400c7501148a',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://example.org/sdh/demo/CodeSystem/cc-screening-codes',
              code: 'sigmoidoscopy-complication'
            }
          ]
        },
        subject: {
          reference: 'Patient/7579e19d-4e79-4305-aad4-531147ee710f'
        },
        effectiveDateTime: '2025-05-28T05:11:40.833Z',
        performer: [
          {
            reference: 'Practitioner/bobrester-bob'
          }
        ],
        issued: '2025-05-28T05:11:40.833Z',
        valueBoolean: true
      },
      request: {
        method: 'POST',
        url: 'Observation'
      }
    }
  ]
};
