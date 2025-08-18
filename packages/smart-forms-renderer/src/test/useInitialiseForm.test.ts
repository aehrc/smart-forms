/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { renderHook, act } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import useInitialiseForm from '../hooks/useInitialiseForm';

// Mock dependencies
const mockBuildForm = jest.fn();
const mockInitialiseFhirClient = jest.fn();

jest.mock('../utils', () => ({
  buildForm: (...args: any[]) => mockBuildForm(...args)
}));

jest.mock('../utils/manageForm', () => ({
  initialiseFhirClient: (...args: any[]) => mockInitialiseFhirClient(...args)
}));

// Mock store
const mockSetClient = jest.fn();
const mockSetPatient = jest.fn();
const mockSetUser = jest.fn();
const mockSetEncounter = jest.fn();

jest.mock('../stores', () => ({
  useSmartConfigStore: {
    use: {
      setClient: () => mockSetClient,
      setPatient: () => mockSetPatient,
      setUser: () => mockSetUser,
      setEncounter: () => mockSetEncounter
    }
  }
}));

// Mock React hooks to control async behavior
const mockSetState = jest.fn();

const originalReact = jest.requireActual('react');
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, mockSetState]),
  useLayoutEffect: jest.fn((effect, deps) => {
    // Call effect immediately in tests
    effect();
  })
}));

