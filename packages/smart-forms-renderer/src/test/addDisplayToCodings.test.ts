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

import type { Coding } from 'fhir/r4';
import {
  addDisplayToCacheCodings,
  addDisplayToAnswerOptions,
  addDisplayToCodingArray,
  getCodeSystemLookupPromise,
  resolveLookupPromises,
  lookupResponseIsValid
} from '../utils/questionnaireStoreUtils/addDisplayToCodings';

// Mock fhirclient
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));

import { client } from 'fhirclient';
const mockClient = client as jest.MockedFunction<typeof client>;

describe('addDisplayToCodings - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDisplayToCacheCodings', () => {
    it('should return unchanged codings when all codings have displays', async () => {
      const cachedValueSetCodings = {
        valueSet1: [
          { system: 'http://example.com', code: 'A', display: 'Alpha' },
          { system: 'http://example.com', code: 'B', display: 'Beta' }
        ],
        valueSet2: [{ system: 'http://example.com', code: 'C', display: 'Gamma' }]
      };

      const result = await addDisplayToCacheCodings(
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result).toEqual(cachedValueSetCodings);
      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should return unchanged codings when empty object provided', async () => {
      const cachedValueSetCodings = {};

      const result = await addDisplayToCacheCodings(
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result).toEqual({});
      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should fetch displays for codings without displays', async () => {
      const cachedValueSetCodings = {
        valueSet1: [
          { system: 'http://snomed.info/sct', code: '386661006' }, // no display
          { system: 'http://snomed.info/sct', code: '386662004', display: 'Existing Display' }
        ]
      };

      const mockLookupResponse = {
        resourceType: 'Parameters',
        parameter: [{ name: 'display', valueString: 'Fever' }]
      };

      const mockRequest = jest.fn().mockResolvedValue(mockLookupResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await addDisplayToCacheCodings(
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: 'http://terminology.hl7.org/fhir' });
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'CodeSystem/$lookup?system=http://snomed.info/sct&code=386661006'
      });

      expect(result.valueSet1[0].display).toBe('Fever');
      expect(result.valueSet1[1].display).toBe('Existing Display');
    });

    it('should handle multiple codings without displays', async () => {
      const cachedValueSetCodings = {
        valueSet1: [
          { system: 'http://snomed.info/sct', code: '386661006' },
          { system: 'http://snomed.info/sct', code: '386662004' }
        ],
        valueSet2: [{ system: 'http://loinc.org', code: '8310-5' }]
      };

      const mockLookupResponses = [
        {
          resourceType: 'Parameters',
          parameter: [{ name: 'display', valueString: 'Fever' }]
        },
        {
          resourceType: 'Parameters',
          parameter: [{ name: 'display', valueString: 'Mild fever' }]
        },
        {
          resourceType: 'Parameters',
          parameter: [{ name: 'display', valueString: 'Body temperature' }]
        }
      ];

      const mockRequest = jest
        .fn()
        .mockResolvedValueOnce(mockLookupResponses[0])
        .mockResolvedValueOnce(mockLookupResponses[1])
        .mockResolvedValueOnce(mockLookupResponses[2]);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await addDisplayToCacheCodings(
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(mockRequest).toHaveBeenCalledTimes(3);
      expect(result.valueSet1[0].display).toBe('Fever');
      expect(result.valueSet1[1].display).toBe('Mild fever');
      expect(result.valueSet2[0].display).toBe('Body temperature');
    });

    it('should handle failed lookup requests gracefully', async () => {
      const cachedValueSetCodings = {
        valueSet1: [
          { system: 'http://snomed.info/sct', code: '386661006' },
          { system: 'http://snomed.info/sct', code: 'invalid-code' }
        ]
      };

      const mockRequest = jest
        .fn()
        .mockResolvedValueOnce({
          resourceType: 'Parameters',
          parameter: [{ name: 'display', valueString: 'Fever' }]
        })
        .mockRejectedValueOnce(new Error('Lookup failed'));
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await addDisplayToCacheCodings(
        cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );

      expect(result.valueSet1[0].display).toBe('Fever');
      expect(result.valueSet1[1].display).toBeUndefined();
    });
  });

  describe('addDisplayToAnswerOptions', () => {
    it('should return unchanged answer options when all have displays', async () => {
      const answerOptions = {
        item1: [
          { valueCoding: { system: 'http://example.com', code: 'A', display: 'Alpha' } },
          { valueCoding: { system: 'http://example.com', code: 'B', display: 'Beta' } }
        ],
        item2: [
          { valueString: 'text option' } // no valueCoding
        ]
      };

      const result = await addDisplayToAnswerOptions(
        answerOptions,
        'http://terminology.hl7.org/fhir'
      );

      expect(result).toEqual(answerOptions);
      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should fetch displays for valueCoding without displays', async () => {
      const answerOptions = {
        item1: [
          { valueCoding: { system: 'http://snomed.info/sct', code: '386661006' } },
          {
            valueCoding: {
              system: 'http://snomed.info/sct',
              code: '386662004',
              display: 'Existing'
            }
          },
          { valueString: 'text option' }
        ]
      };

      const mockLookupResponse = {
        resourceType: 'Parameters',
        parameter: [{ name: 'display', valueString: 'Fever' }]
      };

      const mockRequest = jest.fn().mockResolvedValue(mockLookupResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await addDisplayToAnswerOptions(
        answerOptions,
        'http://terminology.hl7.org/fhir'
      );

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'CodeSystem/$lookup?system=http://snomed.info/sct&code=386661006'
      });

      expect(result.item1[0].valueCoding?.display).toBe('Fever');
      expect(result.item1[1].valueCoding?.display).toBe('Existing');
      expect(result.item1[2]).toEqual({ valueString: 'text option' });
    });

    it('should handle empty answer options', async () => {
      const answerOptions = {};

      const result = await addDisplayToAnswerOptions(
        answerOptions,
        'http://terminology.hl7.org/fhir'
      );

      expect(result).toEqual({});
      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should handle items with no answer options', async () => {
      const answerOptions = {
        item1: []
      };

      const result = await addDisplayToAnswerOptions(
        answerOptions,
        'http://terminology.hl7.org/fhir'
      );

      expect(result).toEqual(answerOptions);
      expect(mockClient).not.toHaveBeenCalled();
    });
  });

  describe('addDisplayToCodingArray', () => {
    it('should return unchanged array when all codings have displays', async () => {
      const codings: Coding[] = [
        { system: 'http://example.com', code: 'A', display: 'Alpha' },
        { system: 'http://example.com', code: 'B', display: 'Beta' }
      ];

      const result = await addDisplayToCodingArray(codings, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual(codings);
      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should fetch displays for codings without displays', async () => {
      const codings: Coding[] = [
        { system: 'http://snomed.info/sct', code: '386661006' },
        { system: 'http://snomed.info/sct', code: '386662004', display: 'Existing Display' }
      ];

      const mockLookupResponse = {
        resourceType: 'Parameters',
        parameter: [{ name: 'display', valueString: 'Fever' }]
      };

      const mockRequest = jest.fn().mockResolvedValue(mockLookupResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await addDisplayToCodingArray(codings, 'http://terminology.hl7.org/fhir');

      expect(result[0].display).toBe('Fever');
      expect(result[1].display).toBe('Existing Display');
    });

    it('should handle empty array', async () => {
      const codings: Coding[] = [];

      const result = await addDisplayToCodingArray(codings, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual([]);
      expect(mockClient).not.toHaveBeenCalled();
    });
  });

  describe('getCodeSystemLookupPromise', () => {
    it('should create correct lookup request', () => {
      const mockRequest = jest.fn();
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const query = 'system=http://snomed.info/sct&code=386661006';
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      getCodeSystemLookupPromise(query, terminologyServerUrl);

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: terminologyServerUrl });
      expect(mockRequest).toHaveBeenCalledWith({
        url: `CodeSystem/$lookup?${query}`
      });
    });
  });

  describe('resolveLookupPromises', () => {
    it('should resolve lookup promises and extract displays', async () => {
      const codeSystemLookupPromises = {
        query1: {
          promise: Promise.resolve({
            resourceType: 'Parameters',
            parameter: [{ name: 'display', valueString: 'Fever' }]
          } as any),
          oldCoding: { system: 'http://snomed.info/sct', code: '386661006' }
        },
        query2: {
          promise: Promise.resolve({
            resourceType: 'Parameters',
            parameter: [{ name: 'display', valueString: 'Temperature' }]
          } as any),
          oldCoding: { system: 'http://loinc.org', code: '8310-5' }
        }
      };

      const result = await resolveLookupPromises(codeSystemLookupPromises);

      expect(result.query1.newCoding).toEqual({
        system: 'http://snomed.info/sct',
        code: '386661006',
        display: 'Fever'
      });
      expect(result.query2.newCoding).toEqual({
        system: 'http://loinc.org',
        code: '8310-5',
        display: 'Temperature'
      });
    });

    it('should handle rejected promises gracefully', async () => {
      const codeSystemLookupPromises = {
        query1: {
          promise: Promise.resolve({
            resourceType: 'Parameters',
            parameter: [{ name: 'display', valueString: 'Fever' }]
          } as any),
          oldCoding: { system: 'http://snomed.info/sct', code: '386661006' }
        },
        query2: {
          promise: Promise.reject(new Error('Lookup failed')),
          oldCoding: { system: 'http://loinc.org', code: 'invalid' }
        }
      };

      const result = await resolveLookupPromises(codeSystemLookupPromises);

      expect(result.query1.newCoding?.display).toBe('Fever');
      expect(result.query2).toBeUndefined();
    });

    it('should handle invalid lookup responses', async () => {
      const codeSystemLookupPromises = {
        query1: {
          promise: Promise.resolve({
            resourceType: 'Parameters',
            parameter: [{ name: 'display', valueString: 'Fever' }]
          } as any),
          oldCoding: { system: 'http://snomed.info/sct', code: '386661006' }
        },
        query2: {
          promise: Promise.resolve({
            resourceType: 'OperationOutcome' // invalid response
          } as any),
          oldCoding: { system: 'http://loinc.org', code: '8310-5' }
        }
      };

      const result = await resolveLookupPromises(codeSystemLookupPromises);

      expect(result.query1.newCoding?.display).toBe('Fever');
      expect(result.query2).toBeUndefined();
    });

    it('should handle empty promises object', async () => {
      const result = await resolveLookupPromises({});

      expect(result).toEqual({});
    });
  });

  describe('lookupResponseIsValid', () => {
    it('should return the valueString for valid lookup response', () => {
      const validResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'display', valueString: 'Fever' },
          { name: 'version', valueString: '1.0' }
        ]
      };

      expect(lookupResponseIsValid(validResponse)).toBe('Fever');
    });

    it('should return false for response without resourceType', () => {
      const invalidResponse = {
        parameter: [{ name: 'display', valueString: 'Fever' }]
      };

      expect(lookupResponseIsValid(invalidResponse)).toBe(false);
    });

    it('should return false for response with wrong resourceType', () => {
      const invalidResponse = {
        resourceType: 'OperationOutcome',
        parameter: [{ name: 'display', valueString: 'Fever' }]
      };

      expect(lookupResponseIsValid(invalidResponse)).toBe(false);
    });

    it('should return falsy for response without parameter array', () => {
      const invalidResponse = {
        resourceType: 'Parameters'
      };

      expect(lookupResponseIsValid(invalidResponse)).toBeFalsy();
    });

    it('should return falsy for response without display parameter', () => {
      const invalidResponse = {
        resourceType: 'Parameters',
        parameter: [{ name: 'version', valueString: '1.0' }]
      };

      expect(lookupResponseIsValid(invalidResponse)).toBeFalsy();
    });

    it('should return falsy for display parameter without valueString', () => {
      const invalidResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'display' } // missing valueString
        ]
      };

      expect(lookupResponseIsValid(invalidResponse)).toBeFalsy();
    });

    it('should return falsy for null/undefined input', () => {
      expect(lookupResponseIsValid(null)).toBeFalsy();
      expect(lookupResponseIsValid(undefined)).toBeFalsy();
      expect(lookupResponseIsValid('')).toBeFalsy();
      expect(lookupResponseIsValid(123)).toBeFalsy();
    });

    it('should return the valueString for response with multiple parameters including display', () => {
      const validResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'version', valueString: '1.0' },
          { name: 'display', valueString: 'Body Temperature' },
          { name: 'definition', valueString: 'The temperature of the body' }
        ]
      };

      expect(lookupResponseIsValid(validResponse)).toBe('Body Temperature');
    });
  });
});
