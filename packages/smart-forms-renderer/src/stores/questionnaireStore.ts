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

import type {
  Coding,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { ComponentType } from 'react';
import { createStore } from 'zustand/vanilla';
import type { QItemOverrideComponentProps, SdcUiOverrideComponentProps } from '../interfaces';
import type { AnswerExpression } from '../interfaces/answerExpression.interface';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { InitialExpression } from '../interfaces/initialExpression.interface';
import type { Pages } from '../interfaces/page.interface';
import type { LaunchContext } from '../interfaces/populate.interface';
import type { Tabs } from '../interfaces/tab.interface';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import type { Variables } from '../interfaces/variables.interface';
import { processCalculatedExpressions } from '../utils/calculatedExpression';
import { applyComputedUpdates } from '../utils/computedUpdates';
import {
  mutateRepeatEnableWhenItemInstances,
  updateEnableWhenItemAnswer
} from '../utils/enableWhen';
import { emptyQuestionnaire, emptyResponse } from '../utils/emptyResource';
import { mutateRepeatEnableWhenExpressionInstances } from '../utils/enableWhenExpression';
import { evaluateOtherExpressions } from '../utils/fhirpath';
import { initialiseFormFromResponse } from '../utils/initialise';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { insertCompleteAnswerOptionsIntoQuestionnaire } from '../utils/questionnaireStoreUtils/insertAnswerOptions';
import { readTargetConstraintLocationLinkIds } from '../utils/targetConstraint';
import { questionnaireResponseStore } from './questionnaireResponseStore';
import { createSelectors } from './selector';
import { terminologyServerStore } from './terminologyServerStore';
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionnaireModel';
import { getFirstVisibleTab } from '../utils/tabs';
import { getFirstVisiblePage } from '../utils/page';

/**
 * QuestionnaireStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, using them from an external source is not recommended.
 *
 * @property sourceQuestionnaire - FHIR R4 Questionnaire to render
 * @property itemMap - Key-value pair of item types `Record<linkId, { linkId, QuestionnaireItem (without qItem.item) }>`
 * @property itemPreferredTerminologyServers - Key-value pair of item types `Record<linkId, preferred terminology servers>`
 * @property tabs - Key-value pair of tabs `Record<linkId, Tab>`
 * @property currentTabIndex - Index of the current tab
 * @property pages - Key-value pair of pages `Record<linkId, Page>`
 * @property currentPageIndex - Index of the current page
 * @property variables - Questionnaire variables object containing FHIRPath and x-fhir-query variables
 * @property launchContexts - Key-value pair of launch contexts `Record<launch context name, launch context properties>`
 * @property initialExpressions - Key-value pair of initial expressions `Record<linkId, InitialExpression>`
 * @property answerExpressions - Key-value pair of answer expressions `Record<linkId, answer expression properties>`
 * @property calculatedExpressions - Key-value pair of calculated expressions `Record<linkId, array of calculated expression properties>`
 * @property targetConstraints - Key-value pair of target constraints `Record<target constraint key, target constraint properties>`
 * @property targetConstraintLinkIds - Key-value pair of linkIds against target constraint key(s) `Record<linkId, target constraint keys>`
 * @property answerOptionsToggleExpressions - Key-value pair of answer options toggle expressions `Record<linkId, array of answer options toggle expressions>`
 * @property enableWhenItems - EnableWhenItems object containing enableWhen items and their linked questions
 * @property enableWhenLinkedQuestions - Key-value pair of linked questions to enableWhen items `Record<linkId, linkIds of linked questions>`
 * @property enableWhenIsActivated - Flag to turn enableWhen checks on/off
 * @property enableWhenExpressions - EnableWhenExpressions object containing enableWhen expressions
 * @property processedValueSets - Key-value pair of (pre-)processed value set codings `Record<valueSetUrl, ProcessedValueSet>`
 * @property cachedValueSetCodings - Key-value pair of cached value set codings `Record<valueSetUrl, codings>`
 * @property fhirPathContext - Key-value pair of evaluated FHIRPath values `Record<variable name, evaluated value(s)>`
 * @property fhirPathTerminologyCache - Key-value pair of cached FHIRPath Terminology results `Record<cacheKey, cached terminology result>`
 * @property additionalContext - Key-value pair of additional/pre-populated FHIRPath values `Record<variable/launchContext/sourceQueries batch name, evaluated value(s)>`
 * @property qItemOverrideComponents - Key-value pair of React component overrides for Questionnaire Items via linkId `Record<linkId, React component>`
 * @property sdcUiOverrideComponents - Key-value pair of React component overrides for SDC UI Controls https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html `Record<SDC UI code, React component>`
 * @property focusedLinkId - LinkId of the currently focused item
 * @property readOnly - Flag to set the form to read-only mode
 * @property buildSourceQuestionnaire - Used to build the source questionnaire with the provided questionnaire and optionally questionnaire response, additional variables, terminology server url and readyOnly flag
 * @property destroySourceQuestionnaire - Used to destroy the source questionnaire and reset all properties
 * @property switchTab - Used to switch the current tab index
 * @property switchPage - Used to switch the current page index
 * @property markTabAsComplete - Used to mark a tab index as complete
 * @property markPageAsComplete - Used to mark a page index as complete
 * @property resetToFirstVisibleTab - Used to reset the current tab to the first visible tab
 * @property resetToFirstVisiblePage - Used to reset the current page to the first visible page
 * @property updateEnableWhenItem - Used to update linked enableWhen items by updating a question with a new answer
 * @property mutateRepeatEnableWhenItems - Used to add or remove instances of repeating enableWhen items
 * @property toggleEnableWhenActivation - Used to toggle enableWhen checks on/off
 * @property updateExpressions - Used to update all SDC expressions based on the updated questionnaire response, initialUpdate flag is to ensure formChangesHistory is not updated during the first update after form build
 * @property addCodingToCache - Used to add a coding to the cached value set codings
 * @property onFocusLinkId - Used to set the focused linkId
 * @property setAdditionalContext - Optionally used to set additional context information for FHIRPath eval. Useful to pass pre-populated context into the renderer. If you are rebuilding the form on pre-populate, you don't need to use this. pass `additionalContext` directly into buildForm().
 * @property setFormAsReadOnly - Used to set the form as read-only
 *
 * @author Sean Fong
 */
export interface QuestionnaireStoreType {
  sourceQuestionnaire: Questionnaire;
  itemMap: Record<string, Omit<QuestionnaireItem, 'item'>>;
  itemPreferredTerminologyServers: Record<string, string>;
  tabs: Tabs;
  currentTabIndex: number;
  pages: Pages;
  currentPageIndex: number;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  targetConstraints: Record<string, TargetConstraint>;
  targetConstraintLinkIds: Record<string, string[]>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: EnableWhenExpressions;
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  processedValueSets: Record<string, ProcessedValueSet>;
  cachedValueSetCodings: Record<string, Coding[]>;
  fhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  additionalContext: Record<string, any>;
  qItemOverrideComponents: Record<string, ComponentType<QItemOverrideComponentProps>>;
  sdcUiOverrideComponents: Record<string, ComponentType<SdcUiOverrideComponentProps>>;
  focusedLinkId: string;
  readOnly: boolean;
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    additionalContext?: Record<string, any>,
    terminologyServerUrl?: string,
    readOnly?: boolean,
    qItemOverrideComponents?: Record<string, ComponentType<QItemOverrideComponentProps>>,
    sdcUiOverrideComponents?: Record<string, ComponentType<SdcUiOverrideComponentProps>>
  ) => Promise<void>;
  destroySourceQuestionnaire: () => void;
  switchTab: (newTabIndex: number) => void;
  switchPage: (newPageIndex: number) => void;
  markTabAsComplete: (tabLinkId: string) => void;
  markPageAsComplete: (pageLinkId: string) => void;
  resetToFirstVisibleTab: () => void;
  resetToFirstVisiblePage: () => void;
  updateEnableWhenItem: (
    linkId: string,
    newAnswer: QuestionnaireResponseItemAnswer[] | undefined,
    parentRepeatGroupIndex: number | null
  ) => void;
  mutateRepeatEnableWhenItems: (
    parentRepeatGroupLinkId: string,
    parentRepeatGroupIndex: number,
    actionType: 'add' | 'remove'
  ) => void;
  toggleEnableWhenActivation: (isActivated: boolean) => void;
  updateExpressions: (
    updatedResponse: QuestionnaireResponse,
    isInitialUpdate: boolean
  ) => Promise<void>;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  onFocusLinkId: (linkId: string) => void;
  setAdditionalContext: (additionalContext: Record<string, any>) => void;
  setFormAsReadOnly: (readOnly: boolean) => void;
}

