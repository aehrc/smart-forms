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

import { createStore } from 'zustand/vanilla';
import type {
  Coding,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { Variables } from '../interfaces/variables.interface';
import type { LaunchContext } from '../interfaces/populate.interface';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { AnswerExpression } from '../interfaces/answerExpression.interface';
import type { Tabs } from '../interfaces/tab.interface';
import type { Pages } from '../interfaces/page.interface';
import {
  mutateRepeatEnableWhenItemInstances,
  updateEnableWhenItemAnswer
} from '../utils/enableWhen';
import { evaluateUpdatedExpressions } from '../utils/fhirpath';
import {
  evaluateInitialCalculatedExpressions,
  initialiseCalculatedExpressionValues
} from '../utils/calculatedExpression';
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionnaireModel';
import { initialiseFormFromResponse } from '../utils/initialise';
import { emptyQuestionnaire, emptyResponse } from '../utils/emptyResource';
import { terminologyServerStore } from './terminologyServerStore';
import { createSelectors } from './selector';
import { mutateRepeatEnableWhenExpressionInstances } from '../utils/enableWhenExpression';
import { questionnaireResponseStore } from './questionnaireResponseStore';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { insertCompleteAnswerOptionsIntoQuestionnaire } from '../utils/questionnaireStoreUtils/insertAnswerOptions';
import type { InitialExpression } from '../interfaces/initialExpression.interface';
import type { QItemOverrideComponentProps, SdcUiOverrideComponentProps } from '../interfaces';
import type { ComponentType } from 'react';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import { readTargetConstraintLocationLinkIds } from '../utils/targetConstraint';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import { applyComputedUpdates } from '../utils/computedUpdates';

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
 * @property targetConstraints - Key-value pair of target constraints `Record<target constraint key, target constraint properties>`
 * @property targetConstraintLinkIds - Key-value pair of linkIds against target constraint key(s) `Record<linkId, target constraint keys>`
 * @property answerOptionsToggleExpressions - Key-value pair of answer options toggle expressions `Record<linkId, array of answer options toggle expressions>`
 * @property enableWhenItems - EnableWhenItems object containing enableWhen items and their linked questions
 * @property enableWhenLinkedQuestions - Key-value pair of linked questions to enableWhen items `Record<linkId, linkIds of linked questions>`
 * @property enableWhenIsActivated - Flag to turn enableWhen checks on/off
 * @property enableWhenExpressions - EnableWhenExpressions object containing enableWhen expressions
 * @property calculatedExpressions - Key-value pair of calculated expressions `Record<linkId, array of calculated expression properties>`
 * @property answerExpressions - Key-value pair of answer expressions `Record<linkId, answer expression properties>`
 * @property processedValueSets - Key-value pair of (pre-)processed value set codings `Record<valueSetUrl, ProcessedValueSet>`
 * @property cachedValueSetCodings - Key-value pair of cached value set codings `Record<valueSetUrl, codings>`
 * @property fhirPathContext - Key-value pair of evaluated FHIRPath values `Record<variable name, evaluated value(s)>`
 * @property fhirPathTerminologyCache - Key-value pair of cached FHIRPath Terminology results `Record<cacheKey, cached terminology result>`
 * @property populatedContext - Key-value pair of one-off pre-populated FHIRPath values `Record<variable/launchContext/sourceQueries batch name, evaluated value(s)>`
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
 * @property updateEnableWhenItem - Used to update linked enableWhen items by updating a question with a new answer
 * @property mutateRepeatEnableWhenItems - Used to add or remove instances of repeating enableWhen items
 * @property toggleEnableWhenActivation - Used to toggle enableWhen checks on/off
 * @property updateExpressions - Used to update all SDC expressions based on the updated questionnaire response
 * @property addCodingToCache - Used to add a coding to the cached value set codings
 * @property updatePopulatedProperties - Used to update all SDC expressions based on a pre-populated questionnaire response
 * @property onFocusLinkId - Used to set the focused linkId
 * @property setPopulatedContext - Used to set the populated contexts (launchContext, sourceQueries, x-fhir-query vars) for debugging purposes, and optionally add to the FHIRPath context
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
  targetConstraints: Record<string, TargetConstraint>;
  targetConstraintLinkIds: Record<string, string[]>;
  answerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSets: Record<string, ProcessedValueSet>;
  cachedValueSetCodings: Record<string, Coding[]>;
  fhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  populatedContext: Record<string, any>;
  qItemOverrideComponents: Record<string, ComponentType<QItemOverrideComponentProps>>;
  sdcUiOverrideComponents: Record<string, ComponentType<SdcUiOverrideComponentProps>>;
  focusedLinkId: string;
  readOnly: boolean;
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    additionalVariables?: Record<string, any>,
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
  updateExpressions: (updatedResponse: QuestionnaireResponse) => Promise<void>;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  updatePopulatedProperties: (
    populatedResponse: QuestionnaireResponse,
    populatedContext?: Record<string, any>,
    persistTabIndex?: boolean
  ) => Promise<QuestionnaireResponse>;
  // updateXFhirQueries: (syncedQueries: Record<string, any>) => Promise<QuestionnaireResponse>;
  onFocusLinkId: (linkId: string) => void;
  // TODO - to be deprecated, use `additionalVariables` in buildSourceQuestionnaire(), also directly set in updatedPopulatedProperties
  setPopulatedContext: (
    newPopulatedContext: Record<string, any>,
    addToFhirPathContext?: boolean
  ) => void;
  setFormAsReadOnly: (readOnly: boolean) => void;
}

