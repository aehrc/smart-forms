/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { act, renderHook } from '@testing-library/react';
import useDebounce from '../hooks/useDebounce';

// Mock timers for controlled testing
jest.useFakeTimers();

describe('useDebounce', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('initial value and basic functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should return updated value after delay', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 }
      });

      expect(result.current).toBe('initial');

      // Update the value
      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial'); // Should still be initial

      // Advance timers by the delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle empty string values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: '', delay: 300 }
      });

      expect(result.current).toBe('');

      rerender({ value: 'new value', delay: 300 });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('new value');
    });
  });

  describe('delay behavior', () => {
    it('should respect different delay values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 1000 }
      });

      rerender({ value: 'updated', delay: 1000 });

      // Should not update before delay
      act(() => {
        jest.advanceTimersByTime(999);
      });
      expect(result.current).toBe('initial');

      // Should update after delay
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 0 }
      });

      rerender({ value: 'immediate', delay: 0 });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('immediate');
    });

    it('should handle very small delays', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 1 }
      });

      rerender({ value: 'fast', delay: 1 });

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('fast');
    });

    it('should handle large delays', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 10000 }
      });

      rerender({ value: 'slow', delay: 10000 });

      act(() => {
        jest.advanceTimersByTime(9999);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('slow');
    });
  });

  describe('debouncing behavior', () => {
    it('should cancel previous timeout when value changes rapidly', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 }
      });

      // Rapid changes
      rerender({ value: 'change1', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'change2', delay: 500 });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'final', delay: 500 });

      // Only the final value should be set after full delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('final');
    });

    it('should handle multiple rapid updates correctly', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'start', delay: 300 }
      });

      // Simulate rapid typing
      const updates = ['s', 'se', 'sea', 'sear', 'searc', 'search'];

      updates.forEach((update, index) => {
        rerender({ value: update, delay: 300 });
        if (index < updates.length - 1) {
          act(() => {
            jest.advanceTimersByTime(50); // Fast updates
          });
        }
      });

      // Should still show original value
      expect(result.current).toBe('start');

      // After full delay, should show final value
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('search');
    });
  });

  describe('delay change handling', () => {
    it('should restart timeout when delay changes', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 }
      });

      rerender({ value: 'updated', delay: 500 });

      // Advance partway through original delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Change delay - should restart timeout
      rerender({ value: 'updated', delay: 200 });

      // After new delay, should trigger
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('updated');
    });

    it('should handle delay changing to shorter value', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 1000 }
      });

      rerender({ value: 'updated', delay: 1000 });

      // Change to shorter delay
      rerender({ value: 'updated', delay: 100 });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('edge cases', () => {
    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'same', delay: 300 }
      });

      // Update with same value
      rerender({ value: 'same', delay: 300 });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('same');
    });

    it('should handle whitespace and special characters', () => {
      const specialValues = ['  spaces  ', '\t\n', 'special@#$%', '🎉 emoji'];

      specialValues.forEach((specialValue) => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
          initialProps: { value: 'initial', delay: 100 }
        });

        rerender({ value: specialValue, delay: 100 });

        act(() => {
          jest.advanceTimersByTime(100);
        });

        expect(result.current).toBe(specialValue);
      });
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'short', delay: 100 }
      });

      rerender({ value: longString, delay: 100 });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe(longString);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should simulate search input debouncing', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: '', delay: 300 }
      });

      // Simulate user typing "react"
      const searchTerms = ['r', 're', 'rea', 'reac', 'react'];

      searchTerms.forEach((term, index) => {
        rerender({ value: term, delay: 300 });

        if (index < searchTerms.length - 1) {
          // User continues typing quickly
          act(() => {
            jest.advanceTimersByTime(100);
          });
        }
      });

      // Should still show initial value while typing
      expect(result.current).toBe('');

      // After user stops typing for 300ms
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('react');
    });

    it('should simulate API call optimization', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial query', delay: 500 }
      });

      // Rapid API query changes
      const queries = ['user input 1', 'user input 12', 'user input 123'];

      queries.forEach((query) => {
        rerender({ value: query, delay: 500 });
        act(() => {
          jest.advanceTimersByTime(100); // Quick changes
        });
      });

      // Should debounce and only trigger final API call
      expect(result.current).toBe('initial query');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('user input 123');
    });
  });

  describe('performance considerations', () => {
    it('should handle frequent value updates efficiently', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'start', delay: 100 }
      });

      // Simulate 100 rapid updates
      for (let i = 0; i < 100; i++) {
        rerender({ value: `update-${i}`, delay: 100 });
        act(() => {
          jest.advanceTimersByTime(1); // Very rapid updates
        });
      }

      // Should still be at start value
      expect(result.current).toBe('start');

      // Final update should apply after delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('update-99');
    });
  });
});
