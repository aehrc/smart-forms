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

import type { Bundle, FhirResource, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import * as FHIR from 'fhirclient';
import randomColor from 'randomcolor';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { getQuestionnaireNameFromResponse } from '../../../utils/questionnaireName';
import {
  constructBundle,
  createQuestionnaireListItem,
  createQuestionnaireTitle,
  createResponseListItem,
  createResponseSearchOption,
  filterQuestionnaires,
  filterResponses,
  getClientBundlePromise,
  getFormsServerAssembledBundlePromise,
  getFormsServerBundleOrQuestionnairePromise,
  getFormsServerBundlePromise,
  getReferencedQuestionnaire,
  getResponsesFromBundle
} from '../utils/dashboard';

// Mock external dependencies
jest.mock('fhirclient');
jest.mock('randomcolor', () => jest.fn(() => '#FF0000'));
jest.mock('dayjs', () => jest.fn(() => ({ toDate: () => new Date('2024-01-01T00:00:00Z') })));
jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'mock-id') }));
jest.mock('../../../utils/questionnaireName.ts', () => ({
  getQuestionnaireNameFromResponse: jest.fn(() => 'Test Response Title')
}));
jest.mock('../../../api/headers.ts', () => ({
  HEADERS: undefined
}));

const mockFHIR = FHIR as jest.Mocked<typeof FHIR>;
const mockRandomColor = randomColor as jest.MockedFunction<typeof randomColor>;
const mockDayjs = dayjs as jest.MockedFunction<typeof dayjs>;
const mockNanoid = { nanoid: nanoid as jest.MockedFunction<typeof nanoid> };
const mockGetQuestionnaireNameFromResponse = {
  getQuestionnaireNameFromResponse: getQuestionnaireNameFromResponse as jest.MockedFunction<
    typeof getQuestionnaireNameFromResponse
  >
};

// Mock data
const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-123',
  status: 'active',
  title: 'test questionnaire',
  publisher: 'test publisher',
  date: '2024-01-01T00:00:00Z',
  item: [
    {
      linkId: '1',
      text: 'Test question',
      type: 'string'
    }
  ]
};

const mockQuestionnaireWithAssembleExpectation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-sub',
  status: 'active',
  title: 'Sub questionnaire',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
      valueCode: 'assemble-child'
    }
  ]
};

const mockQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'response-123',
  status: 'completed',
  questionnaire: 'Questionnaire/questionnaire-123',
  authored: '2024-01-01T12:00:00Z',
  author: {
    display: 'test author'
  },
  item: [
    {
      linkId: '1',
      answer: [{ valueString: 'Test answer' }]
    }
  ]
};

const mockBundle: Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    { resource: mockQuestionnaire },
    { resource: mockQuestionnaireWithAssembleExpectation },
    { resource: mockQuestionnaireResponse }
  ]
};

const mockClient = {
  request: jest.fn()
} as unknown as Client;