/**
 * Questionnaire state management store which contains all properties and methods to manage the state of the questionnaire.
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see QuestionnaireStoreType for available properties and methods.
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
  populatedContext: {},
  qItemOverrideComponents: {},
  sdcUiOverrideComponents: {},
  focusedLinkId: '',
  readOnly: false,
  buildSourceQuestionnaire: async (
    questionnaire,
    questionnaireResponse = structuredClone(emptyResponse),
    additionalVariables = {},
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

    // If existing fhirPathContext is empty, use the one from the questionnaire model
    // Mostly existing fhirPathContext will be empty, but in some cases it may not be e.g. after pre-population
    let fhirPathContext = get().fhirPathContext ?? questionnaireModel.fhirPathContext;

    // TODO reminder to have documentation when upgrading to 1.0.0 - 05/06/2025
    // TODO This is something new - the definition of additionalVariables is now <"name", "value">, which allows it to be injected into the renderer's fhirPathContext.
    // TODO as an example, populatedContext from a pre-pop module can now be inserted into the renderer for further use.
    fhirPathContext = {
      ...fhirPathContext,
      ...additionalVariables
    };
    const fhirPathTerminologyCache =
      get().fhirPathTerminologyCache ?? questionnaireModel.fhirPathTerminologyCache;

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
      fhirPathContext: fhirPathContext,
      fhirPathTerminologyCache: fhirPathTerminologyCache,
      terminologyServerUrl: terminologyServerUrl
    });

    // Read target constraint locations
    const targetConstraintLinkIds = readTargetConstraintLocationLinkIds(
      questionnaire,
      initialTargetConstraints
    );

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
      fhirPathContext: updatedFhirPathContext,
      fhirPathTerminologyCache: updatedFhirPathTerminologyCache,
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
  updateExpressions: async (updatedResponse: QuestionnaireResponse) => {
    const sourceQuestionnaire = get().sourceQuestionnaire;
    const updateResponse = questionnaireResponseStore.getState().updateResponse;
    const validateResponse = questionnaireResponseStore.getState().validateResponse;
    const updatedResponseItemMap = createQuestionnaireResponseItemMap(
      sourceQuestionnaire,
      updatedResponse
    );
    const {
      isUpdated,
      updatedTargetConstraints,
      updatedAnswerOptionsToggleExpressions,
      updatedEnableWhenExpressions,
      updatedCalculatedExpressions,
      updatedProcessedValueSets,
      updatedFhirPathContext,
      fhirPathTerminologyCache,
      computedQRItemUpdates
    } = await evaluateUpdatedExpressions({
      updatedResponse,
      updatedResponseItemMap,
      targetConstraints: get().targetConstraints,
      answerOptionsToggleExpressions: get().answerOptionsToggleExpressions,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: get().calculatedExpressions,
      processedValueSets: get().processedValueSets,
      variables: get().variables,
      existingFhirPathContext: get().fhirPathContext,
      fhirPathTerminologyCache: get().fhirPathTerminologyCache,
      terminologyServerUrl: terminologyServerStore.getState().url
    });

    /**
     * Applies computed updates to the QR before updating the store.
     * Before this, we were updating the store before applying the computed updates. This may cause downstream useEffects to use a stale QR.
     * By applying the computed updates first, we ensure that the QR is up-to-date when downstream useEffects are fired.
     */

    let lastUpdatedResponse = structuredClone(updatedResponse);
    if (Object.keys(computedQRItemUpdates).length > 0) {
      lastUpdatedResponse = applyComputedUpdates(
        get().sourceQuestionnaire,
        updatedResponse,
        computedQRItemUpdates
      );
      updateResponse(lastUpdatedResponse, 'async');
    }

    if (isUpdated) {
      set(() => ({
        targetConstraints: updatedTargetConstraints,
        answerOptionsToggleExpressions: updatedAnswerOptionsToggleExpressions,
        enableWhenExpressions: updatedEnableWhenExpressions,
        calculatedExpressions: updatedCalculatedExpressions,
        processedValueSets: updatedProcessedValueSets,
        fhirPathContext: updatedFhirPathContext,
        fhirPathTerminologyCache: fhirPathTerminologyCache
      }));

      // Besides setting QuestionnaireStore state, we also need to update `invalidItems` and `responseIsValid` in QuestionnaireResponseStore
      validateResponse(sourceQuestionnaire, lastUpdatedResponse); // Validate the updated response asynchronously
    }

    set(() => ({
      fhirPathContext: updatedFhirPathContext,
      fhirPathTerminologyCache: fhirPathTerminologyCache
    }));
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  updatePopulatedProperties: async (
    populatedResponse: QuestionnaireResponse,
    populatedContext?: Record<string, any>,
    persistTabIndex?: boolean,
    persistPageIndex?: boolean
  ) => {
    const sourceQuestionnaire = get().sourceQuestionnaire;
    const fhirPathContext = { ...get().fhirPathContext, ...(populatedContext ?? {}) };
    const initialResponseItemMap = createQuestionnaireResponseItemMap(
      sourceQuestionnaire,
      populatedResponse
    );

    const evaluateInitialCalculatedExpressionsResult = await evaluateInitialCalculatedExpressions({
      initialResponse: populatedResponse,
      initialResponseItemMap: initialResponseItemMap,
      calculatedExpressions: get().calculatedExpressions,
      variables: get().variables,
      existingFhirPathContext: fhirPathContext,
      fhirPathTerminologyCache: get().fhirPathTerminologyCache,
      terminologyServerUrl: terminologyServerStore.getState().url
    });
    const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
    let updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;
    let fhirPathTerminologyCache =
      evaluateInitialCalculatedExpressionsResult.fhirPathTerminologyCache;

    const updatedResponse = initialiseCalculatedExpressionValues(
      sourceQuestionnaire,
      populatedResponse,
      initialCalculatedExpressions
    );

    const {
      initialTargetConstraints,
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      initialAnswerOptionsToggleExpressions,
      firstVisibleTab,
      firstVisiblePage
    } = await initialiseFormFromResponse({
      sourceQuestionnaire,
      questionnaireResponse: updatedResponse,
      targetConstraints: get().targetConstraints,
      enableWhenItems: get().enableWhenItems,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      answerOptionsToggleExpressions: get().answerOptionsToggleExpressions,
      variables: get().variables,
      processedValueSets: get().processedValueSets,
      tabs: get().tabs,
      pages: get().pages,
      fhirPathContext: updatedFhirPathContext,
      fhirPathTerminologyCache: fhirPathTerminologyCache,
      terminologyServerUrl: terminologyServerStore.getState().url
    });
    updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;
    fhirPathTerminologyCache = evaluateInitialCalculatedExpressionsResult.fhirPathTerminologyCache;

    set(() => ({
      targetConstraints: initialTargetConstraints,
      answerOptionsToggleExpressions: initialAnswerOptionsToggleExpressions,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      currentTabIndex: persistTabIndex ? get().currentTabIndex : firstVisibleTab,
      currentPageIndex: persistPageIndex ? get().currentPageIndex : firstVisiblePage,
      fhirPathContext: updatedFhirPathContext,
      fhirPathTerminologyCache: fhirPathTerminologyCache,
      populatedContext: populatedContext ?? get().populatedContext
    }));

    return updatedResponse;
  },
  // FIXME POC - to be refactored in #1400
  // FIXME Design - need to consider if calculatedExpression can use this too
  // FIXME Design - looks like we are gonna do a single initialExpression update -> calculatedExpression -> rest of the expressions update
  // updateXFhirQueries: async (syncedQueries: Record<string, any>) => {
  //   const sourceQuestionnaire = get().sourceQuestionnaire;
  //   const updatableResponse = questionnaireResponseStore.getState().updatableResponse;
  //
  //   // Create updated response item map for current iteration
  //   const currentResponseItemMap = createQuestionnaireResponseItemMap(
  //     sourceQuestionnaire,
  //     updatableResponse
  //   );
  //
  //   const terminologyServerUrl = terminologyServerStore.getState().url;
  //
  //   // Create updated FHIRPath context for current iteration
  //   const fhirPathEvalResult = await createFhirPathContext(
  //     updatableResponse,
  //     currentResponseItemMap,
  //     get().variables,
  //     { ...get().fhirPathContext, ...syncedQueries },
  //     get().fhirPathTerminologyCache,
  //     terminologyServerUrl
  //   );
  //   const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  //
  //   // Filter out the synced queries from initial
  //
  //   // Evaluate calculated expressions with current context
  //   const { calculatedExpsIsUpdated, updatedCalculatedExpressions } =
  //     await evaluateCalculatedExpressionsFhirPath(
  //       updatedFhirPathContext,
  //       fhirPathTerminologyCache,
  //       calculatedExpressions,
  //       terminologyServerUrl
  //     );
  //   currentCalculatedExpressions = updatedCalculatedExpressions;
  //
  //   if (calculatedExpsIsUpdated) {
  //     hasChanges = true;
  //
  //     console.log(structuredClone(updatedCalculatedExpressions));
  //     // Apply calculated expression values directly to the response
  //     currentResponse = applyCalculatedExpressionValuesToResponse(
  //       questionnaire,
  //       currentResponse,
  //       updatedCalculatedExpressions
  //     );
  //   }
  //
  //   // Update the store with the new fhirPathContext
  //   set(() => ({
  //     fhirPathContext: fhirPathContext
  //   }));
  //
  //   return updatedResponse;
  // },
  onFocusLinkId: (linkId: string) =>
    set(() => ({
      focusedLinkId: linkId
    })),
  setPopulatedContext: (
    newPopulatedContext: Record<string, any>,
    addToFhirPathContext?: boolean
  ) => {
    if (addToFhirPathContext) {
      const newFhirPathContext = { ...get().fhirPathContext, ...newPopulatedContext };
      set(() => ({
        populatedContext: newPopulatedContext,
        fhirPathContext: newFhirPathContext
      }));
      return;
    }

    set(() => ({
      populatedContext: newPopulatedContext
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
 * @see QuestionnaireStoreType for available properties and methods.
 * @see questionnaireStore for the vanilla store.
 *
 * @author Sean Fong
 */
export const useQuestionnaireStore = createSelectors(questionnaireStore);
