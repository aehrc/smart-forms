import type { Bundle } from 'fhir/r4';

export const extractedMedicalHistoryCurrentProblems: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-45e4d60b73df',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-05-28T00:46:06.223Z',
  entry: [
    {
      fullUrl: 'urn:uuid:2f585dde-ef47-40a2-91d6-bba95982370a',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '700379002',
              display: 'Chronic kidney disease stage 3B (disorder)'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        }
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:78a36ad3-00d7-46ef-9f1c-700470eb82a4',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '394659003',
              display: 'Acute coronary syndrome'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        onsetDateTime: '2015-02-12'
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:d8451c17-55ef-4815-a467-a7455af7c0bc',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '68566005',
              display: 'Urinary tract infection'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        onsetDateTime: '2020-05-10'
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:6894e45e-64ca-41a7-bf91-c66422bb0efa',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active'
            }
          ]
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '44054006',
              display: 'Type 2 diabetes mellitus'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        onsetDateTime: '2015-02-12'
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:b9bc7149-c77f-4b96-8ac7-a62d29a39ba0',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '63993003',
              display: 'Remittent fever'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        },
        onsetDateTime: '2015-02-11'
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:ba2db2cb-f01e-410d-a1b7-0c1e17babb79',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '38341003',
              display: 'Hypertension'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        }
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:4bb991e9-854f-4e72-9aa5-ddbc2e21b626',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '125605004',
              display: 'Fracture of bone'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        }
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    },
    {
      fullUrl: 'urn:uuid:1850bca0-fbde-4f38-ab5f-37bfc5520f18',
      resource: {
        resourceType: 'Condition',
        meta: {
          profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '195967001',
              display: 'Asthma'
            }
          ]
        },
        subject: {
          reference: 'Patient/pat-sf'
        }
      },
      request: {
        method: 'POST',
        url: 'Condition'
      }
    }
  ]
};