describe('Dashboard Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockRandomColor.mockReturnValue('#FF0000');
    mockDayjs.mockReturnValue({
      toDate: () => new Date('2024-01-01T00:00:00Z')
    });
    mockNanoid.nanoid.mockReturnValue('mock-id');
    mockGetQuestionnaireNameFromResponse.getQuestionnaireNameFromResponse.mockReturnValue(
      'Test Response Title'
    );

    // Mock FHIR client
    mockFHIR.client.mockReturnValue({
      request: jest.fn().mockResolvedValue(mockBundle)
    } as any);
  });

  describe('getFormsServerBundlePromise', () => {
    it('should make FHIR request with correct URL and headers', async () => {
      const queryUrl = 'Questionnaire?status=active|1.0.0';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundlePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockFHIR.client).toHaveBeenCalledWith('https://example.com/forms/fhir');
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?status=active&version=1.0.0',
        headers: undefined // HEADERS is mocked
      });
    });

    it('should replace pipe with version parameter', async () => {
      const queryUrl = 'Questionnaire?_id=test|2.0.0';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundlePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?_id=test&version=2.0.0',
        headers: undefined
      });
    });

    it('should handle URL without pipe character', async () => {
      const queryUrl = 'Questionnaire?status=active';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundlePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?status=active',
        headers: undefined
      });
    });
  });

  describe('getFormsServerAssembledBundlePromise', () => {
    it('should make FHIR request with correct URL transformation', async () => {
      const queryUrl = 'Questionnaire?_id=assembled|3.0.0';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerAssembledBundlePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?_id=assembled&version=3.0.0',
        headers: undefined
      });
    });
  });

  describe('getClientBundlePromise', () => {
    it('should make client request with provided URL and headers', async () => {
      const queryUrl = 'Questionnaire?status=active';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      (mockClient as any).request = mockRequest;

      await getClientBundlePromise(mockClient, queryUrl);

      expect(mockRequest).toHaveBeenCalledWith({
        url: queryUrl,
        headers: undefined
      });
    });
  });

  describe('getFormsServerBundleOrQuestionnairePromise', () => {
    it('should handle URL with pipe character', async () => {
      const queryUrl = 'Questionnaire?_id=test|1.0.0';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundleOrQuestionnairePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?_id=test&version=1.0.0',
        headers: undefined
      });
    });

    it('should remove -SMARTcopy suffix from URL', async () => {
      const queryUrl = 'Questionnaire?_id=test-SMARTcopy';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundleOrQuestionnairePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?_id=test',
        headers: undefined
      });
    });

    it('should handle URL without -SMARTcopy suffix', async () => {
      const queryUrl = 'Questionnaire?_id=test';
      const mockRequest = jest.fn().mockResolvedValue(mockBundle);
      mockFHIR.client.mockReturnValue({ request: mockRequest } as any);

      await getFormsServerBundleOrQuestionnairePromise(queryUrl, 'https://example.com/forms/fhir');

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'Questionnaire?_id=test',
        headers: undefined
      });
    });
  });

  describe('createQuestionnaireTitle', () => {
    it('should capitalize first letter of title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'test title'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Test title');
    });

    it('should return "Untitled" for questionnaire without title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Untitled');
    });

    it('should handle empty title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: ''
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('Untitled');
    });

    it('should handle single character title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'a'
      };

      const result = createQuestionnaireTitle(questionnaire);
      expect(result).toBe('A');
    });
  });

  describe('createQuestionnaireListItem', () => {
    it('should create questionnaire list item with all properties', () => {
      mockRandomColor.mockReturnValue('#123456');
      mockDayjs.mockReturnValue({
        toDate: () => new Date('2024-01-01')
      });

      const result = createQuestionnaireListItem(mockQuestionnaire, 0);

      expect(result).toEqual({
        id: 'questionnaire-123',
        title: 'Test questionnaire',
        avatarColor: '#123456',
        publisher: 'Test publisher',
        date: new Date('2024-01-01'),
        status: 'active'
      });
      expect(mockRandomColor).toHaveBeenCalledWith({
        luminosity: 'dark',
        seed: 'Test questionnaire0'
      });
      expect(mockDayjs).toHaveBeenCalledWith('2024-01-01T00:00:00Z');
    });

    it('should handle questionnaire without optional properties', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'draft'
      };
      mockNanoid.nanoid.mockReturnValue('generated-id');

      const result = createQuestionnaireListItem(questionnaire, 1);

      expect(result).toEqual({
        id: 'generated-id',
        title: 'Untitled',
        avatarColor: '#FF0000',
        publisher: '-',
        date: null,
        status: 'draft'
      });
    });

    it('should handle questionnaire with empty publisher', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active',
        publisher: ''
      };

      const result = createQuestionnaireListItem(questionnaire, 0);

      expect(result.publisher).toBe('-');
    });
  });

  describe('filterQuestionnaires', () => {
    it('should return empty array for undefined bundle', () => {
      const result = filterQuestionnaires(undefined, false);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = filterQuestionnaires(bundle, false);
      expect(result).toEqual([]);
    });

    it('should filter out non-questionnaire resources', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          { resource: mockQuestionnaire },
          { resource: mockQuestionnaireResponse },
          { resource: { resourceType: 'Patient', id: 'patient-1' } as any }
        ]
      };

      const result = filterQuestionnaires(bundle, false);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaire);
    });

    it('should exclude subquestionnaires when includeSubquestionnaires is false', () => {
      const result = filterQuestionnaires(mockBundle, false);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaire);
    });

    it('should include subquestionnaires when includeSubquestionnaires is true', () => {
      const result = filterQuestionnaires(mockBundle, true);
      expect(result).toHaveLength(2);
      expect(result).toContain(mockQuestionnaire);
      expect(result).toContain(mockQuestionnaireWithAssembleExpectation);
    });

    it('should handle bundle with empty entry array', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };
      const result = filterQuestionnaires(bundle, false);
      expect(result).toEqual([]);
    });
  });

  describe('filterResponses', () => {
    it('should return empty array for undefined bundle', () => {
      const result = filterResponses(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = filterResponses(bundle);
      expect(result).toEqual([]);
    });

    it('should filter questionnaire responses from bundle', () => {
      const result = filterResponses(mockBundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });

    it('should exclude non-questionnaire-response resources', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          { resource: mockQuestionnaire },
          { resource: mockQuestionnaireResponse },
          { resource: { resourceType: 'Patient', id: 'patient-1' } as any }
        ]
      };

      const result = filterResponses(bundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });
  });

  describe('createResponseListItem', () => {
    it('should create response list item with all properties', () => {
      mockGetQuestionnaireNameFromResponse.getQuestionnaireNameFromResponse.mockReturnValue(
        'Response Title'
      );
      mockRandomColor.mockReturnValue('#654321');
      mockDayjs.mockReturnValue({
        toDate: () => new Date('2024-01-01T12:00:00Z')
      });

      const result = createResponseListItem(mockQuestionnaireResponse, 0);

      expect(result).toEqual({
        id: 'response-123',
        title: 'Response Title',
        avatarColor: '#654321',
        author: 'Test author',
        authored: new Date('2024-01-01T12:00:00Z'),
        status: 'completed'
      });
    });

    it('should handle response without optional properties', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      };
      mockNanoid.nanoid.mockReturnValue('generated-response-id');

      const result = createResponseListItem(response, 1);

      expect(result).toEqual({
        id: 'generated-response-id',
        title: 'Test Response Title',
        avatarColor: '#FF0000',
        author: '-',
        authored: null,
        status: 'in-progress'
      });
    });

    it('should handle response with empty author display', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'response-test',
        status: 'completed',
        author: {
          display: ''
        }
      };

      const result = createResponseListItem(response, 0);
      expect(result.author).toBe('-');
    });
  });

  describe('getResponsesFromBundle', () => {
    it('should return empty array for undefined bundle', () => {
      const result = getResponsesFromBundle(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = getResponsesFromBundle(bundle);
      expect(result).toEqual([]);
    });

    it('should extract questionnaire responses from bundle', () => {
      const result = getResponsesFromBundle(mockBundle);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockQuestionnaireResponse);
    });
  });

  describe('getReferencedQuestionnaire', () => {
    it('should return null for undefined resource', () => {
      const result = getReferencedQuestionnaire(undefined);
      expect(result).toBeNull();
    });

    it('should return questionnaire directly if resource is questionnaire', () => {
      const result = getReferencedQuestionnaire(mockQuestionnaire);
      expect(result).toBe(mockQuestionnaire);
    });

    it('should extract first questionnaire from bundle', () => {
      const result = getReferencedQuestionnaire(mockBundle);
      expect(result).toBe(mockQuestionnaire);
    });

    it('should return null for bundle without entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };
      const result = getReferencedQuestionnaire(bundle);
      expect(result).toBeNull();
    });

    it('should return null for bundle with empty entries', () => {
      const bundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };
      const result = getReferencedQuestionnaire(bundle);
      expect(result).toBeNull();
    });
  });

  describe('constructBundle', () => {
    it('should create bundle from array of resources', () => {
      const resources: FhirResource[] = [mockQuestionnaire, mockQuestionnaireResponse];

      const result = constructBundle(resources);

      expect(result).toEqual({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: mockQuestionnaire }, { resource: mockQuestionnaireResponse }]
      });
    });

    it('should handle empty resources array', () => {
      const result = constructBundle([]);

      expect(result).toEqual({
        resourceType: 'Bundle',
        type: 'collection',
        entry: []
      });
    });
  });

  describe('createResponseSearchOption', () => {
    it('should return questionnaire title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id',
        status: 'active',
        title: 'Test Questionnaire'
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Test Questionnaire');
    });

    it('should return "Untitled" with ID for questionnaire without title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-id-123',
        status: 'active'
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Untitled (test-id-123)');
    });

    it('should handle questionnaire with empty title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'empty-title-id',
        status: 'active',
        title: ''
      };

      const result = createResponseSearchOption(questionnaire);
      expect(result).toBe('Untitled (empty-title-id)');
    });
  });
});
