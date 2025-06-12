import type { Bundle } from 'fhir/r4';

export const extractedMedicalHistoryCurrentProblemsWithPatch: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-a62fdc1dfb0c',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-06-11T04:31:09.761Z',
  entry: [
    {
      fullUrl: 'urn:uuid:022c0642-af1f-4c24-b014-578bb297234e',
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
                  ],
                  text: 'Active'
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
      fullUrl: 'urn:uuid:97d3250d-e273-421c-9525-346b49ddc120',
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
                  ],
                  text: 'Active'
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
      fullUrl: 'urn:uuid:c1052fe5-2948-49a8-9e7e-bdf8d317ce58',
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
                  ],
                  text: 'Active'
                }
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
      fullUrl: 'urn:uuid:80a65446-dd5a-49c6-9099-1dd757cd5759',
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
                  ],
                  text: 'Active'
                }
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
