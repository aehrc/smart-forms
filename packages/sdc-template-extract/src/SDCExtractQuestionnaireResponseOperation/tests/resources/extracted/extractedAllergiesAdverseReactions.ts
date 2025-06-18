import type { Bundle } from 'fhir/r4';

export const extractedAllergiesAdverseReactions: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-cd2aace872b5',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T00:44:56.865Z',
  entry: [
    {
      fullUrl: 'urn:uuid:2c4bc0ef-63f7-4f16-8d1f-3a304be536a2',
      resource: {
        resourceType: 'AllergyIntolerance',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '412583005',
              display: 'Bee pollen'
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
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '271807003',
                    display: 'Rash'
                  }
                ]
              }
            ]
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'AllergyIntolerance'
      }
    },
    {
      fullUrl: 'urn:uuid:33afed4b-965d-4449-8601-0c655cd22721',
      resource: {
        resourceType: 'AllergyIntolerance',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active'
            }
          ]
        },
        code: {
          text: 'Dried flowers'
        },
        patient: {
          reference: 'Patient/pat-sf'
        },
        note: [
          {
            text: 'Hayfever'
          }
        ],
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '76067001',
                    display: 'Sneezing'
                  }
                ]
              }
            ]
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'AllergyIntolerance'
      }
    },
    {
      fullUrl: 'urn:uuid:bbca1bc8-2b45-445e-9d08-19d996a1883c',
      resource: {
        resourceType: 'AllergyIntolerance',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
              code: 'active'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '256259004',
              display: 'Pollen'
            }
          ]
        },
        patient: {
          reference: 'Patient/pat-sf'
        },
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '76067001',
                    display: 'Sneezing'
                  }
                ]
              }
            ]
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'AllergyIntolerance'
      }
    }
  ]
};
