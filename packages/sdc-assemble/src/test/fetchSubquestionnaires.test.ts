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

import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import type { Bundle, OperationOutcome, OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import { fetchSubquestionnaires, responseIsBundle } from '../utils/fetchSubquestionnaires';
import type { FetchQuestionnaireCallback } from '../interfaces';

// Mock callback function
const mockFetchQuestionnaireCallback: jest.MockedFunction<FetchQuestionnaireCallback> = jest.fn();
const mockFetchQuestionnaireRequestConfig = {
  headers: { Authorization: 'Bearer token' }
};

describe('fetchSubquestionnaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch subquestionnaires successfully', async () => {
    const canonicals = [
      'http://example.com/questionnaire1|1.0.0',
      'http://example.com/questionnaire2|2.0.0'
    ];

    const mockQuestionnaire1: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'q1',
      status: 'draft',
      url: 'http://example.com/questionnaire1',
      version: '1.0.0'
    };

    const mockQuestionnaire2: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'q2',
      status: 'draft',
      url: 'http://example.com/questionnaire2',
      version: '2.0.0'
    };

    const mockBundle1: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: mockQuestionnaire1 }]
    };

    const mockBundle2: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: mockQuestionnaire2 }]
    };

    mockFetchQuestionnaireCallback
      .mockResolvedValueOnce(mockBundle1)
      .mockResolvedValueOnce(mockBundle2);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect((result as Questionnaire[])[0]).toEqual(mockQuestionnaire1);
    expect((result as Questionnaire[])[1]).toEqual(mockQuestionnaire2);

    expect(mockFetchQuestionnaireCallback).toHaveBeenCalledWith(
      'http://example.com/questionnaire1&version=1.0.0',
      mockFetchQuestionnaireRequestConfig
    );
    expect(mockFetchQuestionnaireCallback).toHaveBeenCalledWith(
      'http://example.com/questionnaire2&version=2.0.0',
      mockFetchQuestionnaireRequestConfig
    );
  });

  it('should handle rejected promises and add warnings', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    mockFetchQuestionnaireCallback.mockRejectedValueOnce(new Error('Network error'));

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({
      severity: 'warning',
      code: 'not-found',
      details: { text: 'Network error' }
    });
  });

  it('should handle axios-style responses with data property', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'q1',
      status: 'draft'
    };

    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: mockQuestionnaire }]
    };

    const axiosResponse = {
      data: mockBundle,
      status: 200,
      statusText: 'OK'
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(axiosResponse as unknown as Bundle);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect((result as Questionnaire[])[0]).toEqual(mockQuestionnaire);
  });

  it('should handle axios-style OperationOutcome responses', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    const operationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: { text: 'Questionnaire not found' }
        }
      ]
    };

    const axiosResponse = {
      data: operationOutcome,
      status: 404,
      statusText: 'Not Found'
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(axiosResponse as unknown as Bundle);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(result).toEqual(operationOutcome);
  });

  it('should return error when bundle has no entry', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    const emptyBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset'
      // No entry property
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(emptyBundle);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: {
            text: "Unable to fetch questionnaire with canonical url 'http://example.com/questionnaire1|1.0.0'"
          }
        }
      ]
    });
  });

  it('should return error when bundle entry contains non-Questionnaire resource', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    const bundleWithPatient: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'patient1'
          }
        }
      ]
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(bundleWithPatient);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: {
            text: "Unable to fetch questionnaire with canonical url 'http://example.com/questionnaire1|1.0.0'"
          }
        }
      ]
    });
  });

  it('should return error when receiving OperationOutcome', async () => {
    const canonicals = ['http://example.com/questionnaire1|1.0.0'];

    const operationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: { text: 'Questionnaire not found' }
        }
      ]
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(operationOutcome);

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(result).toEqual(operationOutcome);
  });

  it('should handle mixed success and failure scenarios', async () => {
    const canonicals = [
      'http://example.com/questionnaire1|1.0.0',
      'http://example.com/questionnaire2|2.0.0'
    ];

    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'q1',
      status: 'draft'
    };

    const successBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: mockQuestionnaire }]
    };

    mockFetchQuestionnaireCallback
      .mockResolvedValueOnce(successBundle)
      .mockRejectedValueOnce(new Error('Failed to fetch'));

    const issues: OperationOutcomeIssue[] = [];
    const result = await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect((result as Questionnaire[])[0]).toEqual(mockQuestionnaire);
    expect(issues).toHaveLength(1);
    expect(issues[0].details?.text).toBe('Failed to fetch');
  });

  it('should transform canonical URLs by replacing | with &version=', async () => {
    const canonicals = ['http://example.com/questionnaire|3.0.0'];

    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'q1',
      status: 'draft'
    };

    const mockBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: mockQuestionnaire }]
    };

    mockFetchQuestionnaireCallback.mockResolvedValueOnce(mockBundle);

    const issues: OperationOutcomeIssue[] = [];
    await fetchSubquestionnaires(
      canonicals,
      issues,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireRequestConfig
    );

    expect(mockFetchQuestionnaireCallback).toHaveBeenCalledWith(
      'http://example.com/questionnaire&version=3.0.0',
      mockFetchQuestionnaireRequestConfig
    );
  });
});

describe('responseIsBundle', () => {
  it('should return true for valid Bundle resource', () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset'
    };

    expect(responseIsBundle(bundle)).toBe(true);
  });

  it('should return false for non-Bundle resource', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft'
    };

    expect(responseIsBundle(questionnaire)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(responseIsBundle(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(responseIsBundle(null)).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(responseIsBundle('string')).toBe(false);
    expect(responseIsBundle(123)).toBe(false);
    expect(responseIsBundle(true)).toBe(false);
  });
});
