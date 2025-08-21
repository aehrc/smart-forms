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

import { requestPopulate } from '../api/requestPopulate';
import * as sdcPopulate from '@aehrc/sdc-populate';
import type { InputParameters, OutputParameters } from '@aehrc/sdc-populate';
import type Client from 'fhirclient/lib/Client';

// Mock the external dependencies
jest.mock('@aehrc/sdc-populate');
jest.mock('../utils/callback.ts');
jest.mock('../../../api/headers.ts');
jest.mock('../../../globals.ts', () => ({
  IN_APP_POPULATE: true,
  TERMINOLOGY_SERVER_URL: 'https://terminology.example.com'
}));

describe('requestPopulate', () => {
  let mockFhirClient: Client;
  let mockInputParameters: InputParameters;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock FHIR client
    mockFhirClient = {
      state: {
        serverUrl: 'https://fhir.example.com',
        tokenResponse: {
          access_token: 'test-access-token'
        }
      },
      request: jest.fn()
    } as unknown as Client;

    // Mock input parameters
    mockInputParameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          resource: {
            resourceType: 'Questionnaire',
            id: 'test-questionnaire',
            status: 'active'
          }
        }
      ]
    };
  });

  it('returns output parameters when in-app populate succeeds', async () => {
    const mockOutputParameters: OutputParameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'response',
          resource: {
            resourceType: 'QuestionnaireResponse',
            status: 'in-progress'
          }
        }
      ]
    };

    // Mock populate function
    (sdcPopulate.populate as jest.Mock).mockResolvedValue(mockOutputParameters);
    (sdcPopulate.isOutputParameters as jest.Mock).mockReturnValue(true);

    const result = await requestPopulate(mockFhirClient, mockInputParameters);

    expect(sdcPopulate.populate).toHaveBeenCalledWith(
      mockInputParameters,
      expect.any(Function), // fetchResourceCallback
      {
        sourceServerUrl: 'https://fhir.example.com',
        authToken: 'test-access-token'
      },
      expect.any(Function), // fetchTerminologyCallback
      {
        terminologyServerUrl: 'https://terminology.example.com'
      }
    );

    expect(result).toEqual(mockOutputParameters);
  });

  it('returns operation outcome when populate times out', async () => {
    // Mock populate to take longer than timeout
    (sdcPopulate.populate as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 15000)) // Longer than 10s timeout
    );

    const result = await requestPopulate(mockFhirClient, mockInputParameters);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'unknown',
          details: { text: 'An unknown error occurred.' }
        }
      ]
    });
  }, 20000);

  it('returns operation outcome when result is not valid output parameters', async () => {
    const invalidResult = { invalid: 'data' };

    (sdcPopulate.populate as jest.Mock).mockResolvedValue(invalidResult);
    (sdcPopulate.isOutputParameters as jest.Mock).mockReturnValue(false);

    const result = await requestPopulate(mockFhirClient, mockInputParameters);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: 'Output parameters do not match the specification.' }
        }
      ]
    });
  });

  it('returns operation outcome when populate throws error', async () => {
    const error = new Error('Network error');
    (sdcPopulate.populate as jest.Mock).mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await requestPopulate(mockFhirClient, mockInputParameters);

    expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'unknown',
          details: { text: 'An unknown error occurred.' }
        }
      ]
    });

    consoleSpy.mockRestore();
  });

  it.skip('uses external populate service when IN_APP_POPULATE is false', async () => {
    // Skip this test as it requires complex environment variable mocking
    // This test would verify that when IN_APP_POPULATE is false,
    // the function uses fhirClient.request instead of the internal populate function
  });

  it('handles missing token response', async () => {
    // Create client without token response
    const clientWithoutToken = {
      state: {
        serverUrl: 'https://fhir.example.com',
        tokenResponse: null
      }
    } as unknown as Client;

    // Should throw an error when trying to access the token
    await expect(requestPopulate(clientWithoutToken, mockInputParameters)).rejects.toThrow();
  });

  it('handles missing access token in token response', async () => {
    // Create client with token response but no access token
    const clientWithoutAccessToken = {
      state: {
        serverUrl: 'https://fhir.example.com',
        tokenResponse: {}
      }
    } as unknown as Client;

    // Should return an OperationOutcome when access token is missing
    const result = await requestPopulate(clientWithoutAccessToken, mockInputParameters);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'unknown',
          details: { text: 'An unknown error occurred.' }
        }
      ]
    });
  });
});
