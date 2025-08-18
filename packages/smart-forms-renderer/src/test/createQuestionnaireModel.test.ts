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

import type { Questionnaire } from 'fhir/r4';
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionnaireModel';

// Mock all the utility functions that createQuestionnaireModel calls
jest.mock('../utils/qItem', () => ({
  getLinkIdPartialItemMap: jest.fn(),
  getLinkIdPreferredTerminologyServerTuples: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractLaunchContext', () => ({
  extractLaunchContexts: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractVariables', () => ({
  extractQuestionnaireLevelVariables: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractTabs', () => ({
  extractTabs: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractPages', () => ({
  extractPages: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractContainedValueSets', () => ({
  extractContainedValueSets: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractOtherExtensions', () => ({
  extractOtherExtensions: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/resolveValueSets', () => ({
  resolveValueSets: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/addDisplayToCodings', () => ({
  addDisplayToCacheCodings: jest.fn(),
  addDisplayToAnswerOptions: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractTargetConstraint', () => ({
  extractTargetConstraints: jest.fn()
}));

import { getLinkIdPartialItemMap, getLinkIdPreferredTerminologyServerTuples } from '../utils/qItem';
import { extractLaunchContexts } from '../utils/questionnaireStoreUtils/extractLaunchContext';
import { extractQuestionnaireLevelVariables } from '../utils/questionnaireStoreUtils/extractVariables';
import { extractTabs } from '../utils/questionnaireStoreUtils/extractTabs';
import { extractPages } from '../utils/questionnaireStoreUtils/extractPages';
import { extractContainedValueSets } from '../utils/questionnaireStoreUtils/extractContainedValueSets';
import { extractOtherExtensions } from '../utils/questionnaireStoreUtils/extractOtherExtensions';
import { resolveValueSets } from '../utils/questionnaireStoreUtils/resolveValueSets';
import { addDisplayToCacheCodings, addDisplayToAnswerOptions } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import { extractTargetConstraints } from '../utils/questionnaireStoreUtils/extractTargetConstraint';

const mockGetLinkIdPartialItemMap = getLinkIdPartialItemMap as jest.MockedFunction<typeof getLinkIdPartialItemMap>;
const mockGetLinkIdPreferredTerminologyServerTuples = getLinkIdPreferredTerminologyServerTuples as jest.MockedFunction<typeof getLinkIdPreferredTerminologyServerTuples>;
const mockExtractLaunchContexts = extractLaunchContexts as jest.MockedFunction<typeof extractLaunchContexts>;
const mockExtractQuestionnaireLevelVariables = extractQuestionnaireLevelVariables as jest.MockedFunction<typeof extractQuestionnaireLevelVariables>;
const mockExtractTabs = extractTabs as jest.MockedFunction<typeof extractTabs>;
const mockExtractPages = extractPages as jest.MockedFunction<typeof extractPages>;
const mockExtractContainedValueSets = extractContainedValueSets as jest.MockedFunction<typeof extractContainedValueSets>;
const mockExtractOtherExtensions = extractOtherExtensions as jest.MockedFunction<typeof extractOtherExtensions>;
const mockResolveValueSets = resolveValueSets as jest.MockedFunction<typeof resolveValueSets>;
const mockAddDisplayToCacheCodings = addDisplayToCacheCodings as jest.MockedFunction<typeof addDisplayToCacheCodings>;
const mockAddDisplayToAnswerOptions = addDisplayToAnswerOptions as jest.MockedFunction<typeof addDisplayToAnswerOptions>;
const mockExtractTargetConstraints = extractTargetConstraints as jest.MockedFunction<typeof extractTargetConstraints>;