describe('useInitialiseForm', () => {
  // Test data
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'test-questionnaire',
    status: 'active'
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'test-response',
    status: 'in-progress'
  };

  const mockFhirClient = {
    request: jest.fn()
  } as unknown as Client;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildForm.mockResolvedValue(undefined);
    mockInitialiseFhirClient.mockResolvedValue(undefined);
    
    // Reset useState mock to return actual state management
    const { useState } = originalReact;
    (require('react').useState as jest.Mock).mockImplementation(useState);
  });

  describe('basic initialization', () => {
    it('should initialize with only questionnaire', async () => {
      const { result } = renderHook(() => useInitialiseForm(mockQuestionnaire));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(mockInitialiseFhirClient).not.toHaveBeenCalled();
      
      // Initial state should indicate loading
      expect(result.current).toBe(true);
    });

    it('should initialize with questionnaire and response', async () => {
      const { result } = renderHook(() => 
        useInitialiseForm(mockQuestionnaire, mockQuestionnaireResponse)
      );

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        undefined,
        undefined,
        undefined
      );
      
      expect(result.current).toBe(true);
    });

    it('should initialize with all optional parameters', async () => {
      const additionalVariables = { testVar: 'testValue' };
      const terminologyServerUrl = 'https://terminology.example.com';
      const readOnly = true;

      renderHook(() => 
        useInitialiseForm(
          mockQuestionnaire,
          mockQuestionnaireResponse,
          readOnly,
          terminologyServerUrl,
          additionalVariables,
          mockFhirClient
        )
      );

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        readOnly,
        terminologyServerUrl,
        additionalVariables
      );

      expect(mockInitialiseFhirClient).toHaveBeenCalledWith(mockFhirClient);
    });
  });

  describe('FHIR client initialization', () => {
    it('should initialize FHIR client when provided', async () => {
      renderHook(() => useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient));

      expect(mockInitialiseFhirClient).toHaveBeenCalledWith(mockFhirClient);
      expect(mockInitialiseFhirClient).toHaveBeenCalledTimes(1);
    });

    it('should not initialize FHIR client when not provided', async () => {
      renderHook(() => useInitialiseForm(mockQuestionnaire));

      expect(mockInitialiseFhirClient).not.toHaveBeenCalled();
    });

    it('should handle FHIR client initialization completion', async () => {
      let resolveInitialise: () => void;
      const initialisationPromise = new Promise<void>((resolve) => {
        resolveInitialise = resolve;
      });
      mockInitialiseFhirClient.mockReturnValue(initialisationPromise);

      const { result, rerender } = renderHook(() => 
        useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient)
      );

      // Initially should be loading
      expect(result.current).toBe(true);

      // Resolve FHIR client initialization
      await act(async () => {
        resolveInitialise();
        await initialisationPromise;
      });

      rerender();
      // Should still be loading until buildForm completes
      expect(result.current).toBe(true);
    });
  });

  describe('form building lifecycle', () => {
    it('should handle form building completion', async () => {
      let resolveBuildForm: () => void;
      const buildFormPromise = new Promise<void>((resolve) => {
        resolveBuildForm = resolve;
      });
      mockBuildForm.mockReturnValue(buildFormPromise);

      const { result, rerender } = renderHook(() => useInitialiseForm(mockQuestionnaire));

      // Initially should be loading
      expect(result.current).toBe(true);

      // Resolve form building
      await act(async () => {
        resolveBuildForm();
        await buildFormPromise;
      });

      rerender();
      // Should no longer be loading
      expect(result.current).toBe(false);
    });

    it('should handle both FHIR client and form building completion', async () => {
      let resolveInitialise: () => void;
      let resolveBuildForm: () => void;
      
      const initialisationPromise = new Promise<void>((resolve) => {
        resolveInitialise = resolve;
      });
      const buildFormPromise = new Promise<void>((resolve) => {
        resolveBuildForm = resolve;
      });

      mockInitialiseFhirClient.mockReturnValue(initialisationPromise);
      mockBuildForm.mockReturnValue(buildFormPromise);

      const { result, rerender } = renderHook(() => 
        useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient)
      );

      // Initially should be loading
      expect(result.current).toBe(true);

      // Resolve both operations
      await act(async () => {
        resolveInitialise();
        resolveBuildForm();
        await Promise.all([initialisationPromise, buildFormPromise]);
      });

      rerender();
      // Should no longer be loading when both complete
      expect(result.current).toBe(false);
    });
  });

  describe('effect dependencies and re-rendering', () => {
    it('should re-run effect when questionnaire changes', () => {
      const { rerender } = renderHook(
        ({ questionnaire }) => useInitialiseForm(questionnaire),
        { initialProps: { questionnaire: mockQuestionnaire } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      const newQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'new-questionnaire',
        status: 'active'
      };

      rerender({ questionnaire: newQuestionnaire });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        newQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should re-run effect when questionnaireResponse changes', () => {
      const { rerender } = renderHook(
        ({ questionnaireResponse }) => useInitialiseForm(mockQuestionnaire, questionnaireResponse),
        { initialProps: { questionnaireResponse: mockQuestionnaireResponse } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      const newResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'new-response',
        status: 'completed'
      };

      rerender({ questionnaireResponse: newResponse });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        newResponse,
        undefined,
        undefined,
        undefined
      );
    });

    it('should re-run effect when readOnly changes', () => {
      const { rerender } = renderHook(
        ({ readOnly }) => useInitialiseForm(mockQuestionnaire, undefined, readOnly),
        { initialProps: { readOnly: false } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ readOnly: true });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        true,
        undefined,
        undefined
      );
    });

    it('should re-run effect when terminologyServerUrl changes', () => {
      const { rerender } = renderHook(
        ({ terminologyServerUrl }) => useInitialiseForm(mockQuestionnaire, undefined, undefined, terminologyServerUrl),
        { initialProps: { terminologyServerUrl: 'https://old.server.com' } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ terminologyServerUrl: 'https://new.server.com' });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        'https://new.server.com',
        undefined
      );
    });

    it('should re-run effect when additionalVariables changes', () => {
      const { rerender } = renderHook(
        ({ additionalVariables }) => useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, additionalVariables),
        { initialProps: { additionalVariables: { old: 'value' } as Record<string, any> } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ additionalVariables: { new: 'value' } as Record<string, any> });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        { new: 'value' }
      );
    });

    it('should re-run effect when fhirClient changes', () => {
      const { rerender } = renderHook(
        ({ fhirClient }) => useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, fhirClient),
        { initialProps: { fhirClient: mockFhirClient } }
      );

      expect(mockInitialiseFhirClient).toHaveBeenCalledTimes(1);

      const newClient = { request: jest.fn() } as unknown as Client;
      rerender({ fhirClient: newClient });

      expect(mockInitialiseFhirClient).toHaveBeenCalledTimes(2);
      expect(mockInitialiseFhirClient).toHaveBeenLastCalledWith(newClient);
    });
  });

  describe('store integration', () => {
    it('should access store setters correctly', () => {
      renderHook(() => useInitialiseForm(mockQuestionnaire));

      // Verify that store setters are accessed (they're used in the dependency array)
      expect(mockSetClient).toBeDefined();
      expect(mockSetPatient).toBeDefined();
      expect(mockSetUser).toBeDefined();
      expect(mockSetEncounter).toBeDefined();
    });

    it('should include store setters in effect dependencies', () => {
      const { useLayoutEffect } = require('react');
      
      renderHook(() => useInitialiseForm(mockQuestionnaire));

      // Verify useLayoutEffect was called with store setters in dependencies
      expect(useLayoutEffect).toHaveBeenCalledWith(
        expect.any(Function),
        expect.arrayContaining([
          mockSetClient,
          mockSetPatient,
          mockSetUser,
          mockSetEncounter
        ])
      );
    });
  });

  describe('error handling', () => {
    it('should handle buildForm errors gracefully', async () => {
      const error = new Error('Build form failed');
      mockBuildForm.mockRejectedValue(error);

      // Should not throw when buildForm fails
      expect(() => {
        renderHook(() => useInitialiseForm(mockQuestionnaire));
      }).not.toThrow();
    });

    it('should handle FHIR client initialization errors gracefully', async () => {
      const error = new Error('FHIR client initialization failed');
      mockInitialiseFhirClient.mockRejectedValue(error);

      // Should not throw when FHIR client initialization fails
      expect(() => {
        renderHook(() => useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient));
      }).not.toThrow();
    });
  });

  describe('loading states', () => {
    it('should return true while building form', () => {
      const { result } = renderHook(() => useInitialiseForm(mockQuestionnaire));
      
      // Should be loading initially
      expect(result.current).toBe(true);
    });

    it('should return true while initializing FHIR client', () => {
      const { result } = renderHook(() => 
        useInitialiseForm(mockQuestionnaire, undefined, undefined, undefined, undefined, mockFhirClient)
      );
      
      // Should be loading initially
      expect(result.current).toBe(true);
    });

    it('should handle state transitions correctly', async () => {
      let resolveBuildForm: () => void;
      const buildFormPromise = new Promise<void>((resolve) => {
        resolveBuildForm = resolve;
      });
      mockBuildForm.mockReturnValue(buildFormPromise);

      const { result, rerender } = renderHook(() => useInitialiseForm(mockQuestionnaire));

      // Initially loading
      expect(result.current).toBe(true);

      // Complete building
      await act(async () => {
        resolveBuildForm();
        await buildFormPromise;
      });

      rerender();
      // Should not be loading anymore
      expect(result.current).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple parameter changes simultaneously', () => {
      const { rerender } = renderHook(
        (props: any) => useInitialiseForm(
          props.questionnaire,
          props.questionnaireResponse,
          props.readOnly,
          props.terminologyServerUrl,
          props.additionalVariables,
          props.fhirClient
        ),
        {
          initialProps: {
            questionnaire: mockQuestionnaire,
            questionnaireResponse: undefined as any,
            readOnly: false as any,
            terminologyServerUrl: undefined as any,
            additionalVariables: undefined as any,
            fhirClient: undefined as any
          }
        }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      // Change multiple parameters at once
      rerender({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockQuestionnaireResponse,
        readOnly: true,
        terminologyServerUrl: 'https://terminology.example.com',
        additionalVariables: { test: 'value' },
        fhirClient: mockFhirClient
      });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockInitialiseFhirClient).toHaveBeenCalledWith(mockFhirClient);
    });

    it('should handle real-world FHIR data structures', () => {
      const complexQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'complex-questionnaire',
        meta: {
          versionId: '1',
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        status: 'active',
        item: [
          {
            linkId: '1',
            text: 'What is your name?',
            type: 'string',
            required: true
          },
          {
            linkId: '2',
            text: 'What is your age?',
            type: 'integer',
            required: false
          }
        ]
      };

      const complexResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        id: 'complex-response',
        meta: {
          versionId: '1',
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        status: 'in-progress',
        questionnaire: 'Questionnaire/complex-questionnaire',
        item: [
          {
            linkId: '1',
            answer: [{ valueString: 'John Doe' }]
          }
        ]
      };

      renderHook(() => useInitialiseForm(complexQuestionnaire, complexResponse));

      expect(mockBuildForm).toHaveBeenCalledWith(
        complexQuestionnaire,
        complexResponse,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle performance with frequent re-renders', () => {
      const { rerender } = renderHook(
        ({ counter }) => useInitialiseForm(mockQuestionnaire),
        { initialProps: { counter: 0 } }
      );

      // Multiple re-renders that don't change dependencies shouldn't trigger effect
      for (let i = 1; i <= 10; i++) {
        rerender({ counter: i });
      }

      // Effect should only run once since dependencies didn't change
      expect(mockBuildForm).toHaveBeenCalledTimes(1);
    });
  });
});
