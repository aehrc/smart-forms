import type { Bundle } from 'fhir/r4';

export const extractedMedicalHistoryCurrentProblemsWithPatch2: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-1883a002229b',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-06-17T03:37:17.872Z',
  entry: [
    {
      fullUrl: 'urn:uuid:675f6793-95f7-4a22-b2b4-a32419e03720',
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
        url: 'Parameters/uti-pat-sf'
      }
    },
    {
      fullUrl: 'urn:uuid:3404640a-82b5-46ee-b3e5-bb6bf9effe09',
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
        url: 'Parameters/diabetes-pat-sf'
      }
    }
  ]
};
