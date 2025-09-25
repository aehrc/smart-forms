import type { Bundle } from 'fhir/r4';

export const extractedRegularMedicationsWithPatchAdd: Bundle = {
  resourceType: 'Bundle',
  id: 'sdc-template-extract-8ba490ee288e',
  meta: {
    tag: [
      {
        code: '@aehrc/sdc-template-extract-v0.1.0:generated'
      }
    ]
  },
  type: 'transaction',
  timestamp: '2025-09-23T10:04:46.716Z',
  entry: [
    {
      fullUrl: 'urn:uuid:e0238e2a-d8dd-4e59-9b45-1bb21efc3935',
      resource: {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'operation',
            part: [
              {
                name: 'type',
                valueCode: 'add'
              },
              {
                name: 'path',
                valueString: 'MedicationStatement.note[0]'
              },
              {
                name: 'name',
                valueString: 'text'
              },
              {
                name: 'value',
                valueMarkdown: 'Comment2 - modified'
              },
              {
                name: 'pathLabel',
                valueString: 'Comment'
              }
            ]
          }
        ]
      },
      request: {
        method: 'PATCH',
        url: 'MedicationStatement/chloramphenicol-pat-repop'
      }
    }
  ]
};
