/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

export const qMyPatient: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'canshare-myPatient1',
  meta: {
    versionId: '9',
    lastUpdated: '2024-09-18T07:23:35.7317908+00:00'
  },
  extension: [
    {
      extension: [
        {
          url: 'name',
          valueId: 'LaunchPatient'
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ],
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
    },
    {
      extension: [
        {
          url: 'name',
          valueId: 'LaunchPractitioner'
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner that is to be used to pre-populate the form'
        }
      ],
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemExtractionContext',
      valueCode: 'Patient'
    }
  ],
  url: 'http://canshare.co.nz/questionnaire/myPatient1',
  name: 'myPatient1',
  status: 'active',
  publisher: 'DEMO: David Hay',
  useContext: [
    {
      code: {
        system: 'http://terminology.hl7.org/CodeSystem/usage-context-type',
        code: 'user',
        display: 'User Type'
      },
      valueCodeableConcept: {
        coding: [
          {
            code: 'extract',
            display: 'Demo Extract'
          }
        ]
      }
    }
  ],
  item: [
    {
      linkId: 'myPatient1',
      text: 'myPatient1',
      type: 'group',
      item: [
        {
          linkId: 'myPatient1.name',
          definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.name',
          text: 'name *',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'myPatient1.name.first',
              definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.name.given',
              text: 'firstName *',
              type: 'string',
              repeats: true
            },
            {
              linkId: 'myPatient1.name.lastName',
              definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.name.family',
              text: 'lastName',
              type: 'string'
            }
          ]
        },
        {
          linkId: 'myPatient1.hair',
          definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension',
          text: 'hair',
          type: 'group',
          item: [
            {
              linkId: 'myPatient1.hair.colour',
              definition:
                'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension.valueString',
              text: 'colour',
              type: 'string'
            },
            {
              linkId: 'myPatient1.hair.url',
              definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension.url',
              text: 'url',
              type: 'string'
            }
          ]
        },
        {
          linkId: 'myPatient1.religion',
          definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension',
          text: 'religion',
          type: 'group',
          item: [
            {
              linkId: 'myPatient1.religion.brand',
              definition:
                'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension.valueString',
              text: 'brand',
              type: 'string'
            },
            {
              linkId: 'myPatient1.religion.url1',
              definition: 'http://hl7.org/fhir/StructureDefinition/Patient#Patient.extension.url',
              text: 'url',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
};
