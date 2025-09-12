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

import { defaultTerminologyRequest } from '../api/defaultTerminologyRequest';
import type { Coding } from 'fhir/r4';
import { getCodeSystemLookupPromise, lookupResponseIsValid } from '../api/lookupCodeSystem';

// Mock defaultTerminologyRequest function
jest.mock('../api/defaultTerminologyRequest');

// Mock mockFetchTerminology callbacks
const mockFetchTerminology = jest.fn();
const mockFetchTerminologyConfig = {
  terminologyServerUrl: 'https://example.com/terminology/fhir'
};

describe('getCodeSystemLookupPromise', () => {
  const coding: Coding = {
    system: 'http://loinc.org',
    code: '1234-5'
  };
  const key = `system=${coding.system}&code=${coding.code}`;

  let codeSystemLookupPromiseMap: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    codeSystemLookupPromiseMap = {};
  });

  it('calls defaultTerminologyRequest with expected query and stores promise', () => {
    const mockResponse = Promise.resolve({ resourceType: 'Parameters' });

    (defaultTerminologyRequest as jest.Mock).mockReturnValueOnce(mockResponse);

    getCodeSystemLookupPromise(coding, codeSystemLookupPromiseMap);

    expect(defaultTerminologyRequest).toHaveBeenCalledWith(`CodeSystem/$lookup?${key}`);
    expect(codeSystemLookupPromiseMap[key]).toEqual({
      promise: mockResponse,
      oldCoding: coding
    });
  });

  it('calls fetchTerminologyCallback when provided', () => {
    const mockResponse = Promise.resolve({ resourceType: 'Parameters' });

    mockFetchTerminology.mockReturnValueOnce(mockResponse);

    getCodeSystemLookupPromise(
      coding,
      codeSystemLookupPromiseMap,
      mockFetchTerminology,
      mockFetchTerminologyConfig
    );

    expect(mockFetchTerminology).toHaveBeenCalledWith(
      `CodeSystem/$lookup?${key}`,
      mockFetchTerminologyConfig
    );
    expect(codeSystemLookupPromiseMap[key]).toEqual({
      promise: mockResponse,
      oldCoding: coding
    });
  });
});

describe('lookupResponseIsValid', () => {
  it('returns true for valid LookupResponse', () => {
    const validResponse = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: 'female' },
        { name: 'display', valueString: 'Female' }
      ]
    };

    expect(lookupResponseIsValid(validResponse)).toBe(true);
  });

  it('returns false if resourceType is not Parameters', () => {
    const invalidResponse = {
      resourceType: 'ValueSet',
      parameter: [{ name: 'display', valueString: 'Female' }]
    };

    expect(lookupResponseIsValid(invalidResponse)).toBe(false);
  });

  it('returns false if parameter array is missing', () => {
    const invalidResponse = {
      resourceType: 'Parameters'
    };

    expect(lookupResponseIsValid(invalidResponse)).toBe(false);
  });

  it('returns false if no display parameter present', () => {
    const invalidResponse = {
      resourceType: 'Parameters',
      parameter: [{ name: 'code', valueCode: 'female' }]
    };

    expect(lookupResponseIsValid(invalidResponse)).toBe(false);
  });

  it('returns false if display parameter has no valueString', () => {
    const invalidResponse = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'display' } // missing valueString
      ]
    };

    expect(lookupResponseIsValid(invalidResponse)).toBe(false);
  });

  it('returns false if input is null or undefined', () => {
    expect(lookupResponseIsValid(null)).toBe(false);
    expect(lookupResponseIsValid(undefined)).toBe(false);
  });
});
