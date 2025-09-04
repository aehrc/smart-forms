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

import { fetchQuestionnaireById } from '../client';
import { HEADERS } from '../headers';
import type { Questionnaire, OperationOutcome } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

describe('client', () => {
  describe('fetchQuestionnaireById', () => {
    let mockClient: jest.Mocked<Client>;

    beforeEach(() => {
      mockClient = {
        request: jest.fn()
      } as unknown as jest.Mocked<Client>;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should fetch questionnaire by ID using correct parameters', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-questionnaire-id',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      const result = await fetchQuestionnaireById(mockClient, 'test-questionnaire-id');

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/test-questionnaire-id',
        method: 'GET',
        headers: HEADERS
      });
      expect(result).toBe(mockQuestionnaire);
    });

    it('should handle different questionnaire IDs correctly', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'another-questionnaire',
        status: 'draft'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      const result = await fetchQuestionnaireById(mockClient, 'another-questionnaire');

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/another-questionnaire',
        method: 'GET',
        headers: HEADERS
      });
      expect(result).toBe(mockQuestionnaire);
    });

    it('should return OperationOutcome when questionnaire is not found', async () => {
      const mockOperationOutcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'not-found',
            details: {
              text: 'Resource not found'
            }
          }
        ]
      };

      mockClient.request.mockResolvedValue(mockOperationOutcome);

      const result = await fetchQuestionnaireById(mockClient, 'non-existent-id');

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/non-existent-id',
        method: 'GET',
        headers: HEADERS
      });
      expect(result).toBe(mockOperationOutcome);
    });

    it('should handle complex questionnaire IDs with special characters', async () => {
      const complexId = 'questionnaire-with-special-chars_123-456';
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: complexId,
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, complexId);

      expect(mockClient.request).toHaveBeenCalledWith({
        url: `Questionnaire/${complexId}`,
        method: 'GET',
        headers: HEADERS
      });
    });

    it('should propagate client request rejections', async () => {
      const errorMessage = 'Network error';
      mockClient.request.mockRejectedValue(new Error(errorMessage));

      await expect(fetchQuestionnaireById(mockClient, 'test-id')).rejects.toThrow(errorMessage);

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/test-id',
        method: 'GET',
        headers: HEADERS
      });
    });

    it('should handle empty questionnaire ID', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: '',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, '');

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/',
        method: 'GET',
        headers: HEADERS
      });
    });

    it('should return the exact response from client.request', async () => {
      const mockResponse = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active',
        title: 'Test Questionnaire',
        version: '1.0'
      } as Questionnaire;

      mockClient.request.mockResolvedValue(mockResponse);

      const result = await fetchQuestionnaireById(mockClient, 'test-id');

      expect(result).toStrictEqual(mockResponse);
      expect(result).toBe(mockResponse); // Reference equality
    });

    it('should call client.request exactly once per call', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, 'test-id');

      expect(mockClient.request).toHaveBeenCalledTimes(1);
    });

    it('should use correct HTTP method', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, 'test-id');

      const callArgs = mockClient.request.mock.calls[0][0];
      expect(typeof callArgs).toBe('object');
      if (typeof callArgs === 'object' && 'method' in callArgs) {
        expect(callArgs.method).toBe('GET');
      }
    });

    it('should use correct headers from HEADERS constant', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, 'test-id');

      const callArgs = mockClient.request.mock.calls[0][0];
      expect(typeof callArgs).toBe('object');
      if (typeof callArgs === 'object' && 'headers' in callArgs) {
        expect(callArgs.headers).toBe(HEADERS);
        expect(callArgs.headers).toEqual({
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/fhir+json;charset=utf-8',
          Accept: 'application/json;charset=utf-8'
        });
      }
    });

    it('should handle numeric questionnaire IDs by converting to string', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: '12345',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      // Test with number-like string
      await fetchQuestionnaireById(mockClient, '12345');

      expect(mockClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/12345',
        method: 'GET',
        headers: HEADERS
      });
    });

    it('should construct URL correctly by concatenating parts', async () => {
      const mockQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'url-test',
        status: 'active'
      };

      mockClient.request.mockResolvedValue(mockQuestionnaire);

      await fetchQuestionnaireById(mockClient, 'url-test');

      const callArgs = mockClient.request.mock.calls[0][0];
      expect(typeof callArgs).toBe('object');
      if (typeof callArgs === 'object' && 'url' in callArgs) {
        expect(callArgs.url).toBe('Questionnaire/' + 'url-test');
        expect(callArgs.url).toContain('Questionnaire/');
        expect(callArgs.url).toContain('url-test');
      }
    });
  });
});
