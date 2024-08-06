/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionaireModel';
import { initialiseFormFromResponse } from '../utils/initialise';
import { emptyQuestionnaire, emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';
import { terminologyServerStore } from './terminologyServerStore';
import { createSelectors } from './selector';
import { mutateRepeatEnableWhenExpressionInstances } from '../utils/enableWhenExpression';
import { questionnaireResponseStore } from './questionnaireResponseStore';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { insertCompleteAnswerOptionsIntoQuestionnaire } from '../utils/questionnaireStoreUtils/insertAnswerOptions';
import type { InitialExpression } from '../interfaces/initialExpression.interface';

/**
 * QuestionnaireStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, using them from an external source is not recommended.
 *
 * @property sourceQuestionnaire - FHIR R4 Questionnaire to render
 * @property itemTypes - Key-value pair of item types `Record<linkId, item.type>`
 * @property tabs - Key-value pair of tabs `Record<linkId, Tab>`
 * @property currentTabIndex - Index of the current tab
 * @property pages - Key-value pair of pages `Record<linkId, Page>`
 * @property currentPageIndex - Index of the current page
 * @property variables - Questionnaire variables object containing FHIRPath and x-fhir-query variables
 * @property launchContexts - Key-value pair of launch contexts `Record<launch context name, launch context properties>`
 * @property enableWhenItems - EnableWhenItems object containing enableWhen items and their linked questions
 * @property enableWhenLinkedQuestions - Key-value pair of linked questions to enableWhen items `Record<linkId, linkIds of linked questions>`
 * @property enableWhenIsActivated - Flag to turn enableWhen checks on/off
 * @property enableWhenExpressions - EnableWhenExpressions object containing enableWhen expressions
 * @property calculatedExpressions - Key-value pair of calculated expressions `Record<linkId, array of calculated expression properties>`
 * @property answerExpressions - Key-value pair of answer expressions `Record<linkId, answer expression properties>`
 * @property processedValueSetCodings - Key-value pair of processed value set codings `Record<valueSetUrl, codings>`
 * @property processedValueSetUrls - Key-value pair of contained value set urls `Record<valueSetName, valueSetUrl>`
 * @property cachedValueSetCodings - Key-value pair of cached value set codings `Record<valueSetUrl, codings>`
 * @property fhirPathContext - Key-value pair of evaluated FHIRPath values `Record<variable name, evaluated value(s)>`
 * @property populatedContext - Key-value pair of one-off pre-populated FHIRPath values `Record<variable/launchContext/sourceQueries batch name, evaluated value(s)>`
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
 * @property setPopulatedContext - Used to set the populated contexts (launchContext, sourceQueries, x-fhir-query vars) for debugging purposes
 * @property setFormAsReadOnly - Used to set the form as read-only
 *
 * @author Sean Fong
 */
export interface QuestionnaireStoreType {
  sourceQuestionnaire: Questionnaire;
  itemTypes: Record<string, string>;
  tabs: Tabs;
  currentTabIndex: number;
  pages: Pages;
  currentPageIndex: number;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
  processedValueSetUrls: Record<string, string>;
  cachedValueSetCodings: Record<string, Coding[]>;
  fhirPathContext: Record<string, any>;
  populatedContext: Record<string, any>;
  focusedLinkId: string;
  readOnly: boolean;
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    additionalVariables?: Record<string, object>,
    terminologyServerUrl?: string,
    readOnly?: boolean
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
  updateExpressions: (updatedResponse: QuestionnaireResponse) => void;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  updatePopulatedProperties: (
    populatedResponse: QuestionnaireResponse,
    populatedContext?: Record<string, any>,
    persistTabIndex?: boolean
  ) => QuestionnaireResponse;
  onFocusLinkId: (linkId: string) => void;
  setPopulatedContext: (newPopulatedContext: Record<string, any>) => void;
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
  sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
  itemTypes: {},
  tabs: {},
  currentTabIndex: 0,
  pages: {},
  currentPageIndex: 0,
  variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
  launchContexts: {},
  calculatedExpressions: {},
  initialExpressions: {},
  enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
  answerExpressions: {},
  enableWhenItems: { singleItems: {}, repeatItems: {} },
  enableWhenLinkedQuestions: {},
  enableWhenIsActivated: true,
  processedValueSetCodings: {},
  processedValueSetUrls: {},
  cachedValueSetCodings: {},
  fhirPathContext: {},
  populatedContext: {},
  focusedLinkId: '',
  readOnly: false,
  buildSourceQuestionnaire: async (
    questionnaire,
    questionnaireResponse = cloneDeep(emptyResponse),
    additionalVariables = {},
    terminologyServerUrl = terminologyServerStore.getState().url,
    readOnly = false
  ) => {
    const questionnaireModel = await createQuestionnaireModel(
      questionnaire,
      additionalVariables,
      terminologyServerUrl
    );

    // Insert answerOptions with displays into questionnaire
    questionnaire = insertCompleteAnswerOptionsIntoQuestionnaire(
      questionnaire,
      questionnaireModel.answerOptions
    );

    // Initialise form with questionnaire response and properties in questionnaire model
    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      initialCalculatedExpressions,
      firstVisibleTab,
      firstVisiblePage,
      updatedFhirPathContext
    } = initialiseFormFromResponse({
      questionnaireResponse,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      variablesFhirPath: questionnaireModel.variables.fhirPathVariables,
      tabs: questionnaireModel.tabs,
      pages: questionnaireModel.pages,
      fhirPathContext: questionnaireModel.fhirPathContext
    });

    set({
      sourceQuestionnaire: questionnaire,
      itemTypes: questionnaireModel.itemTypes,
      tabs: questionnaireModel.tabs,
      currentTabIndex: firstVisibleTab,
      pages: questionnaireModel.pages,
      currentPageIndex: firstVisiblePage,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      initialExpressions: questionnaireModel.initialExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings,
      processedValueSetUrls: questionnaireModel.processedValueSetUrls,
      fhirPathContext: updatedFhirPathContext,
      readOnly: readOnly
    });
  },
  destroySourceQuestionnaire: () =>
    set({
      sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
      itemTypes: {},
      tabs: {},
      currentTabIndex: 0,
      pages: {},
      currentPageIndex: 0,
      variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
      launchContexts: {},
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenLinkedQuestions: {},
      enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
      calculatedExpressions: {},
      initialExpressions: {},
      answerExpressions: {},
      processedValueSetCodings: {},
      processedValueSetUrls: {},
      fhirPathContext: {}
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
  mutateRepeatEnableWhenItems: (
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

    const { updatedEnableWhenExpressions, isUpdated } = mutateRepeatEnableWhenExpressionInstances({
      questionnaireResponse: questionnaireResponseStore.getState().updatableResponse,
      questionnaireResponseItemMap: questionnaireResponseStore.getState().updatableResponseItems,
      variablesFhirPath: get().variables.fhirPathVariables,
      existingFhirPathContext: get().fhirPathContext,
      enableWhenExpressions: enableWhenExpressions,
      parentRepeatGroupLinkId,
      parentRepeatGroupIndex,
      actionType
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
  updateExpressions: (updatedResponse: QuestionnaireResponse) => {
    const updatedResponseItemMap = createQuestionnaireResponseItemMap(updatedResponse);
    const {
      isUpdated,
      updatedEnableWhenExpressions,
      updatedCalculatedExpressions,
      updatedFhirPathContext
    } = evaluateUpdatedExpressions({
      updatedResponse,
      updatedResponseItemMap,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      existingFhirPathContext: get().fhirPathContext
    });

    if (isUpdated) {
      set(() => ({
        enableWhenExpressions: updatedEnableWhenExpressions,
        calculatedExpressions: updatedCalculatedExpressions,
        fhirPathContext: updatedFhirPathContext
      }));
      return 0;
    }

    set(() => ({
      fhirPathContext: updatedFhirPathContext
    }));
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  updatePopulatedProperties: (
    populatedResponse: QuestionnaireResponse,
    populatedContext?: Record<string, any>,
    persistTabIndex?: boolean,
    persistPageIndex?: boolean
  ) => {
    const initialResponseItemMap = createQuestionnaireResponseItemMap(populatedResponse);

    const evaluateInitialCalculatedExpressionsResult = evaluateInitialCalculatedExpressions({
      initialResponse: populatedResponse,
      initialResponseItemMap: initialResponseItemMap,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      existingFhirPathContext: get().fhirPathContext
    });
    const { initialCalculatedExpressions } = evaluateInitialCalculatedExpressionsResult;
    let updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;

    const updatedResponse = initialiseCalculatedExpressionValues(
      get().sourceQuestionnaire,
      populatedResponse,
      initialCalculatedExpressions
    );

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      firstVisibleTab,
      firstVisiblePage
    } = initialiseFormFromResponse({
      questionnaireResponse: updatedResponse,
      enableWhenItems: get().enableWhenItems,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      tabs: get().tabs,
      pages: get().pages,
      fhirPathContext: updatedFhirPathContext
    });
    updatedFhirPathContext = evaluateInitialCalculatedExpressionsResult.updatedFhirPathContext;

    set(() => ({
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      currentTabIndex: persistTabIndex ? get().currentTabIndex : firstVisibleTab,
      currentPageIndex: persistPageIndex ? get().currentPageIndex : firstVisiblePage,
      fhirPathContext: updatedFhirPathContext,
      populatedContext: populatedContext ?? get().populatedContext
    }));

    return updatedResponse;
  },
  onFocusLinkId: (linkId: string) =>
    set(() => ({
      focusedLinkId: linkId
    })),
  setPopulatedContext: (newPopulatedContext: Record<string, any>) =>
    set(() => ({
      populatedContext: newPopulatedContext
    })),
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
