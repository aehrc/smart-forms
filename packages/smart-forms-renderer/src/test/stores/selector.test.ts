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
import { createSelectors } from '../../stores/selector';
import { renderHook, act } from '@testing-library/react';

// Create a test store to test the selector functionality
interface TestStoreType {
  count: number;
  name: string;
  isActive: boolean;
  increment: () => void;
  setName: (name: string) => void;
  toggle: () => void;
}

const createTestStore = () => createStore<TestStoreType>()((set) => ({
  count: 0,
  name: 'test',
  isActive: false,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setName: (name: string) => set(() => ({ name })),
  toggle: () => set((state) => ({ isActive: !state.isActive }))
}));

describe('createSelectors', () => {
  let testStore: ReturnType<typeof createTestStore>;
  let testStoreWithSelectors: ReturnType<typeof createSelectors<ReturnType<typeof createTestStore>>>;

  beforeEach(() => {
    testStore = createTestStore();
    testStoreWithSelectors = createSelectors(testStore);
  });

  describe('store enhancement', () => {
    it('should add use property to the store', () => {
      expect(testStoreWithSelectors.use).toBeDefined();
      expect(typeof testStoreWithSelectors.use).toBe('object');
    });

    it('should preserve original store functionality', () => {
      expect(testStoreWithSelectors.getState).toBeDefined();
      expect(testStoreWithSelectors.setState).toBeDefined();
      expect(testStoreWithSelectors.subscribe).toBeDefined();
    });

    it('should create selectors for all state properties', () => {
      const state = testStore.getState();
      const stateKeys = Object.keys(state);
      
      stateKeys.forEach(key => {
        expect(testStoreWithSelectors.use[key as keyof typeof testStoreWithSelectors.use]).toBeDefined();
        expect(typeof testStoreWithSelectors.use[key as keyof typeof testStoreWithSelectors.use]).toBe('function');
      });
    });
  });

  describe('selector hooks', () => {
    it('should return current state values through selectors', () => {
      const { result: countResult } = renderHook(() => testStoreWithSelectors.use.count());
      const { result: nameResult } = renderHook(() => testStoreWithSelectors.use.name());
      const { result: isActiveResult } = renderHook(() => testStoreWithSelectors.use.isActive());

      expect(countResult.current).toBe(0);
      expect(nameResult.current).toBe('test');
      expect(isActiveResult.current).toBe(false);
    });

    it('should return function references through selectors', () => {
      const { result: incrementResult } = renderHook(() => testStoreWithSelectors.use.increment());
      const { result: setNameResult } = renderHook(() => testStoreWithSelectors.use.setName());
      const { result: toggleResult } = renderHook(() => testStoreWithSelectors.use.toggle());

      expect(typeof incrementResult.current).toBe('function');
      expect(typeof setNameResult.current).toBe('function');
      expect(typeof toggleResult.current).toBe('function');
    });

    it('should react to state changes', () => {
      const { result: countResult, rerender } = renderHook(() => testStoreWithSelectors.use.count());
      
      expect(countResult.current).toBe(0);
      
      // Change the state
      act(() => {
        testStore.getState().increment();
      });
      rerender();
      
      expect(countResult.current).toBe(1);
    });

    it('should handle multiple state changes correctly', () => {
      const { result: countResult, rerender: rerenderCount } = renderHook(() => testStoreWithSelectors.use.count());
      const { result: nameResult, rerender: rerenderName } = renderHook(() => testStoreWithSelectors.use.name());
      const { result: isActiveResult, rerender: rerenderIsActive } = renderHook(() => testStoreWithSelectors.use.isActive());

      // Initial values
      expect(countResult.current).toBe(0);
      expect(nameResult.current).toBe('test');
      expect(isActiveResult.current).toBe(false);

      // Change multiple properties
      act(() => {
        testStore.getState().increment();
        testStore.getState().setName('updated');
        testStore.getState().toggle();
      });

      // Rerender all hooks
      rerenderCount();
      rerenderName();
      rerenderIsActive();

      // Check updated values
      expect(countResult.current).toBe(1);
      expect(nameResult.current).toBe('updated');
      expect(isActiveResult.current).toBe(true);
    });
  });

  describe('selector isolation', () => {
    it('should correctly subscribe to state changes', () => {
      const countSubscriber = jest.fn();
      const nameSubscriber = jest.fn();

      // Subscribe directly to the store
      const unsubscribe = testStore.subscribe((state, prevState) => {
        if (state.count !== prevState.count) {
          countSubscriber();
        }
        if (state.name !== prevState.name) {
          nameSubscriber();
        }
      });

      // Change only the count
      act(() => {
        testStore.getState().increment();
      });

      expect(countSubscriber).toHaveBeenCalledTimes(1);
      expect(nameSubscriber).toHaveBeenCalledTimes(0);

      unsubscribe();
    });
  });

  describe('edge cases', () => {
    it('should handle empty store', () => {
      const emptyStore = createStore(() => ({}));
      const emptyStoreWithSelectors = createSelectors(emptyStore);
      
      expect(emptyStoreWithSelectors.use).toBeDefined();
      expect(Object.keys(emptyStoreWithSelectors.use)).toHaveLength(0);
    });

    it('should handle store with only functions', () => {
      const functionsOnlyStore = createStore(() => ({
        doSomething: () => 'done',
        doSomethingElse: () => 'also done'
      }));
      
      const functionsOnlyStoreWithSelectors = createSelectors(functionsOnlyStore);
      
      expect(functionsOnlyStoreWithSelectors.use.doSomething).toBeDefined();
      expect(functionsOnlyStoreWithSelectors.use.doSomethingElse).toBeDefined();
      
      const { result: doSomethingResult } = renderHook(() => functionsOnlyStoreWithSelectors.use.doSomething());
      expect(typeof doSomethingResult.current).toBe('function');
    });
  });
});
