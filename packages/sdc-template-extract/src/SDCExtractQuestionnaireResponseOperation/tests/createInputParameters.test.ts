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
import { createInputParameters } from '../utils';

describe('createInputParameters', () => {
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed'
  };

  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active'
  };

  const comparisonQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed'
  };

  it('returns Parameters with only questionnaire-response', () => {
    const result = createInputParameters(questionnaireResponse, undefined, undefined);

    expect(result).toEqual({
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire-response',
          resource: questionnaireResponse
        }
      ]
    });
  });

  it('includes questionnaire if provided', () => {
    const result = createInputParameters(questionnaireResponse, questionnaire, undefined);

    expect(result.parameter).toEqual([
      {
        name: 'questionnaire-response',
        resource: questionnaireResponse
      },
      {
        name: 'questionnaire',
        resource: questionnaire
      }
    ]);
  });

  it('includes comparison-source-response if provided', () => {
    const result = createInputParameters(
      questionnaireResponse,
      undefined,
      comparisonQuestionnaireResponse
    );

    expect(result.parameter).toEqual([
      {
        name: 'questionnaire-response',
        resource: questionnaireResponse
      },
      {
        name: 'comparison-source-response',
        resource: comparisonQuestionnaireResponse
      }
    ]);
  });

  it('includes all three if all provided', () => {
    const result = createInputParameters(
      questionnaireResponse,
      questionnaire,
      comparisonQuestionnaireResponse
    );

    expect(result.parameter).toEqual([
      {
        name: 'questionnaire-response',
        resource: questionnaireResponse
      },
      {
        name: 'questionnaire',
        resource: questionnaire
      },
      {
        name: 'comparison-source-response',
        resource: comparisonQuestionnaireResponse
      }
    ]);
  });
});
