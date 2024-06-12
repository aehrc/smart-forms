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

export const qSelectivePrePopTester: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'SelectivePrePopTester',
  name: 'SelectivePrePopTester',
  title: 'Selective Pre-pop Tester',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/prepop-1',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'administrative-gender',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/shareablevalueset']
      },
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pa'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'normative'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 5
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-normative-version',
          valueCode: '4.0.0'
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/administrative-gender',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.1'
        }
      ],
      version: '4.0.1',
      name: 'AdministrativeGender',
      title: 'AdministrativeGender',
      status: 'active',
      experimental: false,
      date: '2019-11-01T09:29:23+11:00',
      publisher: 'HL7 (FHIR Project)',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            },
            {
              system: 'email',
              value: 'fhir@lists.hl7.org'
            }
          ]
        }
      ],
      description: 'The gender of a person used for administrative purposes.',
      immutable: true,
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://hl7.org/fhir/administrative-gender'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:50f050c9-3975-48d6-bdb7-baae4ebc70cd',
        timestamp: '2024-04-05T12:31:27+10:00',
        total: 4,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        ]
      }
    }
  ],
  extension: [
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
    }
  ],
  item: [
    {
      linkId: 'display-description',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
          valueString:
            '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <div style="font-size:0.875em"> This questionnaire is used by Playwright to do regression testing of the <pre style="display: inline">@aehrc/sdc-populate</pre> library\'s pre-population logic. Items will be incrementally added as needed.</div><br/></div>'
        }
      ],
      text: "This questionnaire is used by Playwright to do regression testing of the @aehrc/sdc-populate library's pre-population logic. Items will be incrementally added as needed.",
      type: 'display',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%patient.gender'
          }
        }
      ],
      linkId: 'gender-avs-url',
      text: 'Administrative gender (answerValueSet url)',
      type: 'choice',
      repeats: false,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%patient.gender'
          }
        }
      ],
      linkId: 'gender-avs-contained',
      text: 'Administrative gender (answerValueSet contained)',
      type: 'choice',
      repeats: false,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    }
  ]
};
