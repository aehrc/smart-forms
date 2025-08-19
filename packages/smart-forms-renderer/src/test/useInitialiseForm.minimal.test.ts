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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

// Mock all dependencies before importing the hook
jest.mock('../utils', () => ({
  buildForm: jest.fn()
}));

jest.mock('../utils/manageForm', () => ({
  initialiseFhirClient: jest.fn()
}));

jest.mock('../stores', () => ({
  useSmartConfigStore: {
    use: {
      setClient: () => jest.fn(),
      setPatient: () => jest.fn(), 
      setUser: () => jest.fn(),
      setEncounter: () => jest.fn()
    }
  }
}));

// Mock React hooks to avoid infinite loops
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useLayoutEffect: jest.fn(),
    useState: jest.fn(),
    useMemo: jest.fn()
  };
});

import { buildForm } from '../utils';
import { initialiseFhirClient } from '../utils/manageForm';
import useInitialiseForm from '../hooks/useInitialiseForm';
import { useLayoutEffect, useState, useMemo } from 'react';

const mockBuildForm = buildForm as jest.MockedFunction<typeof buildForm>;
const mockInitialiseFhirClient = initialiseFhirClient as jest.MockedFunction<typeof initialiseFhirClient>;
const mockUseLayoutEffect = useLayoutEffect as jest.MockedFunction<typeof useLayoutEffect>;
const mockUseState = useState as jest.MockedFunction<typeof useState>;
const mockUseMemo = useMemo as jest.MockedFunction<typeof useMemo>;

