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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qOpenChoiceAnswerOptionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceAnswerOptionBasic',
  name: 'OpenChoiceAnswerOptionBasic',
  title: 'Open Choice AnswerOption Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/open-choice/answeroption-basic',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Other, please specify'
        }
      ],
      linkId: 'health-check-location',
      text: 'Location of health check',
      type: 'open-choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257585005',
            display: 'Clinic'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '264362003',
            display: 'Home'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257698009',
            display: 'School'
          }
        }
      ]
    }
  ]
};

export const qrOpenChoiceAnswerOptionBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'health-check-location',
      text: 'Location of health check',
      answer: [
        {
          valueString: 'Pharmacy'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/open-choice/answeroption-basic'
};

export const qOpenChoiceAnswerValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceAnswerValueSetBasic',
  name: 'OpenChoiceAnswerValueSetBasic',
  title: 'Open Choice AnswerValueSet Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/display/open-choice/answervalueset-basic',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Overseas state, please specify'
        }
      ],
      linkId: 'state',
      text: 'State',
      type: 'open-choice',
      repeats: false,
      answerValueSet:
        'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
    }
  ]
};

export const qrOpenChoiceAnswerValueSetBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'state',
      text: 'State',
      answer: [
        {
          valueString: 'Branbendurg'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/open-choice/answervalueset-basic'
};
