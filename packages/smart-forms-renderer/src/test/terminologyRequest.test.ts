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

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { FetchTerminologyCallback } from '@aehrc/sdc-populate';
import type { ValueSet } from 'fhir/r4';
import type { ValueSetPromise } from '../interfaces/valueSet.interface';

// Mock the fhirclient, which is the built-in default transport
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));

import { client } from 'fhirclient';
import { TERMINOLOGY_REQUEST_TIMEOUT_MS } from '../globals';
import { terminologyServerStore } from '../stores/terminologyServerStore';
import { getTerminologyRequestTimeoutMs, terminologyRequest } from '../utils/terminologyRequest';
import {
  getValueSetPromise,
  resolveValueSetPromises,
  validateCodePromise
} from '../utils/valueSet';
import { getCodeSystemLookupPromise } from '../utils/questionnaireStoreUtils/addDisplayToCodings';

const mockClient = client as jest.MockedFunction<typeof client>;

const TERMINOLOGY_SERVER_URL = 'https://tx.fhir.org/r4';

/**
 * Wires up the built-in fhirclient transport to resolve with the given response,
 * and returns the mocked request function so its arguments can be asserted.
 */
function mockFhirClientResponse(response: unknown) {
  const mockRequest = jest.fn() as jest.MockedFunction<any>;
  mockRequest.mockResolvedValue(response);
  mockClient.mockReturnValue({ request: mockRequest } as any);
  return mockRequest;
}

function injectTerminologyCallback(response: unknown) {
  const fetchTerminologyCallback = jest.fn(() =>
    Promise.resolve(response)
  ) as jest.MockedFunction<FetchTerminologyCallback>;
  terminologyServerStore.getState().setRequestOptions({ fetchTerminologyCallback });
  return fetchTerminologyCallback;
}

