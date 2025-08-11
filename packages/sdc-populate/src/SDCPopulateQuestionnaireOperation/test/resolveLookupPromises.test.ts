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

import { lookupResponseIsValid } from '../api/lookupCodeSystem';
import { resolveLookupPromises } from '../utils/resolveLookupPromises'; // Mock getCodeSystemLookupPromise function

// Mock getCodeSystemLookupPromise function
jest.mock('../api/lookupCodeSystem');

describe('resolveLookupPromises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve valid lookup responses and populate display', async () => {
    const mockResponse = {
      resourceType: 'Parameters',
      parameter: [{ name: 'display', valueString: 'Example Display' }]
    };

    (lookupResponseIsValid as unknown as jest.Mock).mockImplementation((resp) => {
      return resp?.resourceType === 'Parameters';
    });

    const promise = Promise.resolve(mockResponse);

    const input = {
      'system=abc&code=123': {
        oldCoding: { system: 'abc', code: '123' },
        promise
      }
    };

    const result = await resolveLookupPromises(input);

    expect(result['system=abc&code=123'].newCoding.display).toBe('Example Display');
  });

  it('should skip rejected promises', async () => {
    const promise = Promise.reject(new Error('Failed'));

    const input = {
      'system=abc&code=123': {
        oldCoding: { system: 'abc', code: '123' },
        promise
      }
    };

    const result = await resolveLookupPromises(input);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should support axios-like responses with .data', async () => {
    const mockAxiosResponse = {
      data: {
        resourceType: 'Parameters',
        parameter: [{ name: 'display', valueString: 'Axios Display' }]
      }
    };

    (lookupResponseIsValid as unknown as jest.Mock).mockImplementation((resp) => {
      return resp?.resourceType === 'Parameters';
    });

    const promise = Promise.resolve(mockAxiosResponse);

    const input = {
      'system=def&code=456': {
        oldCoding: { system: 'def', code: '456' },
        promise
      }
    };

    const result = await resolveLookupPromises(input);

    expect(result['system=def&code=456'].newCoding.display).toBe('Axios Display');
  });
});
