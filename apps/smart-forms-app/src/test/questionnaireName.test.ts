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

import type { QuestionnaireResponse } from 'fhir/r4';
import { getQuestionnaireNameFromResponse } from '../utils/questionnaireName';

describe('getQuestionnaireNameFromResponse', () => {
  it('returns capitalized valueString from display extension', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      id: 'qr1',
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      _questionnaire: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/display',
            valueString: 'test name'
          }
        ]
      }
    };
    expect(getQuestionnaireNameFromResponse(questionnaireResponse)).toBe('Test name');
  });

  it('returns id if no display extension is present', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'qr2',
      status: 'in-progress',
      _questionnaire: {
        extension: [
          {
            url: 'not-the-right-url',
            valueString: 'should ignore'
          }
        ]
      }
    };
    expect(getQuestionnaireNameFromResponse(questionnaireResponse)).toBe('qr2');
  });

  it('returns id if extension is missing', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'qr3',
      status: 'in-progress'
    };
    expect(getQuestionnaireNameFromResponse(questionnaireResponse)).toBe('qr3');
  });

  it('returns id if _questionnaire is missing', () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'qr4',
      status: 'in-progress'
    };
    expect(getQuestionnaireNameFromResponse(questionnaireResponse)).toBe('qr4');
  });
});
