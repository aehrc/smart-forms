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

export const qPreferredTerminologyServer: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'PreferredTerminologyServer',
  name: 'PreferredTerminologyServer',
  title: 'Preferred Terminology Server',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-10-08',
  url: 'https://smartforms.csiro.au/docs/terminology/preferred-terminology-server',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
      valueUrl: 'https://sqlonfhir-r4.azurewebsites.net/fhir'
    }
  ],
  item: [
    {
      linkId: 'notes',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:0.875em"> PreferredTerminologyServer is set as <strong>https://sqlonfhir-r4.azurewebsites.net/fhir</strong> for the entire questionnaire.</p><p style="font-size:0.875em">Developer note: Use <strong>Inspect > Network</strong> to see the request.</p></div>'
          }
        ]
      },
      text: 'PreferredTerminologyServer is set as https://sqlonfhir-r4.azurewebsites.net/fhir for the entire questionnaire. Use Inspect > Network to see the request.',
      type: 'display',
      repeats: false
    },
    {
      linkId: 'languages',
      text: 'Languages',
      type: 'choice',
      answerValueSet: 'http://hl7.org/fhir/ValueSet/languages'
    }
  ]
};