describe('createQuestionnaireModel - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuestionnaireModel', () => {
    it('should return empty model when questionnaire has no items', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const result = await createQuestionnaireModel(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        itemMap: {},
        itemPreferredTerminologyServers: {},
        tabs: {},
        pages: {},
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        launchContexts: {},
        targetConstraints: {},
        calculatedExpressions: {},
        initialExpressions: {},
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        processedValueSets: {},
        cachedValueSetCodings: {},
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      // Verify that none of the extraction functions were called for empty questionnaire
      expect(mockGetLinkIdPartialItemMap).not.toHaveBeenCalled();
      expect(mockExtractTabs).not.toHaveBeenCalled();
      expect(mockExtractPages).not.toHaveBeenCalled();
    });

    it('should return empty model when questionnaire has empty items array', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      // Mock the functions that are called even with empty items array
      mockGetLinkIdPartialItemMap.mockReturnValue({});
      mockGetLinkIdPreferredTerminologyServerTuples.mockReturnValue([]);
      mockExtractTabs.mockReturnValue({});
      mockExtractPages.mockReturnValue({});
      mockExtractLaunchContexts.mockReturnValue({});
      mockExtractTargetConstraints.mockReturnValue({});
      mockExtractQuestionnaireLevelVariables.mockReturnValue({ fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} });
      mockExtractContainedValueSets.mockReturnValue({ processedValueSets: {}, valueSetPromises: {}, cachedValueSetCodings: {} });
      mockExtractOtherExtensions.mockResolvedValue({
        variables: { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} },
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {} as any,
        valueSetPromises: {},
        processedValueSets: {},
        cachedValueSetCodings: {}
      });
      mockResolveValueSets.mockResolvedValue({ variables: { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} }, cachedValueSetCodings: {} });
      mockAddDisplayToCacheCodings.mockResolvedValue({});
      mockAddDisplayToAnswerOptions.mockResolvedValue({});

      const result = await createQuestionnaireModel(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result).toEqual({
        itemMap: {},
        itemPreferredTerminologyServers: {},
        tabs: {},
        pages: {},
        variables: { fhirPathVariables: { "QuestionnaireLevel": [] }, xFhirQueryVariables: {} },
        launchContexts: {},
        targetConstraints: {},
        calculatedExpressions: {},
        initialExpressions: {},
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        processedValueSets: {},
        cachedValueSetCodings: {},
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });
    });

    it('should create complete questionnaire model when questionnaire has items', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          },
          {
            linkId: 'item2',
            type: 'choice',
            text: 'Question 2',
            answerOption: [
              { valueString: 'Option 1' },
              { valueString: 'Option 2' }
            ]
          }
        ]
      };

      // Setup all the mock returns
      const mockItemMap = { 'item1': { linkId: 'item1', type: 'string' as const, text: 'Question 1' } };
      const mockItemPreferredTerminologyServers = { 'item1': 'http://custom.terminology.server' };
      const mockTabs = { 'tab1': { tabIndex: 0, isComplete: false, isHidden: false } };
      const mockPages = { 'page1': { pageIndex: 0, isComplete: false, isHidden: false } };
      const mockLaunchContexts = {} as any;
      const mockTargetConstraints = { 'constraint1': { key: 'constraint1', target: 'target1', severityCode: 'error' as const, valueExpression: { expression: 'test', language: 'text/fhirpath' }, human: 'Test constraint', constraints: [] } };
      const mockVariables = { 
        fhirPathVariables: { 'QuestionnaireLevel': [] }, 
        xFhirQueryVariables: {} 
      };
      const mockContainedValueSetsResult = {
        processedValueSets: { 'vs1': { initialValueSetUrl: 'http://vs1', updatableValueSetUrl: 'http://vs1', bindingParameters: [], isDynamic: false, linkIds: [] } },
        valueSetPromises: {},
        cachedValueSetCodings: { 'vs1': [{ system: 'http://test', code: 'test1', display: 'Test 1' }] }
      };
      const mockOtherExtensionsResult = {
        variables: mockVariables,
        enableWhenItems: { singleItems: { 'item1': { linked: [], isEnabled: false } }, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: { 'item1': { expression: 'test' } }, repeatExpressions: {} },
        calculatedExpressions: { 'item1': [{ expression: 'calc1', from: 'item' as const }] },
        initialExpressions: { 'item1': { expression: 'initial1' } },
        answerExpressions: { 'item1': { expression: 'answer1' } },
        answerOptions: { 'item2': [{ valueString: 'Option 1' }, { valueString: 'Option 2' }] },
        answerOptionsToggleExpressions: {} as any,
        valueSetPromises: {},
        processedValueSets: mockContainedValueSetsResult.processedValueSets,
        cachedValueSetCodings: mockContainedValueSetsResult.cachedValueSetCodings
      };
      const mockResolveValueSetsResult = {
        variables: mockVariables,
        cachedValueSetCodings: { 'vs1': [{ system: 'http://test', code: 'test1', display: 'Test 1 Updated' }] }
      };
      const mockCachedCodingsWithDisplay = { 'vs1': [{ system: 'http://test', code: 'test1', display: 'Test 1 Final' }] };
      const mockCompleteAnswerOptions = { 'item2': [{ valueString: 'Option 1' }, { valueString: 'Option 2' }] };

      mockGetLinkIdPartialItemMap.mockReturnValue(mockItemMap);
      mockGetLinkIdPreferredTerminologyServerTuples.mockReturnValue([['item1', 'http://custom.terminology.server']]);
      mockExtractTabs.mockReturnValue(mockTabs);
      mockExtractPages.mockReturnValue(mockPages);
      mockExtractLaunchContexts.mockReturnValue(mockLaunchContexts);
      mockExtractTargetConstraints.mockReturnValue(mockTargetConstraints);
      mockExtractQuestionnaireLevelVariables.mockReturnValue(mockVariables);
      mockExtractContainedValueSets.mockReturnValue(mockContainedValueSetsResult);
      mockExtractOtherExtensions.mockResolvedValue(mockOtherExtensionsResult);
      mockResolveValueSets.mockResolvedValue(mockResolveValueSetsResult);
      mockAddDisplayToCacheCodings.mockResolvedValue(mockCachedCodingsWithDisplay);
      mockAddDisplayToAnswerOptions.mockResolvedValue(mockCompleteAnswerOptions);

      const result = await createQuestionnaireModel(questionnaire, 'http://terminology.hl7.org/fhir');

      // Verify all extraction functions were called with correct parameters
      expect(mockGetLinkIdPartialItemMap).toHaveBeenCalledWith(questionnaire);
      expect(mockGetLinkIdPreferredTerminologyServerTuples).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractTabs).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractPages).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractLaunchContexts).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractTargetConstraints).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractQuestionnaireLevelVariables).toHaveBeenCalledWith(questionnaire);
      expect(mockExtractContainedValueSets).toHaveBeenCalledWith(questionnaire, 'http://terminology.hl7.org/fhir');
      expect(mockExtractOtherExtensions).toHaveBeenCalledWith(
        questionnaire,
        mockVariables,
        {},
        mockContainedValueSetsResult.processedValueSets,
        mockContainedValueSetsResult.cachedValueSetCodings,
        { 'item1': 'http://custom.terminology.server' },
        'http://terminology.hl7.org/fhir'
      );
      expect(mockResolveValueSets).toHaveBeenCalledWith(
        mockVariables,
        {},
        mockContainedValueSetsResult.cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );
      expect(mockAddDisplayToCacheCodings).toHaveBeenCalledWith(
        mockResolveValueSetsResult.cachedValueSetCodings,
        'http://terminology.hl7.org/fhir'
      );
      expect(mockAddDisplayToAnswerOptions).toHaveBeenCalledWith(
        mockOtherExtensionsResult.answerOptions,
        'http://terminology.hl7.org/fhir'
      );

      // Verify the final result structure
      expect(result).toEqual({
        itemMap: mockItemMap,
        itemPreferredTerminologyServers: { 'item1': 'http://custom.terminology.server' },
        tabs: mockTabs,
        pages: mockPages,
        variables: mockVariables,
        launchContexts: mockLaunchContexts,
        targetConstraints: mockTargetConstraints,
        enableWhenItems: mockOtherExtensionsResult.enableWhenItems,
        enableWhenExpressions: mockOtherExtensionsResult.enableWhenExpressions,
        calculatedExpressions: mockOtherExtensionsResult.calculatedExpressions,
        initialExpressions: mockOtherExtensionsResult.initialExpressions,
        answerExpressions: mockOtherExtensionsResult.answerExpressions,
        answerOptions: mockCompleteAnswerOptions,
        answerOptionsToggleExpressions: {},
        processedValueSets: mockOtherExtensionsResult.processedValueSets,
        cachedValueSetCodings: mockCachedCodingsWithDisplay,
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });
    });

    it('should handle complex questionnaire with all features', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
            extension: [
              { url: 'name', valueId: 'patient' },
              { url: 'type', valueCode: 'Patient' }
            ]
          }
        ],
        contained: [
          {
            resourceType: 'ValueSet',
            id: 'colors',
            url: 'http://example.com/ValueSet/colors',
            status: 'active',
            expansion: {
              timestamp: '2025-01-02T00:00:00Z',
              contains: [
                { system: 'http://example.com/colors', code: 'red', display: 'Red' },
                { system: 'http://example.com/colors', code: 'blue', display: 'Blue' }
              ]
            }
          }
        ],
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Personal Information',
            item: [
              {
                linkId: 'name',
                type: 'string',
                text: 'Full Name',
                required: true
              },
              {
                linkId: 'gender',
                type: 'choice',
                text: 'Gender',
                answerValueSet: '#colors',
                enableWhen: [
                  {
                    question: 'name',
                    operator: 'exists',
                    answerBoolean: true
                  }
                ]
              }
            ]
          }
        ]
      };

      // Setup comprehensive mock returns
      const mockItemMap = {
        'group1': { linkId: 'group1', type: 'group' as const, text: 'Personal Information' },
        'name': { linkId: 'name', type: 'string' as const, text: 'Full Name', required: true },
        'gender': { linkId: 'gender', type: 'choice' as const, text: 'Gender', answerValueSet: '#colors' }
      };
      const mockTabs = { 'tab1': { tabIndex: 0, isComplete: false, isHidden: false } };
      const mockPages = { 'page1': { pageIndex: 0, isComplete: false, isHidden: false } };
      const mockLaunchContexts = {} as any;
      const mockTargetConstraints = {};
      const mockVariables = { 
        fhirPathVariables: { 'QuestionnaireLevel': [] }, 
        xFhirQueryVariables: {} 
      };
      const mockContainedValueSetsResult = {
        processedValueSets: { 
          'colors': { 
            initialValueSetUrl: 'http://example.com/ValueSet/colors', 
            updatableValueSetUrl: 'http://example.com/ValueSet/colors', 
            bindingParameters: [], 
            isDynamic: false, 
            linkIds: ['gender'] 
          } 
        },
        valueSetPromises: {},
        cachedValueSetCodings: { 
          'colors': [
            { system: 'http://example.com/colors', code: 'red', display: 'Red' },
            { system: 'http://example.com/colors', code: 'blue', display: 'Blue' }
          ] 
        }
      };
      const mockOtherExtensionsResult = {
        variables: mockVariables,
        enableWhenItems: { 
          singleItems: { 
            'gender': { 
              linked: [{ enableWhen: { question: 'name', operator: 'exists' as const, answerBoolean: true } }], 
              isEnabled: false 
            } 
          }, 
          repeatItems: {} 
        },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        valueSetPromises: {},
        processedValueSets: mockContainedValueSetsResult.processedValueSets,
        cachedValueSetCodings: mockContainedValueSetsResult.cachedValueSetCodings
      };

      mockGetLinkIdPartialItemMap.mockReturnValue(mockItemMap);
      mockGetLinkIdPreferredTerminologyServerTuples.mockReturnValue([]);
      mockExtractTabs.mockReturnValue(mockTabs);
      mockExtractPages.mockReturnValue(mockPages);
      mockExtractLaunchContexts.mockReturnValue(mockLaunchContexts);
      mockExtractTargetConstraints.mockReturnValue(mockTargetConstraints);
      mockExtractQuestionnaireLevelVariables.mockReturnValue(mockVariables);
      mockExtractContainedValueSets.mockReturnValue(mockContainedValueSetsResult);
      mockExtractOtherExtensions.mockResolvedValue(mockOtherExtensionsResult);
      mockResolveValueSets.mockResolvedValue({
        variables: mockVariables,
        cachedValueSetCodings: mockContainedValueSetsResult.cachedValueSetCodings
      });
      mockAddDisplayToCacheCodings.mockResolvedValue(mockContainedValueSetsResult.cachedValueSetCodings);
      mockAddDisplayToAnswerOptions.mockResolvedValue({});

      const result = await createQuestionnaireModel(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.itemMap).toEqual(mockItemMap);
      expect(result.launchContexts).toEqual({});
      expect(result.enableWhenItems.singleItems).toHaveProperty('gender');
      expect(result.processedValueSets).toHaveProperty('colors');
      expect(result.cachedValueSetCodings).toHaveProperty('colors');
    });

    it('should handle questionnaire with minimal data', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'simple',
            type: 'string',
            text: 'Simple Question'
          }
        ]
      };

      // Setup minimal mock returns
      mockGetLinkIdPartialItemMap.mockReturnValue({ 'simple': { linkId: 'simple', type: 'string' as const, text: 'Simple Question' } });
      mockGetLinkIdPreferredTerminologyServerTuples.mockReturnValue([]);
      mockExtractTabs.mockReturnValue({});
      mockExtractPages.mockReturnValue({});
      mockExtractLaunchContexts.mockReturnValue({});
      mockExtractTargetConstraints.mockReturnValue({});
      mockExtractQuestionnaireLevelVariables.mockReturnValue({ fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} });
      mockExtractContainedValueSets.mockReturnValue({
        processedValueSets: {},
        valueSetPromises: {},
        cachedValueSetCodings: {}
      });
      mockExtractOtherExtensions.mockResolvedValue({
        variables: { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} },
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        valueSetPromises: {},
        processedValueSets: {},
        cachedValueSetCodings: {}
      });
      mockResolveValueSets.mockResolvedValue({
        variables: { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} },
        cachedValueSetCodings: {}
      });
      mockAddDisplayToCacheCodings.mockResolvedValue({});
      mockAddDisplayToAnswerOptions.mockResolvedValue({});

      const result = await createQuestionnaireModel(questionnaire, 'http://terminology.hl7.org/fhir');

      expect(result.itemMap).toEqual({ 'simple': { linkId: 'simple', type: 'string', text: 'Simple Question' } });
      expect(Object.keys(result.tabs)).toHaveLength(0);
      expect(Object.keys(result.pages)).toHaveLength(0);
      expect(Object.keys(result.launchContexts)).toHaveLength(0);
      expect(Object.keys(result.enableWhenItems.singleItems)).toHaveLength(0);
      expect(Object.keys(result.processedValueSets)).toHaveLength(0);
    });

    it('should pass correct terminology server URL to all functions', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Question 1'
          }
        ]
      };

      const customTerminologyServerUrl = 'http://custom.terminology.server/fhir';

      // Setup minimal mocks
      mockGetLinkIdPartialItemMap.mockReturnValue({});
      mockGetLinkIdPreferredTerminologyServerTuples.mockReturnValue([]);
      mockExtractTabs.mockReturnValue({});
      mockExtractPages.mockReturnValue({});
      mockExtractLaunchContexts.mockReturnValue({});
      mockExtractTargetConstraints.mockReturnValue({});
      mockExtractQuestionnaireLevelVariables.mockReturnValue({ fhirPathVariables: {}, xFhirQueryVariables: {} });
      mockExtractContainedValueSets.mockReturnValue({ processedValueSets: {}, valueSetPromises: {}, cachedValueSetCodings: {} });
      mockExtractOtherExtensions.mockResolvedValue({
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        valueSetPromises: {},
        processedValueSets: {},
        cachedValueSetCodings: {}
      });
      mockResolveValueSets.mockResolvedValue({ variables: { fhirPathVariables: {}, xFhirQueryVariables: {} }, cachedValueSetCodings: {} });
      mockAddDisplayToCacheCodings.mockResolvedValue({});
      mockAddDisplayToAnswerOptions.mockResolvedValue({});

      await createQuestionnaireModel(questionnaire, customTerminologyServerUrl);

      // Verify the custom terminology server URL was passed to all relevant functions
      expect(mockExtractContainedValueSets).toHaveBeenCalledWith(questionnaire, customTerminologyServerUrl);
      expect(mockExtractOtherExtensions).toHaveBeenCalledWith(
        questionnaire,
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        customTerminologyServerUrl
      );
      expect(mockResolveValueSets).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Object),
        customTerminologyServerUrl
      );
      expect(mockAddDisplayToCacheCodings).toHaveBeenCalledWith(
        expect.any(Object),
        customTerminologyServerUrl
      );
      expect(mockAddDisplayToAnswerOptions).toHaveBeenCalledWith(
        expect.any(Object),
        customTerminologyServerUrl
      );
    });
  });
});
