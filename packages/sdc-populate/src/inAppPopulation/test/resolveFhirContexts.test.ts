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

import { resolveFhirContextReferences } from '../utils/resolveFhirContexts';

const mockFetchResource = jest.fn();
const mockFetchResourceConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

describe('resolveFhirContextReferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves FHIR context references correctly', async () => {
    const fhirContext = [
      { type: 'Endpoint', reference: 'Endpoint/123' },
      {
        type: 'Questionnaire',
        reference: 'Questionnaire/http://example.com/assessments/test/1|1.0.0'
      }
    ];

    // Setup mock responses for fetchResourceCallback
    mockFetchResource.mockImplementation((reference: string) => {
      if (reference === 'Endpoint/123') {
        return Promise.resolve({ resourceType: 'Endpoint', id: '123' });
      }
      if (reference === 'Questionnaire/http://example.com/assessments/test/1|1.0.0') {
        return Promise.resolve({
          resourceType: 'Questionnaire',
          url: 'http://example.com/assessments/test/1',
          version: '1.0.0'
        });
      }
      return Promise.reject(new Error('Unknown reference'));
    });

    const result = await resolveFhirContextReferences(
      fhirContext,
      mockFetchResource,
      mockFetchResourceConfig,
      5000
    );

    expect(mockFetchResource).toHaveBeenCalledTimes(2);
    expect(mockFetchResource).toHaveBeenCalledWith('Endpoint/123', mockFetchResourceConfig);
    expect(mockFetchResource).toHaveBeenCalledWith(
      'Questionnaire/http://example.com/assessments/test/1|1.0.0',
      mockFetchResourceConfig
    );

    expect(result).toEqual({
      Endpoint: { resourceType: 'Endpoint', id: '123' },
      Questionnaire: {
        resourceType: 'Questionnaire',
        url: 'http://example.com/assessments/test/1',
        version: '1.0.0'
      }
    });
  });

  it('returns empty object if fhirContext is null or empty', async () => {
    const result1 = await resolveFhirContextReferences(
      null,
      mockFetchResource,
      mockFetchResourceConfig,
      5000
    );
    expect(result1).toEqual({});

    const result2 = await resolveFhirContextReferences(
      [],
      mockFetchResource,
      mockFetchResourceConfig,
      5000
    );
    expect(result2).toEqual({});
  });

  it('handles rejected fetchResource promises gracefully', async () => {
    const fhirContext = [
      { type: 'Endpoint', reference: 'Endpoint/123' },
      {
        type: 'Questionnaire',
        reference: 'Questionnaire/http://example.com/assessments/test/1|1.0.0'
      }
    ];

    mockFetchResource.mockImplementation((reference: string) => {
      if (reference === 'Endpoint/123') {
        return Promise.resolve({ resourceType: 'Endpoint', id: '123' });
      }
      if (reference === 'Questionnaire/http://example.com/assessments/test/1|1.0.0') {
        return Promise.reject(new Error('Failed to fetch Questionnaire'));
      }
      return Promise.reject(new Error('Unknown reference'));
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await resolveFhirContextReferences(
      fhirContext,
      mockFetchResource,
      mockFetchResourceConfig,
      5000
    );

    expect(result).toEqual({
      Endpoint: { resourceType: 'Endpoint', id: '123' }
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'SDC-Populate issue: fhirContext with reference "Questionnaire/http://example.com/assessments/test/1|1.0.0" could not be resolved.'
      )
    );

    consoleWarnSpy.mockRestore();
  });
});
