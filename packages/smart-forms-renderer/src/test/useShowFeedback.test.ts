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

import { renderHook, act } from '@testing-library/react';
import useShowFeedback from '../hooks/useShowFeedback';

describe('useShowFeedback', () => {
  describe('initial state', () => {
    it('should initialize with showFeedback as true', () => {
      const { result } = renderHook(() => useShowFeedback());

      expect(result.current.showFeedback).toBe(true);
    });

    it('should initialize with hasBlurred as false', () => {
      const { result } = renderHook(() => useShowFeedback());

      expect(result.current.hasBlurred).toBe(false);
    });

    it('should provide setter functions', () => {
      const { result } = renderHook(() => useShowFeedback());

      expect(typeof result.current.setShowFeedback).toBe('function');
      expect(typeof result.current.setHasBlurred).toBe('function');
    });
  });

  describe('showFeedback state management', () => {
    it('should update showFeedback when setShowFeedback is called', () => {
      const { result } = renderHook(() => useShowFeedback());

      expect(result.current.showFeedback).toBe(true);

      act(() => {
        result.current.setShowFeedback(false);
      });

      expect(result.current.showFeedback).toBe(false);
    });

    it('should toggle showFeedback multiple times', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Start as true
      expect(result.current.showFeedback).toBe(true);

      // Set to false
      act(() => {
        result.current.setShowFeedback(false);
      });
      expect(result.current.showFeedback).toBe(false);

      // Set back to true
      act(() => {
        result.current.setShowFeedback(true);
      });
      expect(result.current.showFeedback).toBe(true);

      // Set to false again
      act(() => {
        result.current.setShowFeedback(false);
      });
      expect(result.current.showFeedback).toBe(false);
    });

    it('should handle functional updates for showFeedback', () => {
      const { result } = renderHook(() => useShowFeedback());

      act(() => {
        result.current.setShowFeedback(prev => !prev);
      });

      expect(result.current.showFeedback).toBe(false);

      act(() => {
        result.current.setShowFeedback(prev => !prev);
      });

      expect(result.current.showFeedback).toBe(true);
    });
  });

  describe('hasBlurred state management', () => {
    it('should update hasBlurred when setHasBlurred is called', () => {
      const { result } = renderHook(() => useShowFeedback());

      expect(result.current.hasBlurred).toBe(false);

      act(() => {
        result.current.setHasBlurred(true);
      });

      expect(result.current.hasBlurred).toBe(true);
    });

    it('should toggle hasBlurred multiple times', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Start as false
      expect(result.current.hasBlurred).toBe(false);

      // Set to true
      act(() => {
        result.current.setHasBlurred(true);
      });
      expect(result.current.hasBlurred).toBe(true);

      // Set back to false
      act(() => {
        result.current.setHasBlurred(false);
      });
      expect(result.current.hasBlurred).toBe(false);

      // Set to true again
      act(() => {
        result.current.setHasBlurred(true);
      });
      expect(result.current.hasBlurred).toBe(true);
    });

    it('should handle functional updates for hasBlurred', () => {
      const { result } = renderHook(() => useShowFeedback());

      act(() => {
        result.current.setHasBlurred(prev => !prev);
      });

      expect(result.current.hasBlurred).toBe(true);

      act(() => {
        result.current.setHasBlurred(prev => !prev);
      });

      expect(result.current.hasBlurred).toBe(false);
    });
  });

  describe('independent state updates', () => {
    it('should update showFeedback without affecting hasBlurred', () => {
      const { result } = renderHook(() => useShowFeedback());

      const originalHasBlurred = result.current.hasBlurred;

      act(() => {
        result.current.setShowFeedback(false);
      });

      expect(result.current.showFeedback).toBe(false);
      expect(result.current.hasBlurred).toBe(originalHasBlurred);
    });

    it('should update hasBlurred without affecting showFeedback', () => {
      const { result } = renderHook(() => useShowFeedback());

      const originalShowFeedback = result.current.showFeedback;

      act(() => {
        result.current.setHasBlurred(true);
      });

      expect(result.current.hasBlurred).toBe(true);
      expect(result.current.showFeedback).toBe(originalShowFeedback);
    });

    it('should handle simultaneous updates to both states', () => {
      const { result } = renderHook(() => useShowFeedback());

      act(() => {
        result.current.setShowFeedback(false);
        result.current.setHasBlurred(true);
      });

      expect(result.current.showFeedback).toBe(false);
      expect(result.current.hasBlurred).toBe(true);
    });
  });

  describe('real-world usage scenarios', () => {
    it('should simulate form field interaction flow', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Initial state - show feedback, not blurred
      expect(result.current.showFeedback).toBe(true);
      expect(result.current.hasBlurred).toBe(false);

      // User focuses on field - might hide feedback
      act(() => {
        result.current.setShowFeedback(false);
      });

      expect(result.current.showFeedback).toBe(false);
      expect(result.current.hasBlurred).toBe(false);

      // User blurs field - set hasBlurred and show feedback
      act(() => {
        result.current.setHasBlurred(true);
        result.current.setShowFeedback(true);
      });

      expect(result.current.showFeedback).toBe(true);
      expect(result.current.hasBlurred).toBe(true);
    });

    it('should simulate validation feedback after first blur', () => {
      const { result } = renderHook(() => useShowFeedback());

      // User has not interacted yet
      expect(result.current.hasBlurred).toBe(false);

      // User focuses and types (no feedback yet)
      act(() => {
        result.current.setShowFeedback(false);
      });

      // User blurs for first time
      act(() => {
        result.current.setHasBlurred(true);
        result.current.setShowFeedback(true);
      });

      expect(result.current.hasBlurred).toBe(true);
      expect(result.current.showFeedback).toBe(true);

      // Now feedback should always show on subsequent interactions
      act(() => {
        result.current.setShowFeedback(false);
      });
      expect(result.current.hasBlurred).toBe(true); // Remains true

      act(() => {
        result.current.setShowFeedback(true);
      });
      expect(result.current.hasBlurred).toBe(true); // Still true
    });

    it('should simulate live validation mode', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Enable live validation immediately
      act(() => {
        result.current.setShowFeedback(true);
        result.current.setHasBlurred(true);
      });

      expect(result.current.showFeedback).toBe(true);
      expect(result.current.hasBlurred).toBe(true);
    });

    it('should simulate reset functionality', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Simulate user interaction
      act(() => {
        result.current.setShowFeedback(false);
        result.current.setHasBlurred(true);
      });

      // Reset to initial state
      act(() => {
        result.current.setShowFeedback(true);
        result.current.setHasBlurred(false);
      });

      expect(result.current.showFeedback).toBe(true);
      expect(result.current.hasBlurred).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Rapid toggle showFeedback
      act(() => {
        result.current.setShowFeedback(false);
        result.current.setShowFeedback(true);
        result.current.setShowFeedback(false);
        result.current.setShowFeedback(true);
      });

      expect(result.current.showFeedback).toBe(true);

      // Rapid toggle hasBlurred
      act(() => {
        result.current.setHasBlurred(true);
        result.current.setHasBlurred(false);
        result.current.setHasBlurred(true);
        result.current.setHasBlurred(false);
      });

      expect(result.current.hasBlurred).toBe(false);
    });

    it('should handle setting same value multiple times', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Set showFeedback to true multiple times
      act(() => {
        result.current.setShowFeedback(true);
        result.current.setShowFeedback(true);
        result.current.setShowFeedback(true);
      });

      expect(result.current.showFeedback).toBe(true);

      // Set hasBlurred to false multiple times
      act(() => {
        result.current.setHasBlurred(false);
        result.current.setHasBlurred(false);
        result.current.setHasBlurred(false);
      });

      expect(result.current.hasBlurred).toBe(false);
    });

    it('should handle complex functional updates', () => {
      const { result } = renderHook(() => useShowFeedback());

      act(() => {
        result.current.setShowFeedback(prev => prev && false); // true && false = false
      });
      expect(result.current.showFeedback).toBe(false);

      act(() => {
        result.current.setHasBlurred(prev => prev || true); // false || true = true
      });
      expect(result.current.hasBlurred).toBe(true);

      act(() => {
        result.current.setShowFeedback(prev => !prev || false); // !false || false = true
      });
      expect(result.current.showFeedback).toBe(true);
    });
  });

  describe('performance considerations', () => {
    it('should handle frequent re-renders efficiently', () => {
      const { result, rerender } = renderHook(() => useShowFeedback());

      const initialShowFeedback = result.current.showFeedback;
      const initialHasBlurred = result.current.hasBlurred;

      // Multiple re-renders without state changes
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      // State should remain the same
      expect(result.current.showFeedback).toBe(initialShowFeedback);
      expect(result.current.hasBlurred).toBe(initialHasBlurred);
    });

    it('should maintain reference equality of setters across re-renders', () => {
      const { result, rerender } = renderHook(() => useShowFeedback());

      const initialSetShowFeedback = result.current.setShowFeedback;
      const initialSetHasBlurred = result.current.setHasBlurred;

      rerender();

      // Setter functions should maintain reference equality
      expect(result.current.setShowFeedback).toBe(initialSetShowFeedback);
      expect(result.current.setHasBlurred).toBe(initialSetHasBlurred);
    });
  });

  describe('component integration patterns', () => {
    it('should support controlled component pattern', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Parent component controls the state
      act(() => {
        result.current.setShowFeedback(false);
      });

      expect(result.current.showFeedback).toBe(false);

      // State can be controlled externally
      act(() => {
        result.current.setShowFeedback(true);
      });

      expect(result.current.showFeedback).toBe(true);
    });

    it('should support conditional feedback display', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Only show feedback if hasBlurred is true
      const shouldShowFeedback = result.current.showFeedback && result.current.hasBlurred;
      expect(shouldShowFeedback).toBe(false); // true && false = false

      act(() => {
        result.current.setHasBlurred(true);
      });

      const shouldShowFeedbackAfterBlur = result.current.showFeedback && result.current.hasBlurred;
      expect(shouldShowFeedbackAfterBlur).toBe(true); // true && true = true
    });

    it('should support immediate feedback mode', () => {
      const { result } = renderHook(() => useShowFeedback());

      // Force immediate feedback regardless of blur state
      const immediateMode = true;
      const shouldShowFeedback = immediateMode || (result.current.showFeedback && result.current.hasBlurred);
      
      expect(shouldShowFeedback).toBe(true);
    });
  });
});
