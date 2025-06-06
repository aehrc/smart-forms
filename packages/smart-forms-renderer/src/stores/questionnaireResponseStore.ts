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
  OperationOutcome,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { emptyResponse } from '../utils/emptyResource';
import type { Diff } from 'deep-diff';
import { diff } from 'deep-diff';
import { createSelectors } from './selector';
import { validateForm } from '../utils/validate';
import { questionnaireStore } from './questionnaireStore';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';
import { generateUniqueId } from '../utils/extractObservation';

/**
 * QuestionnaireResponseStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, but it is possible to use them externally to hook into the renderer for more fine-grain control.
 *
 * @property key - The React key of the questionnaireResponse, used internally for refreshing the BaseRenderer
 * @property sourceResponse - The original response created when the form is first initialised i.e. empty, pre-populated, opened saved draft
 * @property updatableResponse - The current state of the response that is being updated via form fields
 * @property updatableResponseItems - Key-value pair of updatableResponse items `Record<linkId, QR.item(s)>`
 * @property formChangesHistory - Array of form changes history in the form of deep-diff objects
 * @property invalidItems - Key-value pair of invalid items based on defined value constraints in the questionnaire `Record<linkId, OperationOutcome>`
 * @property requiredItemsIsHighlighted - Required items are not highlighted by default (to provide a less-jarring UX), but can be manually toggled to be highlighted
 * @property responseIsValid - Whether there are any invalid items in the response
 * @property validateQuestionnaireResponse - Used to validate the questionnaire response based on the questionnaire
 * @property buildSourceResponse - Used to build the source response when the form is first initialised
 * @property setUpdatableResponseAsPopulated - Used to set a pre-populated response as the current response
 * @property updateResponse - Used to update the current response
 * @property setUpdatableResponseAsSaved - Used to set a saved response as the current response
 * @property setUpdatableResponseAsEmpty - Used to set an empty response as the current response
 * @property destroySourceResponse - Used to destroy the source response  and reset all properties
 * @property highlightRequiredItems - Used to highlight invalid items and show error feedback in the UI
 *
 * @author Sean Fong
 */
export interface QuestionnaireResponseStoreType {
  key: string;
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  updatableResponseItems: Record<string, QuestionnaireResponseItem[]>;
  formChangesHistory: (Diff<QuestionnaireResponse, QuestionnaireResponse>[] | null)[];
  invalidItems: Record<string, OperationOutcome>;
  requiredItemsIsHighlighted: boolean;
  responseIsValid: boolean;
  validateQuestionnaire: (
    questionnaire: Questionnaire,
    updatedResponse: QuestionnaireResponse
  ) => void;
  buildSourceResponse: (response: QuestionnaireResponse) => void;
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => void;
  updateResponse: (updatedResponse: QuestionnaireResponse, debugType: 'initial' | 'async') => void;
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) => void;
  destroySourceResponse: () => void;
  highlightRequiredItems: () => void;
}

/**
 * QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaireResponse.
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see QuestionnaireResponseStoreType for available properties and methods.
 *
 * @author Sean Fong
 */
export const questionnaireResponseStore = createStore<QuestionnaireResponseStoreType>()(
  (set, get) => ({
    key: 'QR-initial-key',
    sourceResponse: structuredClone(emptyResponse),
    updatableResponse: structuredClone(emptyResponse),
    updatableResponseItems: {},
    formChangesHistory: [],
    invalidItems: {},
    requiredItemsIsHighlighted: false,
    responseIsValid: true,
    validateQuestionnaire: (
      questionnaire: Questionnaire,
      updatedResponse: QuestionnaireResponse
    ) => {
      const updatedInvalidItems = validateForm(questionnaire, updatedResponse);

      set(() => ({
        invalidItems: updatedInvalidItems,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    buildSourceResponse: (questionnaireResponse: QuestionnaireResponse) => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      const initialInvalidItems = validateForm(sourceQuestionnaire, questionnaireResponse);

      set(() => ({
        key: generateUniqueId('QR'),
        sourceResponse: questionnaireResponse,
        updatableResponse: questionnaireResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          questionnaireResponse
        ),
        invalidItems: initialInvalidItems,
        requiredItemsIsHighlighted: false,
        responseIsValid: Object.keys(initialInvalidItems).length === 0
      }));
    },
    setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      const formChanges = diff(get().updatableResponse, populatedResponse) ?? null;

      const updatedInvalidItems = validateForm(sourceQuestionnaire, populatedResponse);

      set(() => ({
        sourceResponse: populatedResponse,
        updatableResponse: populatedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          populatedResponse
        ),
        formChangesHistory: [...get().formChangesHistory, formChanges],
        invalidItems: updatedInvalidItems,
        requiredItemsIsHighlighted: false,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    updateResponse: (updatedResponse: QuestionnaireResponse) => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      const formChanges = diff(get().updatableResponse, updatedResponse) ?? null;
      const updatedInvalidItems = validateForm(sourceQuestionnaire, updatedResponse);

      set(() => ({
        updatableResponse: updatedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          updatedResponse
        ),
        formChangesHistory: [...get().formChangesHistory, formChanges],
        invalidItems: updatedInvalidItems,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      const updatedInvalidItems = validateForm(sourceQuestionnaire, savedResponse);

      set(() => ({
        key: generateUniqueId('QR'),
        sourceResponse: savedResponse,
        updatableResponse: savedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          savedResponse
        ),
        formChangesHistory: [],
        invalidItems: updatedInvalidItems,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      const updatedInvalidItems = validateForm(sourceQuestionnaire, clearedResponse);

      set(() => ({
        updatableResponse: clearedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          clearedResponse
        ),
        formChangesHistory: [],
        invalidItems: updatedInvalidItems,
        requiredItemsIsHighlighted: false,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    destroySourceResponse: () => {
      const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
      set(() => ({
        key: generateUniqueId('QR'),
        sourceResponse: structuredClone(emptyResponse),
        updatableResponse: structuredClone(emptyResponse),
        updatableResponseItems: createQuestionnaireResponseItemMap(
          sourceQuestionnaire,
          structuredClone(emptyResponse)
        ),
        formChangesHistory: [],
        invalidItems: {},
        requiredItemsIsHighlighted: false,
        responseIsValid: true
      }));
    },
    highlightRequiredItems: () =>
      set(() => ({
        requiredItemsIsHighlighted: true
      }))
  })
);

/**
 * QuestionnaireResponse state management store which contains all properties and methods to manage the state of the questionnaire.
 * This is the React version of the store which can be used as React hooks in React functional components.
 * @see QuestionnaireResponseStoreType for available properties and methods.
 * @see questionnaireResponseStore for the vanilla store.
 *
 * @author Sean Fong
 */
export const useQuestionnaireResponseStore = createSelectors(questionnaireResponseStore);
