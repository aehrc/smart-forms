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

import { renderHook } from '@testing-library/react';
import { useSnackbar } from 'notistack';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import type Client from 'fhirclient/lib/Client';
import useSmartClient from '../../../hooks/useSmartClient';
import usePopulate from '../hooks/usePopulate';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner';
import type {
  Encounter,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import { buildForm } from '@aehrc/smart-forms-renderer';

// Mock external dependencies
jest.mock('notistack');
jest.mock('@aehrc/sdc-populate');
jest.mock('../../../hooks/useSmartClient');
jest.mock('../utils/callback', () => ({
  fetchResourceCallback: jest.fn(),
  fetchTerminologyCallback: jest.fn()
}));
jest.mock('../../../components/Snackbar/CloseSnackbar', () => {
  return function MockCloseSnackbar() {
    return <div>CloseSnackbar</div>;
  };
});

// Create mock store functions that will be used in the module mock
const mockSourceQuestionnaire = jest.fn();
const mockSourceResponse = jest.fn();
const mockFormChangesHistory = jest.fn();
const mockTerminologyUrl = jest.fn();

jest.mock('@aehrc/smart-forms-renderer', () => ({
  useQuestionnaireStore: {
    use: {
      sourceQuestionnaire: () => mockSourceQuestionnaire()
    }
  },
  useQuestionnaireResponseStore: {
    use: {
      sourceResponse: () => mockSourceResponse(),
      formChangesHistory: () => mockFormChangesHistory()
    }
  },
  useTerminologyServerStore: {
    use: {
      url: () => mockTerminologyUrl()
    }
  },
  buildForm: jest.fn(() => Promise.resolve())
}));

// Create typed mocks
const mockEnqueueSnackbar = jest.fn();
const mockPopulateQuestionnaire = populateQuestionnaire as jest.MockedFunction<
  typeof populateQuestionnaire
>;
const mockUseSmartClient = useSmartClient as jest.MockedFunction<typeof useSmartClient>;
const mockBuildForm = buildForm as jest.MockedFunction<typeof buildForm>;

// Setup mocks
(useSnackbar as jest.Mock).mockReturnValue({
  enqueueSnackbar: mockEnqueueSnackbar
});

describe('usePopulate', () => {
  const mockOnStopSpinner = jest.fn();

  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-123',
    name: [{ family: 'Test', given: ['Patient'] }]
  };

  const mockUser: Practitioner = {
    resourceType: 'Practitioner',
    id: 'practitioner-123',
    name: [{ family: 'Test', given: ['Practitioner'] }]
  };

  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'encounter-123',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory'
    }
  };

  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-123',
    status: 'active',
    extension: [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-populationContext',
        valueExpression: {
          language: 'text/fhirpath',
          expression: 'Patient'
        }
      }
    ],
    item: []
  };

  const mockResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    questionnaire: 'questionnaire-123'
  };

  const mockSmartClient = {
    state: {
      serverUrl: 'https://test-fhir-server.com',
      tokenResponse: {
        access_token: 'test-access-token'
      }
    }
  } as Client;

  const createSpinner = (isSpinning: boolean, status: string): RendererSpinner => ({
    isSpinning,
    status: status as RendererSpinner['status'],
    message: ''
  });

  // Helper to create mock smart client return value
  const createMockSmartClientReturn = (overrides = {}) => ({
    smartClient: mockSmartClient,
    patient: mockPatient,
    user: mockUser,
    encounter: mockEncounter,
    fhirContext: null,
    launchQuestionnaire: null,
    tokenReceivedTimestamp: null,
    setSmartClient: jest.fn(),
    setCommonLaunchContexts: jest.fn(),
    setQuestionnaireLaunchContext: jest.fn(),
    setFhirContext: jest.fn(),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockUseSmartClient.mockReturnValue(createMockSmartClientReturn());
    mockSourceQuestionnaire.mockReturnValue(mockQuestionnaire);
    mockSourceResponse.mockReturnValue(mockResponse);
    mockFormChangesHistory.mockReturnValue([]);
    mockTerminologyUrl.mockReturnValue('https://test-terminology-server.com');
  });

  describe('hook initialization', () => {
    it('should not run population when status is not "prepopulate"', () => {
      const spinner = createSpinner(true, 'repopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).not.toHaveBeenCalled();
    });

    it('should stop spinner when form cannot be populated due to missing client', () => {
      mockUseSmartClient.mockReturnValue(createMockSmartClientReturn({ smartClient: null }));

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });

    it('should stop spinner when form cannot be populated due to missing patient', () => {
      mockUseSmartClient.mockReturnValue(createMockSmartClientReturn({ patient: null }));

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });

    it('should stop spinner when form cannot be populated due to missing user', () => {
      mockUseSmartClient.mockReturnValue(createMockSmartClientReturn({ user: null }));

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });

    it('should not populate when spinner is not spinning', () => {
      const spinner = createSpinner(false, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).not.toHaveBeenCalled();
    });

    it('should stop spinner when questionnaire has no extensions or contained resources', () => {
      const questionnaireWithoutExtensions = {
        ...mockQuestionnaire,
        extension: undefined,
        contained: undefined
      };
      mockSourceQuestionnaire.mockReturnValue(questionnaireWithoutExtensions);

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });

    it('should not populate when form has existing changes', () => {
      mockFormChangesHistory.mockReturnValue([
        { type: 'change', timestamp: Date.now() } as { type: string; timestamp: number }
      ]);

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });

    it('should not populate when response is from saved draft', () => {
      const responseWithId = { ...mockResponse, id: 'saved-response-123' };
      mockSourceResponse.mockReturnValue(responseWithId);

      const spinner = createSpinner(true, 'prepopulate');

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockOnStopSpinner).toHaveBeenCalledTimes(1);
    });
  });

  describe('population execution', () => {
    it('should call populateQuestionnaire with correct parameters when all conditions are met', () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse,
          populatedContext: { Patient: mockPatient }
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalledWith({
        questionnaire: mockQuestionnaire,
        fetchResourceCallback: expect.any(Function),
        fetchResourceRequestConfig: {
          sourceServerUrl: 'https://test-fhir-server.com',
          authToken: 'test-access-token'
        },
        patient: mockPatient,
        user: mockUser,
        encounter: mockEncounter,
        fhirContext: undefined,
        fetchTerminologyCallback: expect.any(Function),
        fetchTerminologyRequestConfig: {
          terminologyServerUrl: 'https://test-terminology-server.com'
        }
      });
    });

    it('should handle undefined encounter and fhirContext correctly', () => {
      mockUseSmartClient.mockReturnValue(
        createMockSmartClientReturn({ encounter: null, fhirContext: null })
      );

      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalledWith(
        expect.objectContaining({
          encounter: undefined,
          fhirContext: undefined
        })
      );
    });

    it('should not call populateQuestionnaire again if already populated', () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      const { rerender } = renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // First render should call populate
      expect(mockPopulateQuestionnaire).toHaveBeenCalledTimes(1);

      // Second render should not call populate again
      rerender();
      expect(mockPopulateQuestionnaire).toHaveBeenCalledTimes(1);
    });
  });

  describe('population success handling', () => {
    it('should handle successful population with complete result', async () => {
      const populatedContext = { Patient: mockPatient };
      const spinner = createSpinner(true, 'prepopulate');

      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse,
          populatedContext: populatedContext
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockBuildForm).toHaveBeenCalledWith({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockResponse,
        terminologyServerUrl: 'https://test-terminology-server.com',
        additionalContext: populatedContext
      });
      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Form populated', {
        preventDuplicate: true,
        action: expect.anything()
      });
    });

    it('should handle successful population with issues', async () => {
      const issues = {
        resourceType: 'OperationOutcome' as const,
        issue: [
          {
            severity: 'warning' as const,
            code: 'incomplete' as const,
            diagnostics: 'Some fields could not be populated'
          }
        ]
      };
      const spinner = createSpinner(true, 'prepopulate');

      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse,
          issues
        }
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockBuildForm).toHaveBeenCalledWith({
        questionnaire: mockQuestionnaire,
        questionnaireResponse: mockResponse,
        terminologyServerUrl: 'https://test-terminology-server.com',
        additionalContext: undefined
      });
      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Form partially populated, there might be pre-population issues. View console for details.',
        { action: expect.anything() }
      );
      expect(consoleSpy).toHaveBeenCalledWith(issues);

      consoleSpy.mockRestore();
    });
  });

  describe('population failure handling', () => {
    it('should handle null populate response', async () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: false,
        populateResult: null
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Form not populated', {
        variant: 'warning',
        action: expect.anything()
      });
    });

    it('should handle populate failure', async () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: false,
        populateResult: null
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Form not populated', {
        variant: 'warning',
        action: expect.anything()
      });
    });

    it('should handle populate exception', async () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockRejectedValue(new Error('Population failed'));

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Form not populated', {
        variant: 'warning',
        action: expect.anything()
      });
    });

    it('should handle missing populate result', async () => {
      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: null
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOnStopSpinner).toHaveBeenCalled();
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Form not populated', {
        variant: 'warning',
        action: expect.anything()
      });
    });
  });

  describe('questionnaire with contained resources', () => {
    it('should allow population when questionnaire has contained resources but no extensions', () => {
      const questionnaireWithContained = {
        ...mockQuestionnaire,
        extension: undefined,
        contained: [
          {
            resourceType: 'ValueSet' as const,
            id: 'test-valueset'
          }
        ]
      };
      mockSourceQuestionnaire.mockReturnValue(questionnaireWithContained);

      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle questionnaire with both extensions and contained resources', () => {
      const questionnaireWithBoth = {
        ...mockQuestionnaire,
        contained: [
          {
            resourceType: 'ValueSet' as const,
            id: 'test-valueset'
          }
        ]
      };
      mockSourceQuestionnaire.mockReturnValue(questionnaireWithBoth);

      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalled();
    });

    it('should handle empty form changes history array', () => {
      mockFormChangesHistory.mockReturnValue([]);

      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalled();
    });

    it('should handle response without id property', () => {
      const responseWithoutId = {
        resourceType: 'QuestionnaireResponse' as const,
        status: 'in-progress' as const,
        questionnaire: 'questionnaire-123'
      };
      mockSourceResponse.mockReturnValue(responseWithoutId);

      const spinner = createSpinner(true, 'prepopulate');
      mockPopulateQuestionnaire.mockResolvedValue({
        populateSuccess: true,
        populateResult: {
          populatedResponse: mockResponse
        }
      });

      renderHook(() => usePopulate(spinner, mockOnStopSpinner));

      expect(mockPopulateQuestionnaire).toHaveBeenCalled();
    });
  });
});
