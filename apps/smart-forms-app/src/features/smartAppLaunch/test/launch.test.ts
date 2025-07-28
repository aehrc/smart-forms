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

import { describe, expect, it } from '@jest/globals';
import { mockFhirClient } from '../../../test/data-shared/mockFhirClient';
import {
  getQuestionnaireReferences,
  readCommonLaunchContexts,
  readQuestionnaireContext,
  responseToQuestionnaireResource
} from '../utils/launch';
import * as FHIR from 'fhirclient';

describe('readCommonLaunchContexts', () => {
  afterEach(() => {
    jest.clearAllMocks(); // reset mocks between tests to avoid leakage
  });

  it('returns all resources when all reads succeed', async () => {
    const result = await readCommonLaunchContexts(mockFhirClient);
    expect(result.patient?.id).toBe(mockFhirClient.patient.id);
    expect(result.user?.id).toBe(mockFhirClient.user.id);
    expect(result.encounter?.id).toBeNull();
  });

  it('returns null for any resource that fails', async () => {
    (mockFhirClient.patient.read as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    (mockFhirClient.encounter.read as jest.Mock).mockRejectedValueOnce(new Error('fail'));

    const result = await readCommonLaunchContexts(mockFhirClient);
    expect(result.patient).toBeNull();
    expect(result.user?.id).toBe(mockFhirClient.user.id);
    expect(result.encounter).toBeNull();
  });
});

describe('getQuestionnaireReferences', () => {
  it('returns valid questionnaire references only', () => {
    const fhirContext = [
      {
        role: 'http://ns.electronichealth.net.au/smart/role/new',
        type: 'Questionnaire',
        canonical: 'http://example.com/assessments/q1'
      },
      {
        role: 'https://smartforms.csiro.au/ig/smart/role/launch-aus-cvd-risk-i',
        type: 'Endpoint',
        reference: 'Endpoint/456'
      }
    ];

    const result = getQuestionnaireReferences(fhirContext);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Questionnaire');
  });
});

describe('readQuestionnaireContext', () => {
  it('rejects if questionnaireReferences is empty', async () => {
    await expect(readQuestionnaireContext({} as any, [])).rejects.toThrow(
      'No Questionnaire references found'
    );
  });

  it('requests Questionnaire by reference ID', async () => {
    mockFhirClient.request = jest.fn().mockResolvedValue({
      resourceType: 'Questionnaire',
      id: 'q1'
    });

    const context = [{ reference: 'Questionnaire/q1' }];
    await readQuestionnaireContext(mockFhirClient, context as any);
    expect(mockFhirClient.request).toHaveBeenCalledWith({
      url: 'Questionnaire/q1',
      method: 'GET',
      headers: expect.anything()
    });
  });

  it('requests Questionnaire by canonical URL', async () => {
    // Mock the request method
    const requestMock = jest.fn().mockResolvedValue({
      resourceType: 'Bundle',
      entry: []
    });

    // Mock FHIR.client() to return an object with the mocked request()
    (FHIR.client as jest.Mock).mockReturnValue({
      request: requestMock
    });

    const context = [{ canonical: 'http://example.com/assessments/q1|1.0' }];

    await readQuestionnaireContext({} as any, context as any);

    expect(requestMock).toHaveBeenCalledWith({
      url: 'Questionnaire?url=http://example.com/assessments/q1&version=1.0&_sort=_lastUpdated',
      method: 'GET',
      headers: expect.anything()
    });

    // Optional: restore original implementation after test
    (FHIR.client as jest.Mock).mockRestore();
  });
});

describe('responseToQuestionnaireResource', () => {
  it('returns Questionnaire when response is Questionnaire', () => {
    const result = responseToQuestionnaireResource({
      resourceType: 'Questionnaire',
      id: 'q1',
      status: 'draft'
    } as any);
    expect(result?.id).toBe('q1');
  });

  it('returns Questionnaire from Bundle if present', () => {
    const result = responseToQuestionnaireResource({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Questionnaire', id: 'q2', status: 'draft' } }]
    } as any);
    expect(result?.id).toBe('q2');
  });

  it('returns undefined and logs for OperationOutcome', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = responseToQuestionnaireResource({
      resourceType: 'OperationOutcome',
      issue: []
    } as any);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
