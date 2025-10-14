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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qChoiceAnswerOptionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerOptionBasic',
  name: 'ChoiceAnswerOptionBasic',
  title: 'Choice AnswerOption Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answeroption-basic',
  item: [
    {
      linkId: 'smoking-status',
      text: 'Smoking status',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '266919005',
            display: 'Never smoked'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '77176002',
            display: 'Smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006',
            display: 'Ex-smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          }
        },
        {
          valueString: 'Wants to quit'
        },
        {
          valueString: 'Other tobacco use'
        }
      ]
    }
  ]
};

export const qrChoiceAnswerOptionBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'smoking-status',
      text: 'Smoking status',
      answer: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          }
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/choice/answeroption-basic'
};

export const qChoiceAnswerValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceAnswerValueSetBasic',
  name: 'ChoiceAnswerValueSetBasic',
  title: 'Choice AnswerValueSet Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-basic',
  item: [
    {
      linkId: 'gender',
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    }
  ]
};

export const qrChoiceAnswerValueSetBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'gender',
      text: 'Gender',
      answer: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/choice/answervalueset-basic'
};

export const qChoiceAnswerInitialSelected: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TestChoiceSelectAnswerOptionsUsingInitialSelected',
  language: 'en-AU',

  url: 'http://ns.electronichealth.net.au/fhir/Questionnaire/variation-tester',
  version: '0.1.0',
  name: 'ChoiceSelectAnswerOptionsUsingInitialSelected',
  title: 'ChoiceSelectAnswerOptionsUsingInitialSelected',
  status: 'draft',
  publisher: 'AEHRC CSIRO',

  subjectType: ['Patient'],
  description:
    'This Questionnaire instance includes a variety of topical tests, experiments and variations.',
  item: [
    {
      text: 'Type',
      type: 'choice',
      linkId: 'awsHallucinationType',
      repeats: false,
      required: true,

      answerOption: [
        {
          valueCoding: {
            code: 'N',
            system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
            display: 'None'
          }
        },

        {
          valueCoding: {
            code: 'T',
            system: 'http://fhir.medirecords.com/CodeSystem/awsHallucinationType',
            display: 'Test-Selected'
          },
          initialSelected: true
        }
      ]
    }
  ]
};
