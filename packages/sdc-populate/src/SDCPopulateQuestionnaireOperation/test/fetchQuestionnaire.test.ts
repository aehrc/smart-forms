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

import type { Bundle, OperationOutcome, Questionnaire } from 'fhir/r4';
import { fetchQuestionnaire } from '../api/fetchQuestionnaire';
import type { InputParameters } from '../interfaces'; // Adjust FHIR version if needed

// Mock the fetchQuestionnaire callback function
const mockFetchQuestionnaire = jest.fn();
const mockFetchQuestionnaireConfig = {
  sourceServerUrl: 'https://example.com/fhir',
  headers: { Authorization: 'Bearer token' }
};

describe('fetchQuestionnaire', () => {
  const questionnaire: Questionnaire = {
    id: 'q1',
    resourceType: 'Questionnaire',
    status: 'draft',
    url: 'http://example.com/assessments/test/1',
    identifier: [
      {
        system: 'http://example.com/system',
        value: 'abc-123'
      }
    ]
  };

  const parametersWithCanonical = {
    parameter: [
      {
        name: 'canonical',
        valueCanonical: 'http://example.com/assessments/test/1'
      }
    ]
  };

  it('returns inline questionnaire resource if present', async () => {
    const parametersWithResource = {
      parameter: [
        {
          name: 'questionnaire',
          resource: questionnaire
        }
      ]
    };

    const result = await fetchQuestionnaire(
      parametersWithResource as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(questionnaire);
    expect(mockFetchQuestionnaire).not.toHaveBeenCalled();
  });

  it('returns Questionnaire if fetch result is Questionnaire (via questionnaireRef)', async () => {
    const parametersWithQuestionnaireRef = {
      parameter: [
        {
          name: 'questionnaireRef',
          valueReference: {
            reference: 'Questionnaire/q1'
          }
        }
      ]
    };

    mockFetchQuestionnaire.mockResolvedValue(questionnaire);

    const result = await fetchQuestionnaire(
      parametersWithQuestionnaireRef as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(questionnaire);
  });

  it('returns Questionnaire if fetch result is Questionnaire (via identifier)', async () => {
    const parametersWithIdentifier = {
      parameter: [
        {
          name: 'identifier',
          valueIdentifier: {
            system: 'http://example.com/system',
            value: 'abc-123'
          }
        }
      ]
    };

    mockFetchQuestionnaire.mockResolvedValue(questionnaire);

    const result = await fetchQuestionnaire(
      parametersWithIdentifier as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(questionnaire);
  });

  it('returns Questionnaire if fetch result is Questionnaire (via canonical)', async () => {
    mockFetchQuestionnaire.mockResolvedValue(questionnaire);

    const result = await fetchQuestionnaire(
      parametersWithCanonical as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(questionnaire);
  });

  it('returns first Questionnaire from Bundle', async () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: questionnaire }]
    };

    mockFetchQuestionnaire.mockResolvedValue(bundle);

    const result = await fetchQuestionnaire(
      parametersWithCanonical as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(questionnaire);
  });

  it('returns error if Bundle has no Questionnaire', async () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    };

    mockFetchQuestionnaire.mockResolvedValue(bundle);

    const result = await fetchQuestionnaire(
      parametersWithCanonical as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
  });

  it('returns OperationOutcome if fetch result is OperationOutcome', async () => {
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'error', code: 'not-found', details: { text: 'Not found' } }]
    };

    mockFetchQuestionnaire.mockResolvedValue(outcome);

    const result = await fetchQuestionnaire(
      parametersWithCanonical as InputParameters,
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );
    expect(result).toEqual(outcome);
  });
});
