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

import { questionnaireStore } from '../../stores/questionnaireStore';
import { questionnaireResponseStore } from '../../stores/questionnaireResponseStore';
import { terminologyServerStore } from '../../stores/terminologyServerStore';
import type { Questionnaire, QuestionnaireResponse, Coding } from 'fhir/r4';
import { emptyQuestionnaire, emptyResponse } from '../../utils/emptyResource';

// Mock all dependencies
jest.mock('../../utils/questionnaireStoreUtils/createQuestionnaireModel');
jest.mock('../../utils/initialise');
jest.mock('../../utils/questionnaireStoreUtils/insertAnswerOptions');
jest.mock('../../utils/targetConstraint');
jest.mock('../../utils/enableWhen');
jest.mock('../../utils/enableWhenExpression');
jest.mock('../../utils/fhirpath');
jest.mock('../../utils/questionnaireResponseStoreUtils/updatableResponseItems');
jest.mock('../../utils/computedUpdates');

import { createQuestionnaireModel } from '../../utils/questionnaireStoreUtils/createQuestionnaireModel';
import { initialiseFormFromResponse } from '../../utils/initialise';
import { insertCompleteAnswerOptionsIntoQuestionnaire } from '../../utils/questionnaireStoreUtils/insertAnswerOptions';
import { readTargetConstraintLocationLinkIds } from '../../utils/targetConstraint';
import {
  updateEnableWhenItemAnswer,
  mutateRepeatEnableWhenItemInstances
} from '../../utils/enableWhen';
import { mutateRepeatEnableWhenExpressionInstances } from '../../utils/enableWhenExpression';
import { evaluateUpdatedExpressions } from '../../utils/fhirpath';
import { createQuestionnaireResponseItemMap } from '../../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { applyComputedUpdates } from '../../utils/computedUpdates';

// Mock the functions
const mockCreateQuestionnaireModel = createQuestionnaireModel as jest.MockedFunction<
  typeof createQuestionnaireModel
>;
const mockInitialiseFormFromResponse = initialiseFormFromResponse as jest.MockedFunction<
  typeof initialiseFormFromResponse
>;
const mockInsertCompleteAnswerOptionsIntoQuestionnaire =
  insertCompleteAnswerOptionsIntoQuestionnaire as jest.MockedFunction<
    typeof insertCompleteAnswerOptionsIntoQuestionnaire
  >;
const mockReadTargetConstraintLocationLinkIds =
  readTargetConstraintLocationLinkIds as jest.MockedFunction<
    typeof readTargetConstraintLocationLinkIds
  >;
const mockUpdateEnableWhenItemAnswer = updateEnableWhenItemAnswer as jest.MockedFunction<
  typeof updateEnableWhenItemAnswer
>;
const mockMutateRepeatEnableWhenItemInstances =
  mutateRepeatEnableWhenItemInstances as jest.MockedFunction<
    typeof mutateRepeatEnableWhenItemInstances
  >;
const mockMutateRepeatEnableWhenExpressionInstances =
  mutateRepeatEnableWhenExpressionInstances as jest.MockedFunction<
    typeof mutateRepeatEnableWhenExpressionInstances
  >;
const mockEvaluateUpdatedExpressions = evaluateUpdatedExpressions as jest.MockedFunction<
  typeof evaluateUpdatedExpressions
>;
const mockCreateQuestionnaireResponseItemMap =
  createQuestionnaireResponseItemMap as jest.MockedFunction<
    typeof createQuestionnaireResponseItemMap
  >;
const mockApplyComputedUpdates = applyComputedUpdates as jest.MockedFunction<
  typeof applyComputedUpdates
>;

