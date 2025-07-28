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

import * as FHIR from 'fhirclient';
import { fetchFhirResources } from '../api/fetchFhirResources.ts'; // or wherever FHIR is imported from

describe('fetchFhirResources', () => {
  const mockRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock FHIR.client to return an object with request function
    (FHIR.client as jest.Mock) = jest.fn().mockReturnValue({
      request: mockRequest
    });
  });

  it('calls FHIR.client and requests the correct URL with headers, replacing "|" in queryUrl', async () => {
    const endpointUrl = 'https://example.fhir.org';
    const queryUrl = '/Patient?name=Smith|_count=10';

    const expectedUrl = '/Patient?name=Smith&_count=10&version='; // "|" replaced by "&version="

    const mockBundle = { resourceType: 'Bundle', entry: [] };
    mockRequest.mockResolvedValueOnce(mockBundle);

    const result = await fetchFhirResources(endpointUrl, queryUrl);

    expect(FHIR.client).toHaveBeenCalledWith(endpointUrl);

    expect(mockRequest).toHaveBeenCalledWith({
      url: expectedUrl,
      headers: expect.any(Object)
    });
    expect(result).toBe(mockBundle);
  });

  it('does not modify queryUrl if no "|" present', async () => {
    const endpointUrl = 'https://example.fhir.org';
    const queryUrl = '/Patient?_count=5';

    const mockBundle = { resourceType: 'Bundle', entry: [] };
    mockRequest.mockResolvedValueOnce(mockBundle);

    const result = await fetchFhirResources(endpointUrl, queryUrl);

    expect(FHIR.client).toHaveBeenCalledWith(endpointUrl);

    expect(mockRequest).toHaveBeenCalledWith({
      url: queryUrl,
      headers: expect.any(Object)
    });

    expect(result).toBe(mockBundle);
  });

  it('rejects if request fails', async () => {
    const endpointUrl = 'https://example.fhir.org';
    const queryUrl = '/Patient?_count=5';

    const error = new Error('Network error');
    mockRequest.mockRejectedValueOnce(error);

    await expect(fetchFhirResources(endpointUrl, queryUrl)).rejects.toThrow('Network error');
  });
});
