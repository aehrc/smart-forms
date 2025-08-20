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
import { formUpdateQueueStore, useFormUpdateQueueStore } from '../../stores/formUpdateQueueStore';
import type { UpdateTask } from '../../stores/formUpdateQueueStore';

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
  targetItemPath: [{ linkId: `test-path-${id}`, repeatIndex: 0 }]
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
        expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, 'initial');
        expect(mockUpdateExpressions).toHaveBeenCalledWith(task.questionnaireResponse);
      });
    });
  });

  describe('replaceLatestFormUpdate', () => {
    it('should replace all pending tasks when not processing', () => {
      const task1 = createMockTask('1');
      const task2 = createMockTask('2');
      const task3 = createMockTask('3');

      // Add multiple tasks
      formUpdateQueueStore.setState({ queue: [task1, task2] });

      // Replace with latest
      formUpdateQueueStore.getState().replaceLatestFormUpdate(task3);

      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(1);
      expect(state.queue[0]).toBe(task3);
    });

    it('should preserve current task when processing and replace pending ones', () => {
      const currentTask = createMockTask('current');
      const pendingTask1 = createMockTask('pending1');
      const pendingTask2 = createMockTask('pending2');
      const newTask = createMockTask('new');

      // Set up processing state with current and pending tasks
      formUpdateQueueStore.setState({
        queue: [currentTask, pendingTask1, pendingTask2],
        isProcessing: true
      });

      formUpdateQueueStore.getState().replaceLatestFormUpdate(newTask);

      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(2);
      expect(state.queue[0]).toBe(currentTask); // Current task preserved
      expect(state.queue[1]).toBe(newTask); // New task replaces pending ones
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
      expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, 'initial');
      expect(mockUpdateExpressions).toHaveBeenCalledWith(task.questionnaireResponse);

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
      expect(mockUpdateResponse).toHaveBeenNthCalledWith(1, task1.questionnaireResponse, 'initial');
      expect(mockUpdateResponse).toHaveBeenNthCalledWith(2, task2.questionnaireResponse, 'initial');

      // Should clear queue and stop processing
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(0);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle async errors gracefully', async () => {
      const task = createMockTask('1');
      formUpdateQueueStore.setState({ queue: [task] });

      // Mock updateExpressions to reject with error (async error)
      mockUpdateExpressions.mockRejectedValue(new Error('Test error'));

      await formUpdateQueueStore.getState()._startProcessing();

      // Should still remove task and stop processing despite error
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(0);
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('useFormUpdateQueueStore selectors', () => {
    it('should export the store with selector interface', () => {
      // Test that the store exports the expected interface
      expect(useFormUpdateQueueStore).toBeDefined();
      expect(useFormUpdateQueueStore.use).toBeDefined();
      
      // Verify store state can be accessed directly (without React context)
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toBeDefined();
      expect(state.isProcessing).toBeDefined();
      expect(typeof state.enqueueFormUpdate).toBe('function');
      expect(typeof state.replaceLatestFormUpdate).toBe('function');
      expect(typeof state._startProcessing).toBe('function');
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

    it('should handle replace during processing', async () => {
      const task1 = createMockTask('1');
      const task2 = createMockTask('2');
      const task3 = createMockTask('3');

      // Make updateExpressions slow to simulate processing time
      let resolveUpdateExpressions: (value?: any) => void;
      let resolveCount = 0;
      mockUpdateExpressions.mockImplementation(
        () =>
          new Promise((resolve) => {
            if (resolveCount === 0) {
              resolveUpdateExpressions = resolve;
              resolveCount++;
            } else {
              // Second call resolves immediately to not block test
              resolve(undefined);
            }
          })
      );

      // Start processing first task
      formUpdateQueueStore.setState({ queue: [task1, task2] });
      const processingPromise = formUpdateQueueStore.getState()._startProcessing();

      // Wait for processing to start
      await waitFor(() => {
        expect(formUpdateQueueStore.getState().isProcessing).toBe(true);
      });

      // Replace while processing
      formUpdateQueueStore.getState().replaceLatestFormUpdate(task3);

      // Should preserve current task and replace pending
      const state = formUpdateQueueStore.getState();
      expect(state.queue).toHaveLength(2);
      expect(state.queue[0]).toBe(task1); // Current task
      expect(state.queue[1]).toBe(task3); // Replacement task

      // Complete processing
      resolveUpdateExpressions!();
      await processingPromise;

      // Should process replacement task - give it more time to complete
      await waitFor(
        () => {
          const finalState = formUpdateQueueStore.getState();
          expect(finalState.queue).toHaveLength(0);
          expect(finalState.isProcessing).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(mockUpdateExpressions).toHaveBeenCalledTimes(2); // task1 and task3, not task2
    });
  });

  describe('edge cases', () => {
    it('should handle task without targetItemPath', async () => {
      const task: UpdateTask = {
        questionnaireResponse: mockQuestionnaireResponse
        // No targetItemPath
      };

      formUpdateQueueStore.getState().enqueueFormUpdate(task);

      await waitFor(() => {
        expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, 'initial');
      });
    });

    it('should handle empty questionnaireResponse', async () => {
      const task: UpdateTask = {
        questionnaireResponse: {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress'
          // No items
        }
      };

      formUpdateQueueStore.getState().enqueueFormUpdate(task);

      await waitFor(() => {
        expect(mockUpdateResponse).toHaveBeenCalledWith(task.questionnaireResponse, 'initial');
      });
    });
  });
});
