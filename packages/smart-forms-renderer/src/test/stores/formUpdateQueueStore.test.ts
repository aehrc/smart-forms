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

import { waitFor } from '@testing-library/react';
import type { QuestionnaireResponse } from 'fhir/r4';
import type { UpdateTask } from '../../stores/formUpdateQueueStore';
import { formUpdateQueueStore } from '../../stores/formUpdateQueueStore';

// Mock the dependencies
const mockUpdateExpressions = jest.fn();
const mockUpdateResponse = jest.fn();

jest.mock('../../stores/questionnaireStore', () => ({
  questionnaireStore: {
    getState: () => ({
      updateExpressions: mockUpdateExpressions
    })
  }
}));

jest.mock('../../stores/questionnaireResponseStore', () => ({
  useQuestionnaireResponseStore: {
    getState: () => ({
      updateResponse: mockUpdateResponse
    })
  }
}));

// Test data
const mockQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'test-item',
      answer: [{ valueString: 'test-value' }]
    }
  ]
};

const createMockTask = (id: string): UpdateTask => ({
  questionnaireResponse: {
    ...mockQuestionnaireResponse,
    id
  },
  isInitialUpdate: false
});

describe('formUpdateQueueStore', () => {
  beforeEach(() => {
    // Reset store state
    formUpdateQueueStore.setState({
      queue: [],
      isProcessing: false
    });

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUpdateExpressions.mockResolvedValue(undefined);
    mockUpdateResponse.mockImplementation(() => {});
  });

  describe('initial state', () => {
    it('should have empty queue and not be processing', () => {
      const state = formUpdateQueueStore.getState();

      expect(state.queue).toEqual([]);
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('enqueueFormUpdate', () => {
    it('should add task to queue', () => {
      const task = createMockTask('1');

      formUpdateQueueStore.getState().enqueueFormUpdate(task);

      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(1);
      expect(state.queue[0]).toBe(task);
    });

    it('should add multiple tasks to queue in order', () => {
      const task1 = createMockTask('1');
      const task2 = createMockTask('2');

      formUpdateQueueStore.getState().enqueueFormUpdate(task1);
      formUpdateQueueStore.getState().enqueueFormUpdate(task2);

      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(2);
      expect(state.queue[0]).toBe(task1);
      expect(state.queue[1]).toBe(task2);
    });

    it('should trigger processing when adding task', async () => {
      const task = createMockTask('1');

      formUpdateQueueStore.getState().enqueueFormUpdate(task);

      await waitFor(() => {
        expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, false);
        expect(mockUpdateExpressions).toHaveBeenCalledWith(task.questionnaireResponse, false);
      });
    });
  });

  describe('_startProcessing', () => {
    it('should not process when already processing', async () => {
      const task = createMockTask('1');
      formUpdateQueueStore.setState({
        queue: [task],
        isProcessing: true
      });

      await formUpdateQueueStore.getState()._startProcessing();

      expect(mockUpdateResponse).not.toHaveBeenCalled();
      expect(mockUpdateExpressions).not.toHaveBeenCalled();
    });

    it('should not process when queue is empty', async () => {
      formUpdateQueueStore.setState({
        queue: [],
        isProcessing: false
      });

      await formUpdateQueueStore.getState()._startProcessing();

      expect(mockUpdateResponse).not.toHaveBeenCalled();
      expect(mockUpdateExpressions).not.toHaveBeenCalled();
    });

    it('should process single task successfully', async () => {
      const task = createMockTask('1');
      formUpdateQueueStore.setState({ queue: [task] });

      await formUpdateQueueStore.getState()._startProcessing();

      // Should call update functions
      expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, false);
      expect(mockUpdateExpressions).toHaveBeenCalledWith(task.questionnaireResponse, false);

      // Should remove processed task and stop processing
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(0);
      expect(state.isProcessing).toBe(false);
    });

    it('should process multiple tasks sequentially', async () => {
      const task1 = createMockTask('1');
      const task2 = createMockTask('2');
      formUpdateQueueStore.setState({ queue: [task1, task2] });

      await formUpdateQueueStore.getState()._startProcessing();

      // Should process both tasks
      expect(mockUpdateResponse).toHaveBeenCalledTimes(2);
      expect(mockUpdateExpressions).toHaveBeenCalledTimes(2);

      // Should process in order
      expect(mockUpdateResponse).toHaveBeenNthCalledWith(1, task1.questionnaireResponse, false);
      expect(mockUpdateResponse).toHaveBeenNthCalledWith(2, task2.questionnaireResponse, false);

      // Should clear queue and stop processing
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(0);
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid successive enqueues', async () => {
      const task1 = createMockTask('1');
      const task2 = createMockTask('2');
      const task3 = createMockTask('3');

      // Enqueue rapidly
      formUpdateQueueStore.getState().enqueueFormUpdate(task1);
      formUpdateQueueStore.getState().enqueueFormUpdate(task2);
      formUpdateQueueStore.getState().enqueueFormUpdate(task3);

      // Wait for processing to complete
      await waitFor(() => {
        const state = formUpdateQueueStore.getState();
        expect(state.queue).toHaveLength(0);
        expect(state.isProcessing).toBe(false);
      });

      // All tasks should have been processed
      expect(mockUpdateResponse).toHaveBeenCalledTimes(3);
      expect(mockUpdateExpressions).toHaveBeenCalledTimes(3);
    });
  });
});
