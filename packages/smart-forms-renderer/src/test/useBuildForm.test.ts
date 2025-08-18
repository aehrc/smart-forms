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
import type { ComponentType } from 'react';
import useBuildForm from '../hooks/useBuildForm';
import type { RendererStyling } from '../stores/rendererStylingStore';
import type { QItemOverrideComponentProps, SdcUiOverrideComponentProps } from '../interfaces';

// Mock buildForm utility
const mockBuildForm = jest.fn();

// Mock renderer styling store
const mockSetRendererStyling = jest.fn();

jest.mock('../utils', () => ({
  buildForm: (...args: any[]) => mockBuildForm(...args)
}));

jest.mock('../stores/rendererStylingStore', () => ({
  useRendererStylingStore: {
    use: {
      setRendererStyling: () => mockSetRendererStyling
    }
  }
}));

describe('useBuildForm', () => {
  // Mock data
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'test-questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      }
    ]
  };

  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'test-response',
    status: 'in-progress',
    questionnaire: 'test-questionnaire'
  };

  const mockRendererStyling: RendererStyling = {
    readOnlyVisualStyle: 'disabled',
    requiredIndicatorPosition: 'start'
  };

  const mockAdditionalVariables = {
    'ObsBodyHeight': { resourceType: 'Bundle' },
    'PatientData': { name: 'John Doe' }
  };

  const mockQItemOverrideComponents: Record<string, ComponentType<QItemOverrideComponentProps>> = {
    'custom-item': (() => null) as ComponentType<QItemOverrideComponentProps>
  };

  const mockSdcUiOverrideComponents: Record<string, ComponentType<SdcUiOverrideComponentProps>> = {
    'drop-down': (() => null) as ComponentType<SdcUiOverrideComponentProps>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock buildForm to return a resolved promise by default
    mockBuildForm.mockResolvedValue(undefined);
  });

  describe('basic functionality', () => {
    it('should return true (isBuilding) initially', () => {
      const { result } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(result.current).toBe(true);
    });

    it('should call buildForm with questionnaire only', () => {
      renderHook(() => useBuildForm(mockQuestionnaire));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined, // questionnaireResponse
        undefined, // readOnly
        undefined, // terminologyServerUrl
        undefined, // additionalVariables
        undefined, // qItemOverrideComponents
        undefined  // sdcUiOverrideComponents
      );
    });

    it('should return false (isBuilding) after buildForm completes', async () => {
      const { result } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(result.current).toBe(true);

      // Wait for buildForm to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('with all parameters', () => {
    it('should call buildForm with all parameters provided', () => {
      renderHook(() =>
        useBuildForm(
          mockQuestionnaire,
          mockQuestionnaireResponse,
          true, // readOnly
          'http://terminology.hl7.org/fhir',
          mockAdditionalVariables,
          mockRendererStyling,
          mockQItemOverrideComponents,
          mockSdcUiOverrideComponents
        )
      );

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        true,
        'http://terminology.hl7.org/fhir',
        mockAdditionalVariables,
        mockQItemOverrideComponents,
        mockSdcUiOverrideComponents
      );
    });

    it('should call setRendererStyling when rendererStylingOptions is provided', () => {
      renderHook(() =>
        useBuildForm(
          mockQuestionnaire,
          undefined,
          undefined,
          undefined,
          undefined,
          mockRendererStyling
        )
      );

      expect(mockSetRendererStyling).toHaveBeenCalledWith(mockRendererStyling);
    });

    it('should not call setRendererStyling when rendererStylingOptions is not provided', () => {
      renderHook(() => useBuildForm(mockQuestionnaire));

      expect(mockSetRendererStyling).not.toHaveBeenCalled();
    });
  });

  describe('parameter combinations', () => {
    it('should handle readOnly flag only', () => {
      renderHook(() => useBuildForm(mockQuestionnaire, undefined, true));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        true,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle questionnaireResponse and readOnly', () => {
      renderHook(() => useBuildForm(mockQuestionnaire, mockQuestionnaireResponse, false));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        mockQuestionnaireResponse,
        false,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle terminologyServerUrl only', () => {
      const terminologyUrl = 'http://custom.terminology.server/fhir';
      
      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        terminologyUrl
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        terminologyUrl,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle additionalVariables only', () => {
      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        mockAdditionalVariables
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        mockAdditionalVariables,
        undefined,
        undefined
      );
    });

    it('should handle override components only', () => {
      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockQItemOverrideComponents,
        mockSdcUiOverrideComponents
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        mockQItemOverrideComponents,
        mockSdcUiOverrideComponents
      );
    });
  });

  describe('async behavior and state management', () => {
    it('should handle buildForm promise rejection gracefully', async () => {
      const error = new Error('Build form failed');
      mockBuildForm.mockRejectedValue(error);

      const { result } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(result.current).toBe(true);

      // The hook doesn't handle errors explicitly, so state should remain true
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // State should remain true since promise was rejected
      expect(result.current).toBe(true);
    });

    it('should handle slow buildForm completion', async () => {
      let resolvePromise: () => void;
      const slowPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockBuildForm.mockReturnValue(slowPromise);

      const { result } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(result.current).toBe(true);

      // Promise not resolved yet, should still be building
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      expect(result.current).toBe(true);

      // Now resolve the promise
      await act(async () => {
        resolvePromise!();
        await slowPromise;
      });

      expect(result.current).toBe(false);
    });

    it('should handle immediate buildForm completion', async () => {
      mockBuildForm.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(result.current).toBe(true);

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current).toBe(false);
    });
  });

  describe('dependency array and re-renders', () => {
    it('should rebuild when questionnaire changes', () => {
      const newQuestionnaire: Questionnaire = {
        ...mockQuestionnaire,
        id: 'new-questionnaire'
      };

      const { rerender } = renderHook(
        ({ questionnaire }) => useBuildForm(questionnaire),
        { initialProps: { questionnaire: mockQuestionnaire } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ questionnaire: newQuestionnaire });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        newQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should rebuild when questionnaireResponse changes', () => {
      const newResponse: QuestionnaireResponse = {
        ...mockQuestionnaireResponse,
        id: 'new-response'
      };

      const { rerender } = renderHook(
        ({ response }) => useBuildForm(mockQuestionnaire, response),
        { initialProps: { response: mockQuestionnaireResponse } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ response: newResponse });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockBuildForm).toHaveBeenLastCalledWith(
        mockQuestionnaire,
        newResponse,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should rebuild when readOnly changes', () => {
      const { rerender } = renderHook(
        ({ readOnly }) => useBuildForm(mockQuestionnaire, undefined, readOnly),
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
        undefined,
        undefined,
        undefined
      );
    });

    it('should rebuild when terminologyServerUrl changes', () => {
      const { rerender } = renderHook(
        ({ url }) => useBuildForm(mockQuestionnaire, undefined, undefined, url),
        { initialProps: { url: 'http://server1.com/fhir' } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ url: 'http://server2.com/fhir' });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
    });

    it('should rebuild when additionalVariables are provided', () => {
      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        mockAdditionalVariables
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        mockAdditionalVariables,
        undefined,
        undefined
      );
    });

    it('should rebuild when rendererStylingOptions changes', () => {
      const newStyling: RendererStyling = { readOnlyVisualStyle: 'readonly' };

      const { rerender } = renderHook(
        ({ styling }) => useBuildForm(mockQuestionnaire, undefined, undefined, undefined, undefined, styling),
        { initialProps: { styling: mockRendererStyling } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);
      expect(mockSetRendererStyling).toHaveBeenCalledWith(mockRendererStyling);

      rerender({ styling: newStyling });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
      expect(mockSetRendererStyling).toHaveBeenCalledWith(newStyling);
    });

    it('should rebuild when override components change', () => {
      const newQItemOverrides: Record<string, ComponentType<QItemOverrideComponentProps>> = {
        'new-item': (() => null) as ComponentType<QItemOverrideComponentProps>
      };

      const { rerender } = renderHook(
        ({ overrides }) => useBuildForm(mockQuestionnaire, undefined, undefined, undefined, undefined, undefined, overrides),
        { initialProps: { overrides: mockQItemOverrideComponents } }
      );

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      rerender({ overrides: newQItemOverrides });

      expect(mockBuildForm).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty questionnaire', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'empty',
        status: 'active'
        // No items
      };

      renderHook(() => useBuildForm(emptyQuestionnaire));

      expect(mockBuildForm).toHaveBeenCalledWith(
        emptyQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle null/undefined values in additionalVariables', () => {
      const variablesWithNull = {
        'ValidVar': 'value',
        'NullVar': null,
        'UndefinedVar': undefined
      };

      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        variablesWithNull
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        variablesWithNull,
        undefined,
        undefined
      );
    });

    it('should handle empty override components objects', () => {
      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {}, // empty qItemOverrideComponents
        {}  // empty sdcUiOverrideComponents
      ));

      expect(mockBuildForm).toHaveBeenCalledWith(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        {},
        {}
      );
    });

    it('should handle empty rendererStyling object', () => {
      const emptyStyling: RendererStyling = {};

      renderHook(() => useBuildForm(
        mockQuestionnaire,
        undefined,
        undefined,
        undefined,
        undefined,
        emptyStyling
      ));

      expect(mockSetRendererStyling).toHaveBeenCalledWith(emptyStyling);
    });
  });

  describe('performance and optimization', () => {
    it('should only call buildForm once on initial render', () => {
      renderHook(() => useBuildForm(mockQuestionnaire));

      expect(mockBuildForm).toHaveBeenCalledTimes(1);
    });

    it('should not rebuild with same parameters', () => {
      const { rerender } = renderHook(() => useBuildForm(mockQuestionnaire));

      expect(mockBuildForm).toHaveBeenCalledTimes(1);

      // Rerender with same parameters
      rerender();

      // Should not call buildForm again
      expect(mockBuildForm).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid parameter changes efficiently', () => {
      const { rerender } = renderHook(
        ({ readOnly }) => useBuildForm(mockQuestionnaire, undefined, readOnly),
        { initialProps: { readOnly: false } }
      );

      // Rapid changes
      rerender({ readOnly: true });
      rerender({ readOnly: false });
      rerender({ readOnly: true });

      expect(mockBuildForm).toHaveBeenCalledTimes(4); // Initial + 3 changes
    });
  });
});
