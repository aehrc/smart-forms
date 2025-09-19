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
import type {
  Coding,
  Encounter,
  Patient,
  Practitioner,
  QuestionnaireItem,
  ValueSet
} from 'fhir/r4';
import useValueSetCodings from '../hooks/useValueSetCodings';
import type { LaunchContext } from '../interfaces/populate.interface';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
// Import mocked functions
import {
  getResourceFromLaunchContext,
  getValueSetCodings,
  getValueSetPromise
} from '../utils/valueSet';
import { getAnswerExpression } from '../utils/getExpressionsFromItem';
import fhirpath from 'fhirpath';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import useDynamicValueSetEffect, {
  getUpdatableValueSetUrl
} from '../hooks/useDynamicValueSetEffect';
import { getItemTerminologyServerToUse } from '../utils/preferredTerminologyServer';

// Mock dependencies
jest.mock('../utils/valueSet', () => ({
  ...jest.requireActual('../utils/valueSet'),
  getResourceFromLaunchContext: jest.fn(),
  getValueSetCodings: jest.fn(),
  getValueSetPromise: jest.fn()
}));

jest.mock('../utils/getExpressionsFromItem', () => ({
  getAnswerExpression: jest.fn()
}));

jest.mock('fhirpath', () => ({
  evaluate: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/addDisplayToCodings', () => ({
  addDisplayToCodingArray: jest.fn()
}));

jest.mock('../hooks/useDynamicValueSetEffect', () => ({
  __esModule: true,
  default: jest.fn(),
  getUpdatableValueSetUrl: jest.fn()
}));

jest.mock('../utils/preferredTerminologyServer', () => ({
  getItemTerminologyServerToUse: jest.fn()
}));

// Mock stores
let mockPatient: Patient | null = null;
let mockUser: Practitioner | null = null;
let mockEncounter: Encounter | null = null;
let mockLaunchContexts: Record<string, LaunchContext> = {};
let mockProcessedValueSets: Record<string, ProcessedValueSet> = {};
let mockCachedValueSetCodings: Record<string, Coding[]> = {};
let mockCalculatedExpressions: Record<string, any> = {};
const mockAddCodingToCache = jest.fn();
let mockXFhirQueryVariables: Record<string, any> = {};
let mockItemPreferredTerminologyServers: Record<string, string> = {};
let mockDefaultTerminologyServerUrl = 'http://terminology.hl7.org/fhir';

jest.mock('../stores', () => ({
  useSmartConfigStore: {
    use: {
      patient: () => mockPatient,
      user: () => mockUser,
      encounter: () => mockEncounter
    }
  },
  useQuestionnaireStore: {
    use: {
      launchContexts: () => mockLaunchContexts,
      processedValueSets: () => mockProcessedValueSets,
      cachedValueSetCodings: () => mockCachedValueSetCodings,
      calculatedExpressions: () => mockCalculatedExpressions,
      addCodingToCache: () => mockAddCodingToCache,
      variables: () => ({ xFhirQueryVariables: mockXFhirQueryVariables }),
      itemPreferredTerminologyServers: () => mockItemPreferredTerminologyServers
    }
  },
  useTerminologyServerStore: {
    use: {
      url: () => mockDefaultTerminologyServerUrl
    }
  }
}));

const mockGetResourceFromLaunchContext = getResourceFromLaunchContext as jest.MockedFunction<
  typeof getResourceFromLaunchContext
>;
const mockGetValueSetCodings = getValueSetCodings as jest.MockedFunction<typeof getValueSetCodings>;
const mockGetValueSetPromise = getValueSetPromise as jest.MockedFunction<typeof getValueSetPromise>;
const mockGetAnswerExpression = getAnswerExpression as jest.MockedFunction<
  typeof getAnswerExpression
>;
const mockFhirpath = fhirpath as jest.Mocked<typeof fhirpath>;
const mockAddDisplayToCodingArray = addDisplayToCodingArray as jest.MockedFunction<
  typeof addDisplayToCodingArray
>;
const mockUseDynamicValueSetEffect = useDynamicValueSetEffect as jest.MockedFunction<
  typeof useDynamicValueSetEffect
>;
const mockGetUpdatableValueSetUrl = getUpdatableValueSetUrl as jest.MockedFunction<
  typeof getUpdatableValueSetUrl
>;
const mockGetItemTerminologyServerToUse = getItemTerminologyServerToUse as jest.MockedFunction<
  typeof getItemTerminologyServerToUse
>;

