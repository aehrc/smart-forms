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

import { act, renderHook } from '@testing-library/react';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
import {
  buildBundleFromObservationArray,
  extractObservationBased
} from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient';
import { getExtractMechanism } from '../../renderer/utils/extract';
import { validateExtractedBundle } from '../utils/validateExtractedBundle';
import useSaveAsFinalExtraction from '../hooks/useSaveAsFinalExtraction';

jest.mock('../../../hooks/useSmartClient');
jest.mock('@aehrc/sdc-populate', () => ({
  populateQuestionnaire: jest.fn()
}));
// Overrides the module-level mock in setup-jest.ts, which only stubs
// canBeTemplateExtracted/parametersIsFhirPatch, not inAppExtract/extractResultIsOperationOutcome.
jest.mock('@aehrc/sdc-template-extract', () => ({
  inAppExtract: jest.fn(),
  extractResultIsOperationOutcome: jest.fn()
}));
jest.mock('../../renderer/utils/extract', () => ({
  getExtractMechanism: jest.fn()
}));
jest.mock('../utils/validateExtractedBundle', () => ({
  validateExtractedBundle: jest.fn()
}));
jest.mock('../../prepopulate/utils/callback', () => ({
  fetchResourceCallback: jest.fn()
}));

const mockSourceQuestionnaire = jest.fn();
const mockUpdatableResponse = jest.fn();

jest.mock('@aehrc/smart-forms-renderer', () => ({
  useQuestionnaireStore: {
    use: {
      sourceQuestionnaire: () => mockSourceQuestionnaire()
    }
  },
  useQuestionnaireResponseStore: {
    use: {
      updatableResponse: () => mockUpdatableResponse()
    }
  },
  extractObservationBased: jest.fn(),
  buildBundleFromObservationArray: jest.fn()
}));

const mockUseSmartClient = useSmartClient as jest.MockedFunction<typeof useSmartClient>;
const mockGetExtractMechanism = getExtractMechanism as jest.MockedFunction<
  typeof getExtractMechanism
>;
const mockPopulateQuestionnaire = populateQuestionnaire as jest.MockedFunction<
  typeof populateQuestionnaire
>;
const mockInAppExtract = inAppExtract as jest.MockedFunction<typeof inAppExtract>;
const mockExtractResultIsOperationOutcome = extractResultIsOperationOutcome as jest.MockedFunction<
  typeof extractResultIsOperationOutcome
>;
const mockValidateExtractedBundle = validateExtractedBundle as jest.MockedFunction<
  typeof validateExtractedBundle
>;
const mockExtractObservationBased = extractObservationBased as jest.MockedFunction<
  typeof extractObservationBased
>;
const mockBuildBundleFromObservationArray = buildBundleFromObservationArray as jest.MockedFunction<
  typeof buildBundleFromObservationArray
>;

