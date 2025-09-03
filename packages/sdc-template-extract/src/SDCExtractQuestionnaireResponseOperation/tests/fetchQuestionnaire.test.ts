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

import { createInputParameters } from '../utils/createInputParameters';
import type { Bundle, OperationOutcome, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { fetchQuestionnaire } from '../utils/fetchQuestionnaire';

// Mock the fetchQuestionnaire callback function
const mockFetchQuestionnaire = jest.fn();
const mockFetchQuestionnaireConfig = {
  sourceServerUrl: 'https://example.com/fhir',
  headers: { Authorization: 'Bearer token' }
};

const baseQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  questionnaire: 'http://example.com/assessments/test/1',
  status: 'in-progress'
};

describe('fetchQuestionnaire', () => {
  beforeEach(() => {
    mockFetchQuestionnaire.mockReset();
  });

  it('returns Questionnaire from Parameters input', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft'
    };

    const result = await fetchQuestionnaire(
      createInputParameters(baseQuestionnaireResponse, questionnaire, undefined),
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result).toEqual(questionnaire);
  });

  it('returns OperationOutcome if questionnaire URL is empty', async () => {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: '',
      status: 'completed'
    };

    const result = await fetchQuestionnaire(
      questionnaireResponse,
      questionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
  });

  it('returns Questionnaire when fetch returns Questionnaire directly', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    mockFetchQuestionnaire.mockResolvedValueOnce(questionnaire);

    const result = await fetchQuestionnaire(
      baseQuestionnaireResponse,
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result).toEqual(questionnaire);
  });

  it('returns first Questionnaire from Bundle', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: questionnaire }]
    };
    mockFetchQuestionnaire.mockResolvedValueOnce(bundle);

    const result = await fetchQuestionnaire(
      baseQuestionnaireResponse,
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result).toEqual(questionnaire);
  });

  it('returns OperationOutcome if Bundle contains no Questionnaire', async () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    };
    mockFetchQuestionnaire.mockResolvedValueOnce(bundle);

    const result = await fetchQuestionnaire(
      baseQuestionnaireResponse,
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
  });

  it('returns OperationOutcome if response is an OperationOutcome', async () => {
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'error', code: 'not-found', diagnostics: 'Not found' }]
    };
    mockFetchQuestionnaire.mockResolvedValueOnce(outcome);

    const result = await fetchQuestionnaire(
      baseQuestionnaireResponse,
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result).toEqual(outcome);
  });

  it('returns OperationOutcome for unknown response types', async () => {
    mockFetchQuestionnaire.mockResolvedValueOnce({ resourceType: 'Unknown' });

    const result = await fetchQuestionnaire(
      baseQuestionnaireResponse,
      baseQuestionnaireResponse,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
  });
});