describe('useValueSetCodings', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock state
    mockPatient = null;
    mockUser = null;
    mockEncounter = null;
    mockLaunchContexts = {};
    mockProcessedValueSets = {};
    mockCachedValueSetCodings = {};
    mockCalculatedExpressions = {};
    mockXFhirQueryVariables = {};
    mockItemPreferredTerminologyServers = {};
    mockDefaultTerminologyServerUrl = 'http://terminology.hl7.org/fhir';

    // Default mock implementations
    mockGetItemTerminologyServerToUse.mockReturnValue('http://terminology.hl7.org/fhir');
    mockUseDynamicValueSetEffect.mockImplementation(() => {});
    mockGetUpdatableValueSetUrl.mockImplementation((qItem) => qItem.answerValueSet || '');
    mockAddDisplayToCodingArray.mockResolvedValue([]);
  });

  describe('when answerValueSet is a contained reference', () => {
    it('should return cached codings for contained ValueSet', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: '123', display: 'Test Code' }
      ];

      mockCachedValueSetCodings = {
        'contained-vs': mockCodings
      };

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: '#contained-vs'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual(mockCodings);
      expect(result.current.terminologyError.error).toBeNull();
      expect(result.current.dynamicCodingsUpdated).toBe(false);
    });

    it('should return empty array when contained ValueSet not cached', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: '#missing-vs'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual([]);
      expect(result.current.terminologyError.error).toBeNull();
    });
  });

  describe('when answerValueSet has updatable URL', () => {
    it('should use updatable URL and return cached codings', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: '456', display: 'Updated Code' }
      ];

      mockProcessedValueSets = {
        'http://hl7.org/fhir/ValueSet/original': {
          updatableValueSetUrl: 'http://hl7.org/fhir/ValueSet/updated'
        } as ProcessedValueSet
      };

      mockCachedValueSetCodings = {
        'http://hl7.org/fhir/ValueSet/updated': mockCodings
      };

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/original'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual(mockCodings);
    });
  });

  describe('when answerValueSet has cached codings', () => {
    it('should return cached codings directly', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: '789', display: 'Cached Code' }
      ];

      mockCachedValueSetCodings = {
        'http://hl7.org/fhir/ValueSet/cached': mockCodings
      };

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/cached'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual(mockCodings);
    });
  });

  describe('when using answer expression', () => {
    it('should evaluate FHIRPath expression with launch context', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: 'expr-code', display: 'Expression Code' }
      ];

      mockPatient = { resourceType: 'Patient', id: 'patient-1' } as Patient;

      mockLaunchContexts = {
        patient: {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
          extension: [
            { url: 'test', valueString: 'test' },
            { url: 'test', valueCode: 'Patient' }
          ]
        } as any
      };

      mockGetAnswerExpression.mockReturnValue({
        expression: '%patient.code',
        language: 'text/fhirpath'
      });

      mockGetResourceFromLaunchContext.mockReturnValue(mockPatient);
      mockFhirpath.evaluate.mockReturnValue(mockCodings);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(mockGetAnswerExpression).toHaveBeenCalledWith(qItem);
      expect(mockGetResourceFromLaunchContext).toHaveBeenCalledWith(
        'Patient',
        mockPatient,
        null,
        null
      );
      expect(mockFhirpath.evaluate).toHaveBeenCalledWith(
        {},
        '%patient.code',
        { patient: mockPatient },
        expect.anything(),
        { async: false }
      );
      expect(result.current.codings).toEqual(mockCodings);
    });

    it('should evaluate FHIRPath expression with xFhirQuery variables', () => {
      const mockResource = { resourceType: 'Observation', id: 'obs-1' };
      const mockCodings: Coding[] = [
        { system: 'http://loinc.org', code: 'query-code', display: 'Query Code' }
      ];

      mockXFhirQueryVariables = {
        observation: {
          result: mockResource
        }
      };

      mockGetAnswerExpression.mockReturnValue({
        expression: '%observation.code.coding',
        language: 'text/fhirpath'
      });

      mockFhirpath.evaluate.mockReturnValue(mockCodings);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(mockFhirpath.evaluate).toHaveBeenCalledWith(
        {},
        '%observation.code.coding',
        { observation: mockResource },
        expect.anything(),
        { async: false }
      );
      expect(result.current.codings).toEqual(mockCodings);
    });

    it('should handle CodeableConcept evaluation result', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: 'cc-code', display: 'CodeableConcept Code' }
      ];

      mockPatient = { resourceType: 'Patient', id: 'patient-1' } as Patient;

      mockLaunchContexts = {
        patient: {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
          extension: [
            { url: 'test', valueString: 'test' },
            { url: 'test', valueCode: 'Patient' }
          ]
        } as any
      };

      mockGetAnswerExpression.mockReturnValue({
        expression: '%patient.code',
        language: 'text/fhirpath'
      });

      mockGetResourceFromLaunchContext.mockReturnValue(mockPatient);
      // Mock CodeableConcept result
      mockFhirpath.evaluate.mockReturnValue([{ coding: mockCodings }]);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual(mockCodings);
    });

    it('should handle FHIRPath evaluation errors gracefully', () => {
      mockPatient = { resourceType: 'Patient', id: 'patient-1' } as Patient;

      mockLaunchContexts = {
        patient: {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
          extension: [
            { url: 'test', valueString: 'test' },
            { url: 'test', valueCode: 'Patient' }
          ]
        } as any
      };

      mockGetAnswerExpression.mockReturnValue({
        expression: '%patient.invalid.expression',
        language: 'text/fhirpath'
      });

      mockGetResourceFromLaunchContext.mockReturnValue(mockPatient);
      mockFhirpath.evaluate.mockImplementation(() => {
        throw new Error('Invalid FHIRPath expression');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(consoleSpy).toHaveBeenCalledWith('Invalid FHIRPath expression');
      expect(result.current.codings).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('useDynamicValueSetEffect integration', () => {
    it('should call useDynamicValueSetEffect with correct parameters', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      renderHook(() => useValueSetCodings(qItem));

      expect(mockUseDynamicValueSetEffect).toHaveBeenCalledWith(
        qItem,
        'http://terminology.hl7.org/fhir',
        mockProcessedValueSets,
        mockCachedValueSetCodings,
        expect.any(Function), // setCodings
        expect.any(Function), // setDynamicCodingsUpdated
        expect.any(Function) // setServerError
      );
    });
  });

  describe('fallback ValueSet expansion', () => {
    it('should expand ValueSet when no cached codings exist', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-vs',
        status: 'active'
      };

      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: 'fallback-code', display: 'Fallback Code' }
      ];

      const mockCodingsWithDisplay: Coding[] = [
        {
          system: 'http://snomed.info/sct',
          code: 'fallback-code',
          display: 'Fallback Code with Display'
        }
      ];

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue(mockCodings);
      mockAddDisplayToCodingArray.mockResolvedValue(mockCodingsWithDisplay);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      // Wait for async effects
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetValueSetPromise).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/test',
        'http://terminology.hl7.org/fhir'
      );
      expect(mockGetValueSetCodings).toHaveBeenCalledWith(mockValueSet);
      expect(mockAddDisplayToCodingArray).toHaveBeenCalledWith(
        mockCodings,
        'http://terminology.hl7.org/fhir'
      );
      expect(mockAddCodingToCache).toHaveBeenCalledWith(
        'http://hl7.org/fhir/ValueSet/test',
        mockCodingsWithDisplay
      );
    });

    it('should handle ValueSet promise rejection', async () => {
      const promiseError = new Error('Failed to fetch ValueSet');
      mockGetValueSetPromise.mockRejectedValue(promiseError);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      // Wait for async effects
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.terminologyError.error).toEqual(promiseError);
    });

    it('should handle addDisplayToCodingArray rejection', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        id: 'test-vs',
        status: 'active'
      };

      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: 'test-code', display: 'Test Code' }
      ];

      const displayError = new Error('Failed to add display');

      mockGetValueSetPromise.mockResolvedValue(mockValueSet);
      mockGetValueSetCodings.mockReturnValue(mockCodings);
      mockAddDisplayToCodingArray.mockRejectedValue(displayError);

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      // Wait for async effects
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.terminologyError.error).toEqual(displayError);
    });

    it('should not expand when codings already exist', () => {
      const mockCodings: Coding[] = [
        { system: 'http://snomed.info/sct', code: 'existing-code', display: 'Existing Code' }
      ];

      mockCachedValueSetCodings = {
        'http://hl7.org/fhir/ValueSet/test': mockCodings
      };

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      renderHook(() => useValueSetCodings(qItem));

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });

    it('should not expand when no answerValueSet is provided', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      renderHook(() => useValueSetCodings(qItem));

      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });
  });

  describe('terminology server selection', () => {
    it('should use item-specific terminology server when available', () => {
      mockItemPreferredTerminologyServers = {
        'test-item': 'http://custom.terminology.server/fhir'
      };

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      renderHook(() => useValueSetCodings(qItem));

      expect(mockGetItemTerminologyServerToUse).toHaveBeenCalledWith(
        qItem,
        mockItemPreferredTerminologyServers,
        mockDefaultTerminologyServerUrl
      );
    });
  });

  describe('edge cases', () => {
    it('should handle missing answerValueSet gracefully', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual([]);
      expect(result.current.terminologyError.answerValueSet).toBe('');
      expect(result.current.dynamicCodingsUpdated).toBe(false);
    });

    it('should handle empty cached codings', () => {
      mockCachedValueSetCodings = {};

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/test'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual([]);
    });

    it('should handle answer expression without valid context', () => {
      mockGetAnswerExpression.mockReturnValue({
        expression: '%unknown.code',
        language: 'text/fhirpath'
      });

      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const { result } = renderHook(() => useValueSetCodings(qItem));

      expect(result.current.codings).toEqual([]);
    });
  });
});