/**
 * Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire.
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see {@link QuestionnaireStoreType} for available properties and methods.
 *
 * @author Sean Fong
 */
export const questionnaireStore = createStore<QuestionnaireStoreType>()((set, get) => ({
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
  additionalContext: {},
  qItemOverrideComponents: {},
  sdcUiOverrideComponents: {},
  focusedLinkId: '',
  readOnly: false,
  buildSourceQuestionnaire: async (
    questionnaire,
    questionnaireResponse = structuredClone(emptyResponse),
    additionalContext = {},
    terminologyServerUrl = terminologyServerStore.getState().url,
    readOnly = false,
    qItemOverrideComponents = {},
    sdcUiOverrideComponents = {}
  ) => {
    const questionnaireModel = await createQuestionnaireModel(questionnaire, terminologyServerUrl);

    // Insert answerOptions with displays into questionnaire
    questionnaire = insertCompleteAnswerOptionsIntoQuestionnaire(
      questionnaire,
      questionnaireModel.answerOptions
    );

    // Initialise form with questionnaire response and properties in questionnaire model
    const {
      initialTargetConstraints,
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      initialCalculatedExpressions,
      initialProcessedValueSets,
      initialAnswerOptionsToggleExpressions,
      firstVisibleTab,
      firstVisiblePage,
      updatedFhirPathContext,
      fhirPathTerminologyCache: updatedFhirPathTerminologyCache
    } = await initialiseFormFromResponse({
      sourceQuestionnaire: questionnaire,
      questionnaireResponse,
      targetConstraints: questionnaireModel.targetConstraints,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      answerOptionsToggleExpressions: questionnaireModel.answerOptionsToggleExpressions,
      variables: questionnaireModel.variables,
      processedValueSets: questionnaireModel.processedValueSets,
      tabs: questionnaireModel.tabs,
      pages: questionnaireModel.pages,
      fhirPathContext: questionnaireModel.fhirPathContext,
      fhirPathTerminologyCache: questionnaireModel.fhirPathTerminologyCache,
      terminologyServerUrl: terminologyServerUrl
    });

    // Read target constraint locations
    const targetConstraintLinkIds = readTargetConstraintLocationLinkIds(
      questionnaire,
      initialTargetConstraints
    );

    const finalFhirPathContext = { ...updatedFhirPathContext, ...additionalContext };

    set({
      sourceQuestionnaire: questionnaire,
      itemMap: questionnaireModel.itemMap,
      itemPreferredTerminologyServers: questionnaireModel.itemPreferredTerminologyServers,
      tabs: questionnaireModel.tabs,
      currentTabIndex: firstVisibleTab,
      pages: questionnaireModel.pages,
      currentPageIndex: firstVisiblePage,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      targetConstraints: initialTargetConstraints,
      targetConstraintLinkIds: targetConstraintLinkIds,
      answerOptionsToggleExpressions: initialAnswerOptionsToggleExpressions,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      initialExpressions: questionnaireModel.initialExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSets: initialProcessedValueSets,
      cachedValueSetCodings: questionnaireModel.cachedValueSetCodings,
      fhirPathContext: finalFhirPathContext,
      fhirPathTerminologyCache: updatedFhirPathTerminologyCache,
      additionalContext: additionalContext,
      qItemOverrideComponents: qItemOverrideComponents,
      sdcUiOverrideComponents: sdcUiOverrideComponents,
      readOnly: readOnly
    });
  },
  destroySourceQuestionnaire: () =>
    set({
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
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenLinkedQuestions: {},
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      calculatedExpressions: {},
      initialExpressions: {},
      answerExpressions: {},
      processedValueSets: {},
      fhirPathContext: {},
      fhirPathTerminologyCache: {},
      qItemOverrideComponents: {},
      sdcUiOverrideComponents: {}
    }),
  switchTab: (newTabIndex: number) => set(() => ({ currentTabIndex: newTabIndex })),
  switchPage: (newPageIndex: number) => set(() => ({ currentPageIndex: newPageIndex })),
  markTabAsComplete: (tabLinkId: string) => {
    const tabs = get().tabs;
    set(() => ({
      tabs: {
        ...tabs,
        [tabLinkId]: { ...tabs[tabLinkId], isComplete: !tabs[tabLinkId].isComplete }
      }
    }));
  },
  markPageAsComplete: (pageLinkId: string) => {
    const pages = get().pages;
    set(() => ({
      pages: {
        ...pages,
        [pageLinkId]: { ...pages[pageLinkId], isComplete: !pages[pageLinkId].isComplete }
      }
    }));
  },
  resetToFirstVisibleTab: () => {
    const tabs = get().tabs;
    const enableWhenItems = get().enableWhenItems;
    const enableWhenExpressions = get().enableWhenExpressions;
    const firstVisibleTab =
      Object.keys(tabs).length > 0
        ? getFirstVisibleTab(tabs, enableWhenItems, enableWhenExpressions)
        : 0;

    set(() => ({ currentTabIndex: firstVisibleTab }));
  },
  resetToFirstVisiblePage: () => {
    const pages = get().pages;
    const enableWhenItems = get().enableWhenItems;
    const enableWhenExpressions = get().enableWhenExpressions;
    const firstVisiblePage =
      Object.keys(pages).length > 0
        ? getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions)
        : 0;
    set(() => ({ currentPageIndex: firstVisiblePage }));
  },
  updateEnableWhenItem: (
    linkId: string,
    newAnswer: QuestionnaireResponseItemAnswer[] | undefined,
    parentRepeatGroupIndex: number | null
  ) => {
    const enableWhenLinkedQuestions = get().enableWhenLinkedQuestions;
    const enableWhenItems = get().enableWhenItems;
    if (!enableWhenLinkedQuestions[linkId]) {
      return;
    }

    const itemLinkedQuestions = enableWhenLinkedQuestions[linkId];
    const updatedEnableWhenItems = updateEnableWhenItemAnswer(
      { ...enableWhenItems },
      itemLinkedQuestions,
      linkId,
      newAnswer,
      parentRepeatGroupIndex
    );

    set(() => ({
      enableWhenItems: updatedEnableWhenItems
    }));
  },
  mutateRepeatEnableWhenItems: async (
    parentRepeatGroupLinkId: string,
    parentRepeatGroupIndex: number,
    actionType: 'add' | 'remove'
  ) => {
    const enableWhenItems = get().enableWhenItems;
    const enableWhenExpressions = get().enableWhenExpressions;

    const updatedEnableWhenItems = mutateRepeatEnableWhenItemInstances(
      {
        ...enableWhenItems
      },
      parentRepeatGroupLinkId,
      parentRepeatGroupIndex,
      actionType
    );

    const { updatedEnableWhenExpressions, isUpdated } =
      await mutateRepeatEnableWhenExpressionInstances({
        questionnaireResponse: questionnaireResponseStore.getState().updatableResponse,
        questionnaireResponseItemMap: questionnaireResponseStore.getState().updatableResponseItems,
        variables: get().variables,
        existingFhirPathContext: get().fhirPathContext,
        fhirPathTerminologyCache: get().fhirPathTerminologyCache,
        enableWhenExpressions: enableWhenExpressions,
        parentRepeatGroupLinkId,
        parentRepeatGroupIndex,
        actionType,
        terminologyServerUrl: terminologyServerStore.getState().url
      });

    if (isUpdated) {
      set(() => ({
        enableWhenItems: updatedEnableWhenItems,
        enableWhenExpressions: updatedEnableWhenExpressions
      }));
    }
  },
  toggleEnableWhenActivation: (isActivated: boolean) =>
    set(() => ({ enableWhenIsActivated: isActivated })),
  updateExpressions: async (updatedResponse: QuestionnaireResponse, isInitialUpdate: boolean) => {
    /* Expression evaluation and application workflow
    1. Evaluate calculatedExpressions to update answers in the QuestionnaireResponse.
       - This must happen first, as these answers may affect subsequent expressions.
       - Call updateResponse() once before proceeding to the next steps.

    2. Evaluate other expressions using the QR with updated calculated answers.
       - Target constraints
       - Enable when expressions
       - Answer options toggle expressions
       - Dynamic valueSets (e.g. parameterised valueSets)

    3. Apply computed updates from answerOptionsToggleExpressions and updated Dynamic ValueSets into the QuestionnaireResponse.

    4. Re-run calculatedExpressions as a final step to ensure all calculations are up-to-date, incorporating any toggled options or dynamic value set changes.
    5. Update store state based on the expressions that changed
    */

    const {
      sourceQuestionnaire,
      itemMap,
      itemPreferredTerminologyServers,
      variables,
      targetConstraints,
      answerOptionsToggleExpressions,
      enableWhenExpressions,
      processedValueSets,
      calculatedExpressions,
      fhirPathContext,
      fhirPathTerminologyCache
    } = get();
    const updateResponse = questionnaireResponseStore.getState().updateResponse;
    const validateResponse = questionnaireResponseStore.getState().validateResponse;
    const defaultTerminologyServerUrl = terminologyServerStore.getState().url;

    // Helper function to extract common state update logic
    function updateStoreState(
      updatedResponse: QuestionnaireResponse,
      calculatedExpressions: Record<string, CalculatedExpression[]>,
      fhirPathContext: Record<string, unknown>,
      fhirPathTerminologyCache: Record<string, unknown>,
      otherExpressions?: {
        targetConstraints?: Record<string, TargetConstraint>;
        enableWhenExpressions?: EnableWhenExpressions;
        answerOptionsToggleExpressions?: Record<string, AnswerOptionsToggleExpression[]>;
        processedValueSets?: Record<string, ProcessedValueSet>;
      }
    ) {
      // Update QuestionnaireStore state
      set(() => ({
        calculatedExpressions,
        fhirPathContext,
        fhirPathTerminologyCache,
        ...(otherExpressions?.targetConstraints && {
          targetConstraints: otherExpressions.targetConstraints
        }),
        ...(otherExpressions?.enableWhenExpressions && {
          enableWhenExpressions: otherExpressions.enableWhenExpressions
        }),
        ...(otherExpressions?.answerOptionsToggleExpressions && {
          answerOptionsToggleExpressions: otherExpressions.answerOptionsToggleExpressions
        }),
        ...(otherExpressions?.processedValueSets && {
          processedValueSets: otherExpressions.processedValueSets
        })
      }));

      // Final validation
      validateResponse(sourceQuestionnaire, updatedResponse);
    }

    // Step 1: Process calculated expressions first
    let {
      updatedResponse: lastUpdatedResponse,
      updatedCalculatedExpressions: updatedCalculatedExpressions
    } = await processCalculatedExpressions(
      sourceQuestionnaire,
      updatedResponse,
      itemMap,
      calculatedExpressions,
      variables,
      fhirPathContext,
      fhirPathTerminologyCache,
      itemPreferredTerminologyServers,
      defaultTerminologyServerUrl
    );

    // Perform an immediate QR update first, then process other expressions asynchronously
    updateResponse(lastUpdatedResponse, isInitialUpdate);

    // Step 2: Evaluate other expressions
    const updatedResponseItemMap = createQuestionnaireResponseItemMap(
      sourceQuestionnaire,
      lastUpdatedResponse
    );
    const {
      updatedFhirPathContext,
      updatedFhirPathTerminologyCache,
      targetConstraintsUpdate,
      enableWhenExpressionsUpdate,
      answerOptionsToggleExpressionsUpdate,
      processedValueSetsUpdate,
      computedQRItemUpdates
    } = await evaluateOtherExpressions(
      lastUpdatedResponse,
      updatedResponseItemMap,
      variables,
      fhirPathContext,
      fhirPathTerminologyCache,
      targetConstraints,
      enableWhenExpressions,
      answerOptionsToggleExpressions,
      processedValueSets,
      defaultTerminologyServerUrl
    );

    /* Step 3 & 4: Handle computed updates and re-run calculations if needed */
    if (Object.keys(computedQRItemUpdates).length > 0) {
      lastUpdatedResponse = applyComputedUpdates(
        sourceQuestionnaire,
        lastUpdatedResponse,
        computedQRItemUpdates
      );

      // Re-run calculated expressions with the updated response
      const finalCalculatedResult = await processCalculatedExpressions(
        sourceQuestionnaire,
        lastUpdatedResponse,
        itemMap,
        updatedCalculatedExpressions,
        variables,
        updatedFhirPathContext,
        updatedFhirPathTerminologyCache,
        itemPreferredTerminologyServers,
        defaultTerminologyServerUrl
      );

      lastUpdatedResponse = finalCalculatedResult.updatedResponse;
      updatedCalculatedExpressions = finalCalculatedResult.updatedCalculatedExpressions;
      updateResponse(lastUpdatedResponse, isInitialUpdate);
    }

    /* Step 5: Update store state based on the expressions that changed */
    const otherExpressionsToUpdate: Partial<{
      targetConstraints: Record<string, TargetConstraint>;
      enableWhenExpressions: EnableWhenExpressions;
      answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
      processedValueSets: Record<string, ProcessedValueSet>;
    }> = {};
    if (targetConstraintsUpdate.isUpdated) {
      otherExpressionsToUpdate.targetConstraints = targetConstraintsUpdate.value;
    }
    if (enableWhenExpressionsUpdate.isUpdated) {
      otherExpressionsToUpdate.enableWhenExpressions = enableWhenExpressionsUpdate.value;
    }
    if (answerOptionsToggleExpressionsUpdate.isUpdated) {
      otherExpressionsToUpdate.answerOptionsToggleExpressions =
        answerOptionsToggleExpressionsUpdate.value;
    }
    if (processedValueSetsUpdate.isUpdated) {
      otherExpressionsToUpdate.processedValueSets = processedValueSetsUpdate.value;
    }

    updateStoreState(
      lastUpdatedResponse,
      updatedCalculatedExpressions,
      updatedFhirPathContext,
      updatedFhirPathTerminologyCache,
      Object.keys(otherExpressionsToUpdate).length > 0 ? otherExpressionsToUpdate : undefined
    );
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  onFocusLinkId: (linkId: string) =>
    set(() => ({
      focusedLinkId: linkId
    })),
  setAdditionalContext: (additionalContext: Record<string, any>) => {
    const newFhirPathContext = { ...get().fhirPathContext, ...additionalContext };
    set(() => ({
      additionalContext: additionalContext,
      fhirPathContext: newFhirPathContext
    }));
  },
  setFormAsReadOnly: (readOnly: boolean) =>
    set(() => ({
      readOnly: readOnly
    }))
}));

/**
 * Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire.
 * This is the React version of the store which can be used as React hooks in React functional components.
 * @see {@link QuestionnaireStoreType} for available properties and methods.
 * @see {@link questionnaireStore} for the vanilla store.
 *
 * @author Sean Fong
 */
export const useQuestionnaireStore = createSelectors(questionnaireStore);
