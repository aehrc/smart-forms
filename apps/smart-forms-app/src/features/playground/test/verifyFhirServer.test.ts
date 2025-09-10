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

import { verifyFhirServer, metadataResponseIsValid } from '../api/verifyFhirServer';
import * as FHIR from 'fhirclient';
import type { CapabilityStatement } from 'fhir/r4';

// Mock fhirclient
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));

describe('verifyFhirServer', () => {
  const mockRequest = jest.fn();
  const endpointUrl = 'https://example.fhir.org';

  beforeEach(() => {
    jest.clearAllMocks();
    (FHIR.client as jest.Mock).mockReturnValue({
      request: mockRequest
    });
  });

  it('returns valid result when server responds with valid CapabilityStatement', async () => {
    const mockCapabilityStatement: CapabilityStatement = {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: '2024-01-01',
      kind: 'instance',
      fhirVersion: '4.0.1',
      format: ['application/fhir+xml', 'application/fhir+json']
    };

    mockRequest.mockResolvedValue(mockCapabilityStatement);

    const result = await verifyFhirServer(endpointUrl);

    expect(FHIR.client).toHaveBeenCalledWith(endpointUrl);
    expect(mockRequest).toHaveBeenCalledWith({
      url: 'metadata',
      headers: {
        'Content-Type': 'application/fhir+json;charset=utf-8',
        Accept: 'application/fhir+json;charset=utf-8'
      }
    });
    expect(result).toEqual({
      isValidFhirServer: true,
      feedbackMessage: 'URL validated'
    });
  });

  it('returns invalid result when server responds with non-CapabilityStatement', async () => {
    const mockInvalidResponse = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    mockRequest.mockResolvedValue(mockInvalidResponse);

    const result = await verifyFhirServer(endpointUrl);

    expect(result).toEqual({
      isValidFhirServer: false,
      feedbackMessage: 'URL provided is not a FHIR Server'
    });
  });

  it('returns invalid result when request fails with Error', async () => {
    const errorMessage = 'Network error';
    mockRequest.mockRejectedValue(new Error(errorMessage));

    const result = await verifyFhirServer(endpointUrl);

    expect(result).toEqual({
      isValidFhirServer: false,
      feedbackMessage: errorMessage
    });
  });

  it('returns invalid result when request fails with string error', async () => {
    const errorMessage = 'Connection refused';
    mockRequest.mockRejectedValue(errorMessage);

    const result = await verifyFhirServer(endpointUrl);

    expect(result).toEqual({
      isValidFhirServer: false,
      feedbackMessage: errorMessage
    });
  });

  it('returns invalid result when request fails with unknown error', async () => {
    mockRequest.mockRejectedValue(null);

    const result = await verifyFhirServer(endpointUrl);

    expect(result).toEqual({
      isValidFhirServer: false,
      feedbackMessage: 'An unknown error occurred'
    });
  });
});

describe('metadataResponseIsValid', () => {
  it('returns true for valid CapabilityStatement', () => {
    const validCapabilityStatement: CapabilityStatement = {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: '2024-01-01',
      kind: 'instance',
      fhirVersion: '4.0.1',
      format: ['application/fhir+xml', 'application/fhir+json']
    };

    expect(metadataResponseIsValid(validCapabilityStatement)).toBe(true);
  });

  it('returns false for non-CapabilityStatement resource', () => {
    const patient = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    expect(metadataResponseIsValid(patient)).toBe(false);
  });

  it('returns false for object without resourceType', () => {
    const invalidObject = {
      status: 'active',
      date: '2024-01-01'
    };

    expect(metadataResponseIsValid(invalidObject)).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(metadataResponseIsValid(null)).toBeFalsy();
    expect(metadataResponseIsValid(undefined)).toBeFalsy();
  });

  it('returns false for empty object', () => {
    expect(metadataResponseIsValid({})).toBe(false);
  });
});
