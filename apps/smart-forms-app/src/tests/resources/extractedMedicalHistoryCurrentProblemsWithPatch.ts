import type { Bundle } from 'fhir/r4';

export const extractedMedicalHistoryCurrentProblemsWithPatch: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-19d0b8c323f0',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-06-20T04:05:52.946Z',
  entry: [
    {
      fullUrl: 'urn:uuid:290cea8c-802a-4e42-874b-47da3dea773b',
      resource: {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.clinicalStatus'
              },
              {
                name: 'name',
                valueString: 'clinicalStatus'
              },
              {
                name: 'value',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                      code: 'active',
                      display: 'Active'
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      request: {
        method: 'PATCH',
        url: 'Condition/ckd-pat-sf'
      }
    },
    {
      fullUrl: 'urn:uuid:ffa7c7e6-4504-461b-a994-e9d5f987c50c',
      resource: {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.clinicalStatus'
              },
              {
                name: 'name',
                valueString: 'clinicalStatus'
              },
              {
                name: 'value',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                      code: 'active',
                      display: 'Active'
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      request: {
        method: 'PATCH',
        url: 'Condition/coronary-syndrome-pat-sf'
      }
    },
    {
      fullUrl: 'urn:uuid:9e7d1fc5-9eb1-45dc-8d9b-5178fd42687a',
      resource: {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.clinicalStatus'
              },
              {
                name: 'name',
                valueString: 'clinicalStatus'
              },
              {
                name: 'value',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                      code: 'inactive',
                      display: 'Inactive'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.abatement'
              },
              {
                name: 'name',
                valueString: 'abatement'
              },
              {
                name: 'value',
                valueDateTime: '2025-06-04'
              }
            ]
          }
        ]
      },
      request: {
        method: 'PATCH',
        url: 'Condition/uti-pat-sf'
      }
    },
    {
      fullUrl: 'urn:uuid:9cce092a-71e1-467c-92fb-5eb975d11327',
      resource: {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.clinicalStatus'
              },
              {
                name: 'name',
                valueString: 'clinicalStatus'
              },
              {
                name: 'value',
                valueCodeableConcept: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                      code: 'active',
                      display: 'Active'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'replace'
              },
              {
                name: 'path',
                valueString: 'Condition.abatement'
              },
              {
                name: 'name',
                valueString: 'abatement'
              },
              {
                name: 'value',
                valueDateTime: '2025-06-05'
              }
            ]
          }
        ]
      },
      request: {
        method: 'PATCH',
        url: 'Condition/diabetes-pat-sf'
      }
    }
  ]
};
