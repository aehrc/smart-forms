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
import cloneDeep from 'lodash.clonedeep';
import type { Diff } from 'deep-diff';
import { diff } from 'deep-diff';
import { createSelectors } from './selector';
import { validateQuestionnaire } from '../utils/validateQuestionnaire';
import { questionnaireStore } from './questionnaireStore';
import { createQuestionnaireResponseItemMap } from '../utils/questionnaireResponseStoreUtils/updatableResponseItems';

interface QuestionnaireResponseStoreType {
  sourceResponse: QuestionnaireResponse;
  updatableResponse: QuestionnaireResponse;
  updatableResponseItems: Record<string, QuestionnaireResponseItem[]>;
  formChangesHistory: (Diff<QuestionnaireResponse, QuestionnaireResponse>[] | null)[];
  invalidItems: Record<string, OperationOutcome>;
  responseIsValid: boolean;
  validateQuestionnaire: (
    questionnaire: Questionnaire,
    updatedResponse: QuestionnaireResponse
  ) => void;
  buildSourceResponse: (response: QuestionnaireResponse) => void;
  setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => void;
  updateResponse: (updatedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) => void;
  setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) => void;
  destroySourceResponse: () => void;
}

export const questionnaireResponseStore = createStore<QuestionnaireResponseStoreType>()(
  (set, get) => ({
    sourceResponse: cloneDeep(emptyResponse),
    updatableResponse: cloneDeep(emptyResponse),
    updatableResponseItems: {},
    formChangesHistory: [],
    invalidItems: {},
    responseIsValid: true,
    validateQuestionnaire: (
      questionnaire: Questionnaire,
      updatedResponse: QuestionnaireResponse
    ) => {
      const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
      const enableWhenItems = questionnaireStore.getState().enableWhenItems;
      const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;

      const updatedInvalidItems = validateQuestionnaire({
        questionnaire,
        questionnaireResponse: updatedResponse,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });

      set(() => ({
        invalidItems: updatedInvalidItems,
        responseIsValid: Object.keys(updatedInvalidItems).length === 0
      }));
    },
    buildSourceResponse: (questionnaireResponse: QuestionnaireResponse) => {
      set(() => ({
        sourceResponse: questionnaireResponse,
        updatableResponse: questionnaireResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(questionnaireResponse)
      }));
    },
    setUpdatableResponseAsPopulated: (populatedResponse: QuestionnaireResponse) => {
      const formChanges = diff(get().updatableResponse, populatedResponse) ?? null;
      set(() => ({
        updatableResponse: populatedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(populatedResponse),
        formChangesHistory: [...get().formChangesHistory, formChanges]
      }));
    },
    updateResponse: (updatedResponse: QuestionnaireResponse) => {
      const formChanges = diff(get().updatableResponse, updatedResponse) ?? null;
      set(() => ({
        updatableResponse: updatedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(updatedResponse),
        formChangesHistory: [...get().formChangesHistory, formChanges]
      }));
    },
    setUpdatableResponseAsSaved: (savedResponse: QuestionnaireResponse) =>
      set(() => ({
        sourceResponse: savedResponse,
        updatableResponse: savedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(savedResponse),
        formChangesHistory: []
      })),
    setUpdatableResponseAsEmpty: (clearedResponse: QuestionnaireResponse) =>
      set(() => ({
        updatableResponse: clearedResponse,
        updatableResponseItems: createQuestionnaireResponseItemMap(clearedResponse),
        formChangesHistory: []
      })),
    destroySourceResponse: () =>
      set(() => ({
        sourceResponse: cloneDeep(emptyResponse),
        updatableResponse: cloneDeep(emptyResponse),
        updatableResponseItems: createQuestionnaireResponseItemMap(cloneDeep(emptyResponse)),
        formChangesHistory: []
      }))
  })
);

export const useQuestionnaireResponseStore = createSelectors(questionnaireResponseStore);
