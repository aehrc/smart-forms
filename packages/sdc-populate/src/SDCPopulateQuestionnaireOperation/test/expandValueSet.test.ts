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

import type { QuestionnaireItem } from 'fhir/r4';
import { defaultTerminologyRequest } from '../api/defaultTerminologyRequest';
import { getValueSetPromise } from '../api/expandValueSet';

// Mock defaultTerminologyRequest function
jest.mock('../api/defaultTerminologyRequest');

// Mock mockFetchTerminology callbacks
const mockFetchTerminology = jest.fn();
const mockFetchTerminologyConfig = {
  terminologyServerUrl: 'https://example.com/terminology/fhir'
};

describe('getValueSetPromise', () => {
  const qItem: QuestionnaireItem = { linkId: 'test-id', type: 'string' };
  let valueSetPromiseMap: Record<string, any> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the map before each test so tests are isolated
    valueSetPromiseMap = {};
  });

  it('calls defaultTerminologyRequest with transformed query and stores the promise', () => {
    const mockResponse = Promise.resolve({ resourceType: 'ValueSet', expansion: {} });

    (defaultTerminologyRequest as jest.Mock).mockReturnValueOnce(mockResponse);

    getValueSetPromise(
      qItem,
      'https://example.org/ValueSet/$expand?url=http://foo.com|1.0.0',
      valueSetPromiseMap
    );

    expect(defaultTerminologyRequest).toHaveBeenCalledWith(
      'ValueSet/$expand?url=http://foo.com&version=1.0.0'
    );
    expect(valueSetPromiseMap['test-id']).toEqual({ promise: mockResponse });
  });

  it('calls fetchTerminologyCallback when provided', () => {
    mockFetchTerminology.mockReturnValueOnce(
      Promise.resolve({ resourceType: 'ValueSet', expansion: {} })
    );

    getValueSetPromise(
      qItem,
      'http://foo.com|2.0.0',
      valueSetPromiseMap,
      mockFetchTerminology,
      mockFetchTerminologyConfig
    );

    expect(mockFetchTerminology).toHaveBeenCalledWith(
      'ValueSet/$expand?url=http://foo.com&version=2.0.0',
      mockFetchTerminologyConfig
    );
    expect(valueSetPromiseMap['test-id']).toBeDefined();
  });

  it('handles URL without $expand by adding version param', () => {
    const mockResponse = Promise.resolve({ resourceType: 'ValueSet' });

    (defaultTerminologyRequest as jest.Mock).mockReturnValueOnce(mockResponse);

    getValueSetPromise(qItem, 'http://bar.com|3.1.4', valueSetPromiseMap);

    expect(defaultTerminologyRequest).toHaveBeenCalledWith(
      'ValueSet/$expand?url=http://bar.com&version=3.1.4'
    );
    expect(valueSetPromiseMap['test-id']).toEqual({ promise: mockResponse });
  });
});
