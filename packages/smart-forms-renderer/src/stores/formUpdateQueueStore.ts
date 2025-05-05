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
import type { QuestionnaireResponse } from 'fhir/r4';
import { questionnaireStore } from './questionnaireStore';
import { useQuestionnaireResponseStore } from './questionnaireResponseStore';
import { applyComputedUpdates } from '../utils/computedUpdates';
import { createSelectors } from './selector';

export interface UpdateTask {
  questionnaireResponse: QuestionnaireResponse;
}

export interface FormUpdateQueueStoreType {
  queue: UpdateTask[];
  isProcessing: boolean;
  enqueueFormUpdate: (task: UpdateTask) => void;
  replaceLatestFormUpdate: (task: UpdateTask) => void;
  _startProcessing: () => void;
}

/**
 * FormUpdateQueueStore manages serialization of asynchronous form update logic.
 *
 * - enqueue: adds an update task to the queue (FIFO).
 * - replaceLatest: replaces all pending tasks with the latest task (useful for calculated fields).
 * - internal process handles sequential async resolution.
 *
 * This is a vanilla Zustand store for use in FHIR form renderers with async dependencies.
 */
export const formUpdateQueueStore = createStore<FormUpdateQueueStoreType>()((set, get) => ({
  queue: [],
  isProcessing: false,
  enqueueFormUpdate: (task: UpdateTask) => {
    set((state) => ({ queue: [...state.queue, task] }));
    get()._startProcessing();
  },

  replaceLatestFormUpdate: (task: UpdateTask) => {
    const { isProcessing } = get();

    // If already processing, keep current task and replace pending ones
    set(() => ({
      queue: isProcessing ? [get().queue[0], task] : [task]
    }));
    get()._startProcessing();
  },

  _startProcessing: async () => {
    const { isProcessing, queue } = get();

    const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
    const updateExpressions = questionnaireStore.getState().updateExpressions;
    const updateResponse = useQuestionnaireResponseStore.getState().updateResponse;

    if (isProcessing || queue.length === 0) {
      return;
    }

    set({ isProcessing: true });

    const { questionnaireResponse } = queue[0];

    updateResponse(questionnaireResponse, 'initial'); // Immediate update

    const computedUpdates = await updateExpressions(questionnaireResponse);
    const applied = applyComputedUpdates(
      sourceQuestionnaire,
      questionnaireResponse,
      computedUpdates
    );

    updateResponse(applied, 'async'); // Deferred computed update

    set((state) => ({
      queue: state.queue.slice(1),
      isProcessing: false
    }));

    get()._startProcessing(); // Process next task
  }
}));

export const useFormUpdateQueueStore = createSelectors(formUpdateQueueStore);
