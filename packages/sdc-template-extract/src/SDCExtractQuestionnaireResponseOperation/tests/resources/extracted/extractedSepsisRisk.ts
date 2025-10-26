import type { Bundle } from 'fhir/r4';

export const extractedSepsisRisk: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-f7136860aa02',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-10-20T00:33:59.369Z',
  entry: [
    {
      fullUrl: 'urn:uuid:62e2d96a-34b2-41d5-aa13-3ad61c7ff384',
      resource: {
        resourceType: 'ServiceRequest',
        status: 'active',
        intent: 'order',
        category: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '3457005',
                display: 'Patient referral'
              }
            ]
          }
        ],
        priority: 'urgent',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '107724000',
              display: 'Patient transfer'
            }
          ],
          text: 'Transfer to acute care hospital'
        },
        subject: {
          reference: 'Patient/pat-repop'
        },
        requester: {
          reference: 'Practitioner/sandyson-sandy'
        },
        reasonReference: [
          {
            reference: '#suspected-sepsis-001',
            display: 'Suspected sepsis'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'ServiceRequest'
      }
    },
    {
      fullUrl: 'urn:uuid:9af370e2-42f6-48b4-86c8-ccf13f67db9a',
      resource: {
        resourceType: 'Condition',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
              code: 'provisional',
              display: 'Provisional'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '91302008',
              display: 'Sepsis'
            }
          ],
          text: 'Suspected sepsis'
        },
        subject: {
          reference: 'Patient/pat-repop'
        },
        recorder: {
          reference: 'Practitioner/sandyson-sandy'
        },
        asserter: {
          reference: 'Practitioner/sandyson-sandy'
        },
        recordedDate: '2025-10-20T00:23:39.740Z'
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:d302d802-eb26-4c3a-9d72-b6cd567459b8',
      resource: {
        resourceType: 'ServiceRequest',
        status: 'active',
        intent: 'order',
        category: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '277132007',
                display: 'Therapeutic procedure'
              }
            ]
          }
        ],
        priority: 'urgent',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '371907003',
              display: 'Oxygen administration'
            }
          ],
          text: 'Administration of oxygen'
        },
        subject: {
          reference: 'Patient/pat-repop'
        },
        requester: {
          reference: 'Practitioner/sandyson-sandy'
        },
        reasonReference: [
          {
            reference: '#suspected-sepsis-001',
            display: 'Suspected sepsis'
          }
        ]
      },
      request: {
        method: 'POST',
        url: 'ServiceRequest'
      }
    }
  ]
};
