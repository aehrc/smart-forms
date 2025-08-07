/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Questionnaire } from 'fhir/r4';

export const QTestFhirContext: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QTestFhirContext',
  status: 'draft',
  url: 'http://example.com/assessments/test/1',
  subjectType: ['Patient'],
  contained: [
    {
      resourceType: 'Bundle',
      id: 'PrePopQuery',
      type: 'batch',
      entry: [
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52573',
          request: { method: 'GET', url: 'AllergyIntolerance?patient={{%patient.id}}' }
        },
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52575',
          request: { method: 'GET', url: 'Condition?patient={{%patient.id}}' }
        }
      ]
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries',
      valueReference: { reference: '#PrePopQuery' }
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%ObsBodyHeight.toString()'
          }
        }
      ],
      linkId: 'q1',
      type: 'string'
    }
  ]
};