describe('questionnaireStore', () => {
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
    questionnaire: 'test-questionnaire',
    item: []
  };

  const mockQuestionnaireModel = {
    itemMap: {
      'test-item': { linkId: 'test-item', type: 'string' as const, text: 'Test Question' }
    },
    itemPreferredTerminologyServers: {},
    tabs: {},
    pages: {},
    variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
    launchContexts: {},
    targetConstraints: {},
    answerOptionsToggleExpressions: {},
    enableWhenItems: { singleItems: {}, repeatItems: {} },
    enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
    calculatedExpressions: {},
    initialExpressions: {},
    answerExpressions: {},
    processedValueSets: {},
    cachedValueSetCodings: {},
    fhirPathContext: {},
    fhirPathTerminologyCache: {},
    answerOptions: {}
  };

  const mockInitialiseFormResult = {
    initialTargetConstraints: {},
    initialEnableWhenItems: { singleItems: {}, repeatItems: {} },
    initialEnableWhenLinkedQuestions: {},
    initialEnableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
    initialCalculatedExpressions: {},
    initialProcessedValueSets: {},
    initialAnswerOptionsToggleExpressions: {},
    firstVisibleTab: 0,
    firstVisiblePage: 0,
    updatedFhirPathContext: {},
    fhirPathTerminologyCache: {}
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockCreateQuestionnaireModel.mockResolvedValue(mockQuestionnaireModel);
    mockInsertCompleteAnswerOptionsIntoQuestionnaire.mockReturnValue(mockQuestionnaire);
    mockInitialiseFormFromResponse.mockResolvedValue(mockInitialiseFormResult);
    mockReadTargetConstraintLocationLinkIds.mockReturnValue({});
    mockUpdateEnableWhenItemAnswer.mockReturnValue({ singleItems: {}, repeatItems: {} });
    mockMutateRepeatEnableWhenItemInstances.mockReturnValue({ singleItems: {}, repeatItems: {} });
    mockMutateRepeatEnableWhenExpressionInstances.mockResolvedValue({
      updatedEnableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      isUpdated: false
    });
    mockEvaluateUpdatedExpressions.mockResolvedValue({
      isUpdated: false,
      updatedTargetConstraints: {},
      updatedAnswerOptionsToggleExpressions: {},
      updatedEnableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      updatedCalculatedExpressions: {},
      updatedProcessedValueSets: {},
      updatedFhirPathContext: {},
      fhirPathTerminologyCache: {},
      computedQRItemUpdates: {}
    });
    mockCreateQuestionnaireResponseItemMap.mockReturnValue({});
    mockApplyComputedUpdates.mockReturnValue(mockQuestionnaireResponse);

    // Reset stores to initial state
    questionnaireStore.setState({
      sourceQuestionnaire: structuredClone(emptyQuestionnaire),
      itemMap: {},
      itemPreferredTerminologyServers: {},
      tabs: {},
      currentTabIndex: 0,
      pages: {},
      currentPageIndex: 0,
      variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
      launchContexts: {},
      targetConstraints: {},
      targetConstraintLinkIds: {},
      answerOptionsToggleExpressions: {},
      calculatedExpressions: {},
      initialExpressions: {},
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      answerExpressions: {},
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenLinkedQuestions: {},
      enableWhenIsActivated: true,
      processedValueSets: {},
      cachedValueSetCodings: {},
      fhirPathContext: {},
      fhirPathTerminologyCache: {},
      populatedContext: {},
      qItemOverrideComponents: {},
      sdcUiOverrideComponents: {},
      focusedLinkId: '',
      readOnly: false
    });

    questionnaireResponseStore.setState({
      updatableResponse: structuredClone(emptyResponse),
      updatableResponseItems: {},
      updateResponse: jest.fn(),
      validateResponse: jest.fn()
    });

    terminologyServerStore.setState({
      url: 'https://test.terminology.server/fhir'
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = questionnaireStore.getState();

      expect(state.sourceQuestionnaire).toEqual(emptyQuestionnaire);
      expect(state.itemMap).toEqual({});
      expect(state.currentTabIndex).toBe(0);
      expect(state.currentPageIndex).toBe(0);
      expect(state.enableWhenIsActivated).toBe(true);
      expect(state.focusedLinkId).toBe('');
      expect(state.readOnly).toBe(false);
    });
  });

  describe('buildSourceQuestionnaire', () => {
    it('should build questionnaire model and initialize form', async () => {
      await questionnaireStore.getState().buildSourceQuestionnaire(mockQuestionnaire);

      expect(mockCreateQuestionnaireModel).toHaveBeenCalledWith(
        mockQuestionnaire,
        'https://test.terminology.server/fhir'
      );
      expect(mockInsertCompleteAnswerOptionsIntoQuestionnaire).toHaveBeenCalledWith(
        mockQuestionnaire,
        {}
      );
      expect(mockInitialiseFormFromResponse).toHaveBeenCalled();
      expect(mockReadTargetConstraintLocationLinkIds).toHaveBeenCalled();

      const state = questionnaireStore.getState();
      expect(state.sourceQuestionnaire).toBe(mockQuestionnaire);
      expect(state.itemMap).toBe(mockQuestionnaireModel.itemMap);
    });

    it('should handle optional parameters', async () => {
      const additionalVariables = { testVar: 'testValue' };
      const terminologyServerUrl = 'https://custom.server/fhir';
      const readOnly = true;
      const qItemOverrideComponents = { 'test-item': jest.fn() };
      const sdcUiOverrideComponents = { 'test-control': jest.fn() };

      await questionnaireStore
        .getState()
        .buildSourceQuestionnaire(
          mockQuestionnaire,
          mockQuestionnaireResponse,
          additionalVariables,
          terminologyServerUrl,
          readOnly,
          qItemOverrideComponents,
          sdcUiOverrideComponents
        );

      expect(mockCreateQuestionnaireModel).toHaveBeenCalledWith(
        mockQuestionnaire,
        terminologyServerUrl
      );

      const state = questionnaireStore.getState();
      expect(state.readOnly).toBe(readOnly);
      expect(state.qItemOverrideComponents).toBe(qItemOverrideComponents);
      expect(state.sdcUiOverrideComponents).toBe(sdcUiOverrideComponents);
    });

    it('should merge additional variables into fhirPathContext', async () => {
      const additionalVariables = { customVar: 'customValue' };
      const existingContext = { existingVar: 'existingValue' };

      questionnaireStore.setState({ fhirPathContext: existingContext });

      mockCreateQuestionnaireModel.mockResolvedValue({
        ...mockQuestionnaireModel,
        fhirPathContext: { modelVar: 'modelValue' }
      } as any);

      await questionnaireStore
        .getState()
        .buildSourceQuestionnaire(mockQuestionnaire, undefined, additionalVariables);

      expect(mockInitialiseFormFromResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          fhirPathContext: {
            existingVar: 'existingValue',
            customVar: 'customValue'
          }
        })
      );
    });
  });

  describe('destroySourceQuestionnaire', () => {
    it('should reset all state to initial values', () => {
      // Set some state to destroy
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire,
        itemMap: { test: { linkId: 'test', type: 'string' } },
        currentTabIndex: 5,
        currentPageIndex: 3,
        focusedLinkId: 'test-item',
        readOnly: true
      });

      questionnaireStore.getState().destroySourceQuestionnaire();

      const state = questionnaireStore.getState();
      expect(state.sourceQuestionnaire).toEqual(emptyQuestionnaire);
      expect(state.itemMap).toEqual({});
      expect(state.currentTabIndex).toBe(0);
      expect(state.currentPageIndex).toBe(0);
      // focusedLinkId and readOnly are not reset by destroySourceQuestionnaire
      expect(state.focusedLinkId).toBe('test-item'); // unchanged
      expect(state.readOnly).toBe(true); // unchanged
    });
  });

  describe('tab navigation', () => {
    describe('switchTab', () => {
      it('should update current tab index', () => {
        questionnaireStore.getState().switchTab(3);
        expect(questionnaireStore.getState().currentTabIndex).toBe(3);
      });
    });

    describe('markTabAsComplete', () => {
      it('should toggle tab completion status', () => {
        const tabs = {
          tab1: { linkId: 'tab1', label: 'Tab 1', isComplete: false, tabIndex: 0, isHidden: false },
          tab2: { linkId: 'tab2', label: 'Tab 2', isComplete: true, tabIndex: 1, isHidden: false }
        };

        questionnaireStore.setState({ tabs });

        questionnaireStore.getState().markTabAsComplete('tab1');
        expect(questionnaireStore.getState().tabs['tab1'].isComplete).toBe(true);

        questionnaireStore.getState().markTabAsComplete('tab2');
        expect(questionnaireStore.getState().tabs['tab2'].isComplete).toBe(false);
      });
    });
  });

  describe('page navigation', () => {
    describe('switchPage', () => {
      it('should update current page index', () => {
        questionnaireStore.getState().switchPage(2);
        expect(questionnaireStore.getState().currentPageIndex).toBe(2);
      });
    });

    describe('markPageAsComplete', () => {
      it('should toggle page completion status', () => {
        const pages = {
          page1: {
            linkId: 'page1',
            label: 'Page 1',
            isComplete: false,
            pageIndex: 0,
            isHidden: false
          },
          page2: {
            linkId: 'page2',
            label: 'Page 2',
            isComplete: true,
            pageIndex: 1,
            isHidden: false
          }
        };

        questionnaireStore.setState({ pages });

        questionnaireStore.getState().markPageAsComplete('page1');
        expect(questionnaireStore.getState().pages['page1'].isComplete).toBe(true);

        questionnaireStore.getState().markPageAsComplete('page2');
        expect(questionnaireStore.getState().pages['page2'].isComplete).toBe(false);
      });
    });
  });

  describe('enableWhen functionality', () => {
    describe('updateEnableWhenItem', () => {
      it('should update enableWhen items when linked questions exist', () => {
        const enableWhenLinkedQuestions = { 'source-item': ['target-item'] };
        const enableWhenItems = { singleItems: {}, repeatItems: {} };
        const newAnswer = [{ valueString: 'test' }];

        questionnaireStore.setState({
          enableWhenLinkedQuestions,
          enableWhenItems
        });

        const updatedItems = {
          singleItems: {
            'target-item': {
              isEnabled: true,
              enableWhenStates: {},
              linked: []
            }
          },
          repeatItems: {}
        };
        mockUpdateEnableWhenItemAnswer.mockReturnValue(updatedItems);

        questionnaireStore.getState().updateEnableWhenItem('source-item', newAnswer, null);

        expect(mockUpdateEnableWhenItemAnswer).toHaveBeenCalledWith(
          enableWhenItems,
          ['target-item'],
          'source-item',
          newAnswer,
          null
        );
        expect(questionnaireStore.getState().enableWhenItems).toBe(updatedItems);
      });

      it('should not update when no linked questions exist', () => {
        questionnaireStore.setState({
          enableWhenLinkedQuestions: {},
          enableWhenItems: { singleItems: {}, repeatItems: {} }
        });

        questionnaireStore.getState().updateEnableWhenItem('non-existent', [], null);

        expect(mockUpdateEnableWhenItemAnswer).not.toHaveBeenCalled();
      });
    });

    describe('mutateRepeatEnableWhenItems', () => {
      it('should mutate repeat enableWhen items and expressions', async () => {
        const enableWhenItems = { singleItems: {}, repeatItems: {} };
        const enableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

        questionnaireStore.setState({
          enableWhenItems,
          enableWhenExpressions,
          variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
          fhirPathContext: {},
          fhirPathTerminologyCache: {}
        });

        const updatedItems = {
          singleItems: {},
          repeatItems: {
            'repeat-group': {
              linked: [],
              parentLinkId: 'repeat-group',
              enabledIndexes: [true]
            }
          }
        };
        const updatedExpressions = {
          singleExpressions: {},
          repeatExpressions: {
            'repeat-group': {
              expression: 'true',
              parentLinkId: 'repeat-group',
              enabledIndexes: [true]
            }
          }
        };

        mockMutateRepeatEnableWhenItemInstances.mockReturnValue(updatedItems);
        mockMutateRepeatEnableWhenExpressionInstances.mockResolvedValue({
          updatedEnableWhenExpressions: updatedExpressions,
          isUpdated: true
        });

        await questionnaireStore.getState().mutateRepeatEnableWhenItems('repeat-group', 0, 'add');

        expect(mockMutateRepeatEnableWhenItemInstances).toHaveBeenCalledWith(
          enableWhenItems,
          'repeat-group',
          0,
          'add'
        );
        expect(mockMutateRepeatEnableWhenExpressionInstances).toHaveBeenCalled();

        const state = questionnaireStore.getState();
        expect(state.enableWhenItems).toBe(updatedItems);
        expect(state.enableWhenExpressions).toBe(updatedExpressions);
      });

      it('should not update state when expressions are not updated', async () => {
        const originalItems = { singleItems: {}, repeatItems: {} };
        const originalExpressions = { singleExpressions: {}, repeatExpressions: {} };

        questionnaireStore.setState({
          enableWhenItems: originalItems,
          enableWhenExpressions: originalExpressions
        });

        mockMutateRepeatEnableWhenExpressionInstances.mockResolvedValue({
          updatedEnableWhenExpressions: originalExpressions,
          isUpdated: false
        });

        await questionnaireStore
          .getState()
          .mutateRepeatEnableWhenItems('repeat-group', 0, 'remove');

        const state = questionnaireStore.getState();
        expect(state.enableWhenItems).toBe(originalItems);
        expect(state.enableWhenExpressions).toBe(originalExpressions);
      });
    });

    describe('toggleEnableWhenActivation', () => {
      it('should toggle enableWhen activation', () => {
        expect(questionnaireStore.getState().enableWhenIsActivated).toBe(true);

        questionnaireStore.getState().toggleEnableWhenActivation(false);
        expect(questionnaireStore.getState().enableWhenIsActivated).toBe(false);

        questionnaireStore.getState().toggleEnableWhenActivation(true);
        expect(questionnaireStore.getState().enableWhenIsActivated).toBe(true);
      });
    });
  });

  describe('updateExpressions', () => {
    beforeEach(() => {
      questionnaireStore.setState({
        sourceQuestionnaire: mockQuestionnaire,
        targetConstraints: {},
        answerOptionsToggleExpressions: {},
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        processedValueSets: {},
        variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
        fhirPathContext: {},
        fhirPathTerminologyCache: {}
      });

      questionnaireResponseStore.setState({
        updateResponse: jest.fn(),
        validateResponse: jest.fn()
      });
    });

    it('should evaluate expressions and update state when updated', async () => {
      const updatedResponse = structuredClone(mockQuestionnaireResponse);
      const mockEvaluationResult = {
        isUpdated: true,
        updatedTargetConstraints: {
          constraint1: {
            key: 'constraint1',
            severityCode: 'error' as const,
            valueExpression: { expression: 'true', language: 'text/fhirpath' },
            human: 'Test constraint'
          }
        },
        updatedAnswerOptionsToggleExpressions: { item1: [] },
        updatedEnableWhenExpressions: {
          singleExpressions: {
            item1: {
              expression: 'true',
              isEnabled: true
            }
          },
          repeatExpressions: {}
        },
        updatedCalculatedExpressions: { item1: [] },
        updatedProcessedValueSets: { valueset1: { codings: [] } },
        updatedFhirPathContext: { var1: 'value1' },
        fhirPathTerminologyCache: { cache1: 'cached' },
        computedQRItemUpdates: {}
      };

      mockEvaluateUpdatedExpressions.mockResolvedValue(mockEvaluationResult);

      await questionnaireStore.getState().updateExpressions(updatedResponse);

      expect(mockEvaluateUpdatedExpressions).toHaveBeenCalled();
      expect(questionnaireResponseStore.getState().validateResponse).toHaveBeenCalledWith(
        mockQuestionnaire,
        updatedResponse
      );

      const state = questionnaireStore.getState();
      expect(state.targetConstraints).toBe(mockEvaluationResult.updatedTargetConstraints);
      expect(state.enableWhenExpressions).toBe(mockEvaluationResult.updatedEnableWhenExpressions);
      expect(state.fhirPathContext).toBe(mockEvaluationResult.updatedFhirPathContext);
    });

    it('should apply computed updates when they exist', async () => {
      const updatedResponse = structuredClone(mockQuestionnaireResponse);
      const computedUpdates = { item1: { linkId: 'item1', answer: [{ valueString: 'computed' }] } };
      const appliedResponse = {
        ...updatedResponse,
        item: [{ linkId: 'item1', answer: [{ valueString: 'computed' }] }]
      };

      mockEvaluateUpdatedExpressions.mockResolvedValue({
        isUpdated: true,
        updatedTargetConstraints: {},
        updatedAnswerOptionsToggleExpressions: {},
        updatedEnableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        updatedCalculatedExpressions: {},
        updatedProcessedValueSets: {},
        updatedFhirPathContext: {},
        fhirPathTerminologyCache: {},
        computedQRItemUpdates: computedUpdates
      });

      mockApplyComputedUpdates.mockReturnValue(appliedResponse);

      await questionnaireStore.getState().updateExpressions(updatedResponse);

      expect(mockApplyComputedUpdates).toHaveBeenCalledWith(
        mockQuestionnaire,
        updatedResponse,
        computedUpdates
      );
      expect(questionnaireResponseStore.getState().updateResponse).toHaveBeenCalledWith(
        appliedResponse,
        'async'
      );
    });

    it('should only update context when expressions are not updated', async () => {
      const updatedResponse = structuredClone(mockQuestionnaireResponse);
      const mockEvaluationResult = {
        isUpdated: false,
        updatedTargetConstraints: {},
        updatedAnswerOptionsToggleExpressions: {},
        updatedEnableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        updatedCalculatedExpressions: {},
        updatedProcessedValueSets: {},
        updatedFhirPathContext: { var1: 'value1' },
        fhirPathTerminologyCache: { cache1: 'cached' },
        computedQRItemUpdates: {}
      };

      mockEvaluateUpdatedExpressions.mockResolvedValue(mockEvaluationResult);

      await questionnaireStore.getState().updateExpressions(updatedResponse);

      expect(questionnaireResponseStore.getState().validateResponse).not.toHaveBeenCalled();

      const state = questionnaireStore.getState();
      expect(state.fhirPathContext).toBe(mockEvaluationResult.updatedFhirPathContext);
      expect(state.fhirPathTerminologyCache).toBe(mockEvaluationResult.fhirPathTerminologyCache);
    });
  });

  describe('addCodingToCache', () => {
    it('should add codings to the cache', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const codings: Coding[] = [{ system: 'http://example.com', code: 'test', display: 'Test' }];

      questionnaireStore.getState().addCodingToCache(valueSetUrl, codings);

      const state = questionnaireStore.getState();
      expect(state.cachedValueSetCodings[valueSetUrl]).toBe(codings);
    });

    it('should replace existing codings in cache', () => {
      const valueSetUrl = 'http://example.com/valueset';
      const firstCodings: Coding[] = [
        { system: 'http://example.com', code: 'first', display: 'First' }
      ];
      const secondCodings: Coding[] = [
        { system: 'http://example.com', code: 'second', display: 'Second' }
      ];

      questionnaireStore.getState().addCodingToCache(valueSetUrl, firstCodings);
      questionnaireStore.getState().addCodingToCache(valueSetUrl, secondCodings);

      const state = questionnaireStore.getState();
      expect(state.cachedValueSetCodings[valueSetUrl]).toBe(secondCodings);
    });
  });

  describe('onFocusLinkId', () => {
    it('should set the focused linkId', () => {
      questionnaireStore.getState().onFocusLinkId('test-item');
      expect(questionnaireStore.getState().focusedLinkId).toBe('test-item');
    });
  });

  describe('setPopulatedContext', () => {
    it('should set populated context without adding to fhirPathContext', () => {
      const newContext = { testVar: 'testValue' };

      questionnaireStore.getState().setPopulatedContext(newContext);

      const state = questionnaireStore.getState();
      expect(state.populatedContext).toBe(newContext);
      expect(state.fhirPathContext).toEqual({});
    });

    it('should set populated context and add to fhirPathContext', () => {
      const existingFhirPathContext = { existingVar: 'existingValue' };
      const newContext = { testVar: 'testValue' };

      questionnaireStore.setState({ fhirPathContext: existingFhirPathContext });
      questionnaireStore.getState().setPopulatedContext(newContext, true);

      const state = questionnaireStore.getState();
      expect(state.populatedContext).toBe(newContext);
      expect(state.fhirPathContext).toEqual({
        existingVar: 'existingValue',
        testVar: 'testValue'
      });
    });
  });

  describe('setFormAsReadOnly', () => {
    it('should set readOnly flag', () => {
      expect(questionnaireStore.getState().readOnly).toBe(false);

      questionnaireStore.getState().setFormAsReadOnly(true);
      expect(questionnaireStore.getState().readOnly).toBe(true);

      questionnaireStore.getState().setFormAsReadOnly(false);
      expect(questionnaireStore.getState().readOnly).toBe(false);
    });
  });

  describe('store subscription', () => {
    it('should notify subscribers when state changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = questionnaireStore.subscribe(mockSubscriber);

      questionnaireStore.getState().switchTab(1);

      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('error handling', () => {
    it('should handle errors in buildSourceQuestionnaire', async () => {
      mockCreateQuestionnaireModel.mockRejectedValue(new Error('Model creation failed'));

      await expect(
        questionnaireStore.getState().buildSourceQuestionnaire(mockQuestionnaire)
      ).rejects.toThrow('Model creation failed');
    });

    it('should handle errors in updateExpressions', async () => {
      mockEvaluateUpdatedExpressions.mockRejectedValue(new Error('Expression evaluation failed'));

      await expect(
        questionnaireStore.getState().updateExpressions(mockQuestionnaireResponse)
      ).rejects.toThrow('Expression evaluation failed');
    });
  });
});
