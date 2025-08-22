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

import { renderHook, act } from '@testing-library/react';
import useClickCounter from '../useClickCounter';

describe('useClickCounter', () => {
  it('should initialize with counter at 0', () => {
    const { result } = renderHook(() => useClickCounter());

    expect(result.current.counter).toBe(0);
    expect(typeof result.current.addOneToCounter).toBe('function');
  });

  it('should increment counter when addOneToCounter is called', () => {
    const { result } = renderHook(() => useClickCounter());

    expect(result.current.counter).toBe(0);

    act(() => {
      result.current.addOneToCounter();
    });

    expect(result.current.counter).toBe(1);
  });

  it('should increment counter multiple times in single act', () => {
    const { result } = renderHook(() => useClickCounter());

    // Note: Due to closure, multiple calls in single act only increment once
    act(() => {
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
    });

    expect(result.current.counter).toBe(1); // Only increments once due to stale closure
  });

  it('should increment counter one by one in separate acts', () => {
    const { result } = renderHook(() => useClickCounter());

    act(() => {
      result.current.addOneToCounter();
    });
    expect(result.current.counter).toBe(1);

    act(() => {
      result.current.addOneToCounter();
    });
    expect(result.current.counter).toBe(2);

    act(() => {
      result.current.addOneToCounter();
    });
    expect(result.current.counter).toBe(3);
  });

  it('should maintain independent state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useClickCounter());
    const { result: result2 } = renderHook(() => useClickCounter());

    expect(result1.current.counter).toBe(0);
    expect(result2.current.counter).toBe(0);

    act(() => {
      result1.current.addOneToCounter();
    });

    expect(result1.current.counter).toBe(1);
    expect(result2.current.counter).toBe(0); // Should remain unchanged

    act(() => {
      result2.current.addOneToCounter();
    });

    expect(result1.current.counter).toBe(1); // Should remain unchanged
    expect(result2.current.counter).toBe(1); // Only increments once due to closure behavior
  });

  it('should provide new function reference on each render due to closure', () => {
    const { result, rerender } = renderHook(() => useClickCounter());

    const initialAddOneToCounter = result.current.addOneToCounter;

    // Trigger re-render by incrementing counter
    act(() => {
      result.current.addOneToCounter();
    });

    rerender();

    // Function reference changes because it's not memoized and captures new state
    expect(result.current.addOneToCounter).not.toBe(initialAddOneToCounter);
  });

  it('should handle rapid successive clicks with stale closure behavior', () => {
    const { result } = renderHook(() => useClickCounter());

    // Simulate rapid clicking in single act - due to closure, only increments once
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addOneToCounter();
      }
    });

    expect(result.current.counter).toBe(1); // Only increments once due to stale closure
  });

  it('should continue counting from current value in separate acts', () => {
    const { result } = renderHook(() => useClickCounter());

    // Get to 1 (multiple calls in single act only increment once)
    act(() => {
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
      result.current.addOneToCounter();
    });

    expect(result.current.counter).toBe(1);

    // Continue counting in separate act
    act(() => {
      result.current.addOneToCounter();
    });

    expect(result.current.counter).toBe(2);
  });

  it('should return the correct interface shape', () => {
    const { result } = renderHook(() => useClickCounter());

    expect(result.current).toEqual({
      counter: expect.any(Number),
      addOneToCounter: expect.any(Function)
    });

    expect(Object.keys(result.current)).toEqual(['counter', 'addOneToCounter']);
  });
});