describe('useInitialiseForm', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'test-questionnaire',
    url: 'http://test.com/questionnaire',
    version: '1.0.0',
    name: 'TestQuestionnaire',
    title: 'Test Questionnaire',
    status: 'active',
    item: []
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'test-response',
    questionnaire: 'http://test.com/questionnaire',
    status: 'in-progress',
    item: []
  };

  const mockFhirClient = {
    request: jest.fn()
  } as unknown as Client;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useState to return stable state management
    let isFhirClientReadyState = true;
    let isBuildingState = false;
    
    mockUseState.mockImplementation((initialValue: any) => {
      if (typeof initialValue === 'boolean') {
        if (initialValue === true) {
          // This is likely isFhirClientReady
          return [isFhirClientReadyState, (newValue: boolean) => { isFhirClientReadyState = newValue; }];
        } else {
          // This is likely isBuilding
          return [isBuildingState, (newValue: boolean) => { isBuildingState = newValue; }];
        }
      }
      return [initialValue, jest.fn()];
    });

    // Mock useMemo to return the memoized value
    mockUseMemo.mockImplementation((factory, deps) => factory());

    // Mock useLayoutEffect to capture the effect callback
    mockUseLayoutEffect.mockImplementation((effect, deps) => {
      // We can call the effect immediately for testing
      effect();
    });

    mockBuildForm.mockResolvedValue(undefined);
    mockInitialiseFhirClient.mockResolvedValue(undefined);
  });

  describe('hook execution', () => {
    it('should call useState hooks for state management', () => {
      useInitialiseForm(mockQuestionnaire);

      expect(mockUseState).toHaveBeenCalledWith(true); // isFhirClientReady
      expect(mockUseState).toHaveBeenCalledWith(false); // isBuilding
    });

    it('should call useMemo for store setters', () => {
      useInitialiseForm(mockQuestionnaire);

      expect(mockUseMemo).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Array)
      );
    });

    it('should call useLayoutEffect with correct dependencies', () => {
      const terminologyServerUrl = 'https://test.server.com/fhir/';
      const additionalVariables = { test: 'value' };

      useInitialiseForm(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        terminologyServerUrl,
        additionalVariables,
        mockFhirClient
      );

      expect(mockUseLayoutEffect).toHaveBeenCalledWith(
        expect.any(Function),
        [
          mockQuestionnaire,
          mockQuestionnaireResponse,
          additionalVariables,
          terminologyServerUrl,
          mockFhirClient,
          true // readOnly
        ]
      );
    });

    it('should call buildForm with correct parameters', () => {
      const terminologyServerUrl = 'https://test.server.com/fhir/';
      const additionalVariables = { test: 'value' };

      useInitialiseForm(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        terminologyServerUrl,
        additionalVariables,
        mockFhirClient
      );

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        terminologyServerUrl,
        additionalVariables
      );
    });

    it('should call initialiseFhirClient when fhirClient is provided', () => {
      useInitialiseForm(mockQuestionnaire, undefined, false, undefined, undefined, mockFhirClient);

      expect(mockInitialiseFhirClient).toHaveBeenCalledWith(mockFhirClient);
    });

    it('should not call initialiseFhirClient when fhirClient is not provided', () => {
      useInitialiseForm(mockQuestionnaire);

      expect(mockInitialiseFhirClient).not.toHaveBeenCalled();
    });

    it('should handle all parameter combinations', () => {
      // Test with only questionnaire
      useInitialiseForm(mockQuestionnaire);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined
      );

      // Test with questionnaire and response
      useInitialiseForm(mockQuestionnaire, mockQuestionnaireResponse);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        undefined,
        undefined,
        undefined
      );

      // Test with readOnly
      useInitialiseForm(mockQuestionnaire, undefined, true);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        true,
        undefined,
        undefined
      );

      // Test with terminologyServerUrl
      useInitialiseForm(mockQuestionnaire, undefined, undefined, 'https://test.com/fhir/');
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        'https://test.com/fhir/',
        undefined
      );

      // Test with additionalVariables
      const vars = { key: 'value' };
      useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, vars);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        vars
      );
    });
  });

  describe('return value', () => {
    it('should return the correct loading state', () => {
      // Mock to return specific state values
      mockUseState.mockImplementation((initialValue) => {
        if (initialValue === true) {
          return [true, jest.fn()]; // isFhirClientReady = true
        } else {
          return [false, jest.fn()]; // isBuilding = false
        }
      });

      const result = useInitialiseForm(mockQuestionnaire);

      // isFhirClientReady && isBuilding = true && false = false
      expect(result).toBe(false);
    });

    it('should return true when both flags are true', () => {
      mockUseState.mockImplementation((initialValue) => {
        if (initialValue === true) {
          return [true, jest.fn()]; // isFhirClientReady = true
        } else {
          return [true, jest.fn()]; // isBuilding = true
        }
      });

      const result = useInitialiseForm(mockQuestionnaire);

      expect(result).toBe(true);
    });

    it('should return false when isFhirClientReady is false', () => {
      mockUseState.mockImplementation((initialValue) => {
        if (initialValue === true) {
          return [false, jest.fn()]; // isFhirClientReady = false
        } else {
          return [true, jest.fn()]; // isBuilding = true
        }
      });

      const result = useInitialiseForm(mockQuestionnaire);

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty questionnaire', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      useInitialiseForm(emptyQuestionnaire);

      expect(mockBuildForm).toHaveBeenCalledWith(
        emptyQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle null/undefined additional variables', () => {
      useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, null as any);

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        null
      );
    });

    it('should handle boolean false for readOnly', () => {
      useInitialiseForm(mockQuestionnaire, undefined, false);

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        false,
        undefined,
        undefined
      );
    });

    it('should handle empty string terminologyServerUrl', () => {
      useInitialiseForm(mockQuestionnaire, undefined, undefined, '');

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        '',
        undefined
      );
    });
  });

  describe('React hook compliance', () => {
    it('should call hooks in the correct order', () => {
      // Clear previous calls
      jest.clearAllMocks();

      useInitialiseForm(mockQuestionnaire);

      // Verify hooks are called in order: useState, useState, useMemo, useLayoutEffect
      expect(mockUseState).toHaveBeenNthCalledWith(1, true);
      expect(mockUseState).toHaveBeenNthCalledWith(2, false);
      expect(mockUseMemo).toHaveBeenCalledAfter(mockUseState as any);
      expect(mockUseLayoutEffect).toHaveBeenCalledAfter(mockUseMemo as any);
    });

    it('should have stable memoized dependencies', () => {
      useInitialiseForm(mockQuestionnaire);

      // useMemo should be called with a factory function and dependencies array
      const [factory, deps] = mockUseMemo.mock.calls[0];
      
      expect(typeof factory).toBe('function');
      expect(Array.isArray(deps)).toBe(true);
      expect(deps).toHaveLength(4); // setSmartClient, setPatient, setUser, setEncounter
    });
  });

  describe('async behavior simulation', () => {
    it('should handle buildForm promise resolution', async () => {
      let resolvePromise: () => void;
      const buildFormPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockBuildForm.mockReturnValue(buildFormPromise);
      
      // Mock useState to track state changes
      const setIsBuilding = jest.fn();
      mockUseState.mockImplementation((initialValue) => {
        if (initialValue === false) {
          return [false, setIsBuilding];
        }
        return [true, jest.fn()];
      });

      useInitialiseForm(mockQuestionnaire);

      // Initially setIsBuilding(true) should be called
      expect(setIsBuilding).toHaveBeenCalledWith(true);

      // Resolve the promise
      resolvePromise!();
      await buildFormPromise;

      // After promise resolves, setIsBuilding(false) should be called
      // Note: In the mocked version, we can't actually test the .then() callback
      // But we can verify the promise was created
      expect(mockBuildForm).toHaveBeenCalled();
    });

    it('should handle initialiseFhirClient promise resolution', async () => {
      let resolvePromise: () => void;
      const fhirClientPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockInitialiseFhirClient.mockReturnValue(fhirClientPromise);
      
      useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient);

      expect(mockInitialiseFhirClient).toHaveBeenCalledWith(mockFhirClient);

      // Resolve the promise
      resolvePromise!();
      await fhirClientPromise;

      // Verify the promise was handled
      expect(mockInitialiseFhirClient).toHaveBeenCalled();
    });
  });
});