describe('terminologyRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    terminologyServerStore.getState().resetRequestOptions();
  });

  describe('default transport', () => {
    it('should use the built-in fhirclient transport when no callback is injected', async () => {
      const mockResponse = { resourceType: 'ValueSet', status: 'active' };
      const mockRequest = mockFhirClientResponse(mockResponse);

      const result = await terminologyRequest(
        'ValueSet/$expand?url=http://example.com/ValueSet/test',
        TERMINOLOGY_SERVER_URL
      );

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: TERMINOLOGY_SERVER_URL });
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'ValueSet/$expand?url=http://example.com/ValueSet/test'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should fall back to the built-in transport when the injected callback is set back to null', async () => {
      const fetchTerminologyCallback = injectTerminologyCallback({ resourceType: 'ValueSet' });
      terminologyServerStore.getState().setRequestOptions({ fetchTerminologyCallback: null });

      const mockRequest = mockFhirClientResponse({ resourceType: 'ValueSet' });
      await terminologyRequest('ValueSet/$expand?url=x', TERMINOLOGY_SERVER_URL);

      expect(fetchTerminologyCallback).not.toHaveBeenCalled();
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('injected transport', () => {
    it('should call the injected callback with the query and the resolved terminology server url', async () => {
      const mockResponse = { resourceType: 'ValueSet', status: 'active' };
      const fetchTerminologyCallback = injectTerminologyCallback(mockResponse);

      const result = await terminologyRequest(
        'ValueSet/$expand?url=http://example.com/ValueSet/test',
        TERMINOLOGY_SERVER_URL
      );

      expect(fetchTerminologyCallback).toHaveBeenCalledWith(
        'ValueSet/$expand?url=http://example.com/ValueSet/test',
        { terminologyServerUrl: TERMINOLOGY_SERVER_URL }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should not touch the fhirclient transport when a callback is injected', async () => {
      injectTerminologyCallback({ resourceType: 'ValueSet' });

      await terminologyRequest('ValueSet/$expand?url=x', TERMINOLOGY_SERVER_URL);

      expect(mockClient).not.toHaveBeenCalled();
    });

    it('should propagate a rejection from the injected callback', async () => {
      const fetchTerminologyCallback = jest.fn(() =>
        Promise.reject(new Error('Transport unavailable'))
      ) as jest.MockedFunction<FetchTerminologyCallback>;
      terminologyServerStore.getState().setRequestOptions({ fetchTerminologyCallback });

      await expect(
        terminologyRequest('ValueSet/$expand?url=x', TERMINOLOGY_SERVER_URL)
      ).rejects.toThrow('Transport unavailable');
    });
  });

  describe('call sites', () => {
    it('should route getValueSetPromise through the injected callback', async () => {
      const mockValueSet: ValueSet = { resourceType: 'ValueSet', status: 'active', id: 'vs-1' };
      const fetchTerminologyCallback = injectTerminologyCallback(mockValueSet);

      const result = await getValueSetPromise(
        'http://example.com/ValueSet/test',
        TERMINOLOGY_SERVER_URL
      );

      expect(fetchTerminologyCallback).toHaveBeenCalledWith(
        'ValueSet/$expand?url=http://example.com/ValueSet/test',
        { terminologyServerUrl: TERMINOLOGY_SERVER_URL }
      );
      expect(mockClient).not.toHaveBeenCalled();
      expect(result).toEqual(mockValueSet);
    });

    it('should route getValueSetPromise through the injected callback for an embedded $expand url', async () => {
      const fetchTerminologyCallback = injectTerminologyCallback({
        resourceType: 'ValueSet',
        status: 'active'
      });

      await getValueSetPromise(
        'https://tx.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://example.com/ValueSet/test',
        TERMINOLOGY_SERVER_URL
      );

      expect(fetchTerminologyCallback).toHaveBeenCalledWith(
        'ValueSet/$expand?url=http://example.com/ValueSet/test',
        { terminologyServerUrl: 'https://tx.ontoserver.csiro.au/fhir/' }
      );
    });

    it('should route validateCodePromise through the injected callback', async () => {
      const mockValidateCodeResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'code', valueCode: 'mg' },
          { name: 'system', valueUri: 'http://unitsofmeasure.org' },
          { name: 'display', valueString: 'milligram' }
        ]
      };
      const fetchTerminologyCallback = injectTerminologyCallback(mockValidateCodeResponse);

      const result = await validateCodePromise(
        'http://hl7.org/fhir/ValueSet/ucum-units',
        'http://unitsofmeasure.org',
        'mg',
        TERMINOLOGY_SERVER_URL
      );

      expect(fetchTerminologyCallback).toHaveBeenCalledWith(
        'ValueSet/$validate-code?url=http://hl7.org/fhir/ValueSet/ucum-units&system=http://unitsofmeasure.org&code=mg',
        { terminologyServerUrl: TERMINOLOGY_SERVER_URL }
      );
      expect(mockClient).not.toHaveBeenCalled();
      expect(result).toEqual(mockValidateCodeResponse);
    });

    it('should route getCodeSystemLookupPromise through the injected callback', async () => {
      const mockLookupResponse = {
        resourceType: 'Parameters',
        parameter: [{ name: 'display', valueString: 'Diabetes mellitus' }]
      };
      const fetchTerminologyCallback = injectTerminologyCallback(mockLookupResponse);

      const result = await getCodeSystemLookupPromise(
        'system=http://snomed.info/sct&code=73211009',
        TERMINOLOGY_SERVER_URL
      );

      expect(fetchTerminologyCallback).toHaveBeenCalledWith(
        'CodeSystem/$lookup?system=http://snomed.info/sct&code=73211009',
        { terminologyServerUrl: TERMINOLOGY_SERVER_URL }
      );
      expect(mockClient).not.toHaveBeenCalled();
      expect(result).toEqual(mockLookupResponse);
    });

    it('should keep using the fhirclient transport at every call site by default', async () => {
      const mockRequest = mockFhirClientResponse({ resourceType: 'ValueSet', status: 'active' });

      await getValueSetPromise('http://example.com/ValueSet/test', TERMINOLOGY_SERVER_URL);
      await validateCodePromise(
        'http://hl7.org/fhir/ValueSet/ucum-units',
        'http://unitsofmeasure.org',
        'mg',
        TERMINOLOGY_SERVER_URL
      );
      await getCodeSystemLookupPromise(
        'system=http://snomed.info/sct&code=73211009',
        TERMINOLOGY_SERVER_URL
      );

      expect(mockClient).toHaveBeenCalledTimes(3);
      expect(mockRequest).toHaveBeenNthCalledWith(1, {
        url: 'ValueSet/$expand?url=http://example.com/ValueSet/test'
      });
      expect(mockRequest).toHaveBeenNthCalledWith(2, {
        url: 'ValueSet/$validate-code?url=http://hl7.org/fhir/ValueSet/ucum-units&system=http://unitsofmeasure.org&code=mg'
      });
      expect(mockRequest).toHaveBeenNthCalledWith(3, {
        url: 'CodeSystem/$lookup?system=http://snomed.info/sct&code=73211009'
      });
    });
  });

  describe('requestTimeoutMs', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return the configured timeout', () => {
      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 30000 });
      expect(getTerminologyRequestTimeoutMs()).toBe(30000);
    });

    it('should abandon a value set that takes longer than the configured timeout', async () => {
      jest.useFakeTimers();
      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 100 });

      const valueSetPromises: Record<string, ValueSetPromise> = {
        slow: {
          promise: new Promise<ValueSet>((resolve) => {
            setTimeout(() => resolve({ resourceType: 'ValueSet', status: 'active' }), 200);
          })
        }
      };

      const resultPromise = resolveValueSetPromises(valueSetPromises);
      await jest.advanceTimersByTimeAsync(200);
      const result = await resultPromise;

      expect(result['slow']).toBeUndefined();
    });

    it('should keep a value set that resolves within the configured timeout', async () => {
      jest.useFakeTimers();
      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 500 });

      const mockValueSet: ValueSet = { resourceType: 'ValueSet', status: 'active', id: 'vs-1' };
      const valueSetPromises: Record<string, ValueSetPromise> = {
        slow: {
          promise: new Promise<ValueSet>((resolve) => {
            setTimeout(() => resolve(mockValueSet), 50);
          })
        }
      };

      const resultPromise = resolveValueSetPromises(valueSetPromises);
      await jest.advanceTimersByTimeAsync(500);
      const result = await resultPromise;

      expect(result['slow'].valueSet).toEqual(mockValueSet);
    });
  });

  describe('setRequestOptions and resetRequestOptions', () => {
    it('should leave the other options untouched when only one is set', () => {
      const fetchTerminologyCallback = injectTerminologyCallback({ resourceType: 'ValueSet' });

      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 20000 });

      expect(terminologyServerStore.getState().fetchTerminologyCallback).toBe(
        fetchTerminologyCallback
      );
      expect(terminologyServerStore.getState().requestTimeoutMs).toBe(20000);
    });

    it('should leave the terminology server url untouched', () => {
      terminologyServerStore.getState().setUrl('https://example.com/fhir');
      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 20000 });

      expect(terminologyServerStore.getState().url).toBe('https://example.com/fhir');

      terminologyServerStore.getState().resetUrl();
    });

    it('should restore every option to its default', () => {
      injectTerminologyCallback({ resourceType: 'ValueSet' });
      terminologyServerStore.getState().setRequestOptions({ requestTimeoutMs: 20000 });

      terminologyServerStore.getState().resetRequestOptions();

      expect(terminologyServerStore.getState().fetchTerminologyCallback).toBeNull();
      expect(terminologyServerStore.getState().requestTimeoutMs).toBe(
        TERMINOLOGY_REQUEST_TIMEOUT_MS
      );
    });
  });
});