describe('useSaveAsFinalExtraction', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'questionnaire-123'
  };

  const mockResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    questionnaire: 'questionnaire-123'
  };

  const mockBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [{ resource: { resourceType: 'Observation', status: 'final', code: {} } }]
  };

  const mockSmartClient = {
    state: {
      serverUrl: 'https://test-fhir-server.com',
      tokenResponse: { access_token: 'test-access-token' }
    }
  } as Client;

  const createMockSmartClientReturn = (overrides = {}) => ({
    smartClient: mockSmartClient,
    patient: { resourceType: 'Patient', id: 'patient-123' },
    user: { resourceType: 'Practitioner', id: 'practitioner-123' },
    encounter: { resourceType: 'Encounter', id: 'encounter-123', status: 'in-progress' },
    fhirContext: null,
    resolvedFhirContextReferences: null,
    launchQuestionnaire: null,
    tokenReceivedTimestamp: null,
    extraLaunchContext: {
      disableWriteBackSelection: false,
      enableBundleValidation: false
    },
    setSmartClient: jest.fn(),
    setCommonLaunchContexts: jest.fn(),
    setQuestionnaireLaunchContext: jest.fn(),
    setFhirContext: jest.fn(),
    setResolvedFhirContextReferences: jest.fn(),
    setExtraLaunchContext: jest.fn(),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSmartClient.mockReturnValue(createMockSmartClientReturn());
    mockSourceQuestionnaire.mockReturnValue(mockQuestionnaire);
    mockUpdatableResponse.mockReturnValue(mockResponse);
    mockPopulateQuestionnaire.mockResolvedValue({
      populateSuccess: true,
      populateResult: { populatedResponse: mockResponse }
    });
    mockInAppExtract.mockResolvedValue({
      extractResult: { extractedBundle: mockBundle }
    } as Awaited<ReturnType<typeof inAppExtract>>);
    mockExtractResultIsOperationOutcome.mockReturnValue(false);
  });

  it('reflects extractMechanism / writeBackEnabled from getExtractMechanism', () => {
    mockGetExtractMechanism.mockReturnValue('template-based');

    const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted: jest.fn() }));

    expect(result.current.extractMechanism).toBe('template-based');
    expect(result.current.writeBackEnabled).toBe(true);
    expect(mockGetExtractMechanism).toHaveBeenCalledWith(mockQuestionnaire);
  });

  it('writeBackEnabled is false when the questionnaire cannot be extracted', () => {
    mockGetExtractMechanism.mockReturnValue(null);

    const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted: jest.fn() }));

    expect(result.current.writeBackEnabled).toBe(false);
  });

  it('runExtraction is a no-op when the questionnaire cannot be extracted', async () => {
    mockGetExtractMechanism.mockReturnValue(null);
    const onExtracted = jest.fn();

    const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted }));

    await act(async () => {
      await result.current.runExtraction();
    });

    expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
    expect(mockInAppExtract).not.toHaveBeenCalled();
    expect(mockExtractObservationBased).not.toHaveBeenCalled();
    expect(onExtracted).not.toHaveBeenCalled();
    expect(result.current.extractedBundle).toBeNull();
  });

  describe('observation-based extraction', () => {
    beforeEach(() => {
      mockGetExtractMechanism.mockReturnValue('observation-based');
      mockExtractObservationBased.mockReturnValue([{ resourceType: 'Observation' } as never]);
      mockBuildBundleFromObservationArray.mockReturnValue(mockBundle);
    });

    it('extracts observations, builds a bundle and calls onExtracted', async () => {
      const onExtracted = jest.fn();
      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(mockExtractObservationBased).toHaveBeenCalledWith(mockQuestionnaire, mockResponse);
      expect(mockBuildBundleFromObservationArray).toHaveBeenCalledWith([
        { resourceType: 'Observation' }
      ]);
      expect(result.current.extractedBundle).toBe(mockBundle);
      expect(onExtracted).toHaveBeenCalledTimes(1);
      // Observation-based extraction never touches the template pipeline
      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockInAppExtract).not.toHaveBeenCalled();
    });
  });

  describe('template-based extraction', () => {
    beforeEach(() => {
      mockGetExtractMechanism.mockReturnValue('template-based');
    });

    it('populates, extracts and calls onExtracted on the happy path', async () => {
      const onExtracted = jest.fn();
      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(mockPopulateQuestionnaire).toHaveBeenCalledWith(
        expect.objectContaining({
          questionnaire: mockQuestionnaire,
          fetchResourceRequestConfig: {
            sourceServerUrl: 'https://test-fhir-server.com',
            authToken: 'test-access-token'
          }
        })
      );
      expect(mockInAppExtract).toHaveBeenCalledWith(mockResponse, mockQuestionnaire, mockResponse);
      expect(result.current.extractedBundle).toBe(mockBundle);
      expect(result.current.invalidBundleEntryIndices).toBeNull();
      expect(result.current.isExtracting).toBe(false);
      expect(onExtracted).toHaveBeenCalledTimes(1);
      // Bundle validation is opt-in via extraLaunchContext
      expect(mockValidateExtractedBundle).not.toHaveBeenCalled();
    });

    it('does not validate the extracted bundle when enableBundleValidation is false', async () => {
      mockUseSmartClient.mockReturnValue(
        createMockSmartClientReturn({
          extraLaunchContext: { disableWriteBackSelection: false, enableBundleValidation: false }
        })
      );

      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted: jest.fn() }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(mockValidateExtractedBundle).not.toHaveBeenCalled();
      expect(result.current.invalidBundleEntryIndices).toBeNull();
    });

    it('validates the extracted bundle when enableBundleValidation is set', async () => {
      mockUseSmartClient.mockReturnValue(
        createMockSmartClientReturn({
          extraLaunchContext: { disableWriteBackSelection: false, enableBundleValidation: true }
        })
      );
      mockValidateExtractedBundle.mockResolvedValue(new Set([0, 2]));

      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted: jest.fn() }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(mockValidateExtractedBundle).toHaveBeenCalledWith(mockBundle, mockSmartClient);
      expect(result.current.invalidBundleEntryIndices).toEqual(new Set([0, 2]));
    });

    it('bails out without extracting when smartClient/patient/user is missing', async () => {
      mockUseSmartClient.mockReturnValue(createMockSmartClientReturn({ patient: null }));
      const onExtracted = jest.fn();

      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(mockPopulateQuestionnaire).not.toHaveBeenCalled();
      expect(mockInAppExtract).not.toHaveBeenCalled();
      expect(onExtracted).not.toHaveBeenCalled();
      expect(result.current.isExtracting).toBe(false);
    });

    it('does not call onExtracted when extraction returns an OperationOutcome', async () => {
      mockExtractResultIsOperationOutcome.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const onExtracted = jest.fn();

      const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted }));

      await act(async () => {
        await result.current.runExtraction();
      });

      expect(onExtracted).not.toHaveBeenCalled();
      expect(result.current.extractedBundle).toBeNull();
      expect(result.current.isExtracting).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  it('resetExtractionState clears extraction state back to its initial values', async () => {
    mockGetExtractMechanism.mockReturnValue('observation-based');
    mockExtractObservationBased.mockReturnValue([{ resourceType: 'Observation' } as never]);
    mockBuildBundleFromObservationArray.mockReturnValue(mockBundle);

    const { result } = renderHook(() => useSaveAsFinalExtraction({ onExtracted: jest.fn() }));

    await act(async () => {
      await result.current.runExtraction();
    });
    expect(result.current.extractedBundle).toBe(mockBundle);

    act(() => {
      result.current.resetExtractionState();
    });

    expect(result.current.extractedBundle).toBeNull();
    expect(result.current.invalidBundleEntryIndices).toBeNull();
    expect(result.current.isExtracting).toBe(false);
  });
});
