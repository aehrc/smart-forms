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
import type { QuestionnaireResponse } from 'fhir/r4';
import { questionnaireStore } from './questionnaireStore';
import { useQuestionnaireResponseStore } from './questionnaireResponseStore';
import { createSelectors } from './selector';

/**
 * A single form update task, representing a `QuestionnaireResponse` that should be processed.
 */
export interface UpdateTask {
  /** The `QuestionnaireResponse` snapshot used to evaluate calculated expressions */
  questionnaireResponse: QuestionnaireResponse;

  /**
   * Optional flag indicating this update is the first update upon pre-population and form build.
   * Useful for distinguishing initialization updates from subsequent user-triggered updates.
   * Defaults to `false`.
   */
  isInitialUpdate?: boolean;
}

/**
 * Zustand store for managing queued, sequential updates to a FHIR form.
 */
export interface FormUpdateQueueStoreType {
  /** Queue of form update tasks (FIFO) */
  queue: UpdateTask[];

  /** Flag indicating if a task is currently being processed */
  isProcessing: boolean;

  /**
   * Adds a new form update task to the end of the queue.
   * Triggers the queue processor if not already running.
   *
   * @param task - The form update task to enqueue
   */
  enqueueFormUpdate: (task: UpdateTask) => void;

  /**
   * Internal processor that handles one task at a time, in order.
   *
   * - Applies the `updateExpressions` function to the `questionnaireResponse`.
   * - Applies the resulting computed updates.
   * - Updates the `QuestionnaireResponse` store in two phases: immediate and async.
   * - Automatically proceeds to the next task in the queue.
   */
  _startProcessing: () => void;
}

/**
 * `formUpdateQueueStore` is a Zustand store that serializes asynchronous form update logic.
 *
 * It ensures that each form update task is processed sequentially, one at a time,
 * to avoid race conditions and inconsistent state during expression evaluation.
 *
 * - `enqueueFormUpdate` adds a new task to the end of the queue.
 * - `_startProcessing` handles processing each task and re-triggers itself as needed.
 */
export const formUpdateQueueStore = createStore<FormUpdateQueueStoreType>()((set, get) => ({
  queue: [],
  isProcessing: false,

  enqueueFormUpdate: (task: UpdateTask) => {
    set((state) => ({ queue: [...state.queue, task] }));
    get()._startProcessing();
  },

  _startProcessing: async () => {
    const { isProcessing, queue } = get();

    const updateExpressions = questionnaireStore.getState().updateExpressions;
    const updateResponse = useQuestionnaireResponseStore.getState().updateResponse;

    if (isProcessing || queue.length === 0) {
      return;
    }

    set({ isProcessing: true });

    /* Process first task in the queue */
    const { questionnaireResponse, isInitialUpdate = false } = queue[0];

    // Perform an immediate QR update first, then process expressions asynchronously
    updateResponse(questionnaireResponse, isInitialUpdate);
    await updateExpressions(questionnaireResponse, isInitialUpdate);

    /* Dequeue first task in and process next task in the queue */
    set((state) => ({
      queue: state.queue.slice(1),
      isProcessing: false
    }));
    get()._startProcessing();
  }
}));

export const useFormUpdateQueueStore = createSelectors(formUpdateQueueStore);
