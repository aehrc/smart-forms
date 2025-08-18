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

import { renderHook } from '@testing-library/react';
import UseFileDrop from '../hooks/UseFileDrop';

// Mock react-dnd and related modules
const mockUseDrop = jest.fn();
const mockDrop = jest.fn();
const mockMonitor = {
  isOver: jest.fn(),
  canDrop: jest.fn()
};

jest.mock('react-dnd', () => ({
  useDrop: (...args: any[]) => mockUseDrop(...args)
}));

jest.mock('react-dnd-html5-backend', () => ({
  NativeTypes: {
    FILE: 'FILE'
  }
}));

describe('UseFileDrop', () => {
  const mockOnDrop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useDrop
    mockUseDrop.mockImplementation((callback) => {
      const config = callback();
      return [
        {
          canDrop: mockMonitor.canDrop(),
          isOver: mockMonitor.isOver()
        },
        mockDrop
      ];
    });

    // Default monitor states
    mockMonitor.isOver.mockReturnValue(false);
    mockMonitor.canDrop.mockReturnValue(false);
  });

  describe('basic initialization', () => {
    it('should initialize with correct default states', () => {
      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.canDrop).toBe(false);
      expect(result.current.isOver).toBe(false);
      expect(result.current.dropTarget).toBe(mockDrop);
    });

    it('should call useDrop with correct configuration', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      expect(mockUseDrop).toHaveBeenCalledWith(
        expect.any(Function),
        [mockOnDrop]
      );
    });

    it('should configure useDrop to accept FILE type', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      expect(config.accept).toEqual(['FILE']);
    });
  });

  describe('drag and drop states', () => {
    it('should reflect isOver state from monitor', () => {
      mockMonitor.isOver.mockReturnValue(true);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(true);
    });

    it('should reflect canDrop state from monitor', () => {
      mockMonitor.canDrop.mockReturnValue(true);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.canDrop).toBe(true);
    });

    it('should reflect both states when both are true', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(true);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(true);
      expect(result.current.canDrop).toBe(true);
    });

    it('should handle mixed states correctly', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(false);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(true);
      expect(result.current.canDrop).toBe(false);
    });
  });

  describe('canDrop function', () => {
    it('should configure canDrop to always return true', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      expect(config.canDrop()).toBe(true);
    });
  });

  describe('drop function', () => {
    it('should call onDrop when drop occurs', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'test.txt' }] };
      config.drop(mockItem);

      expect(mockOnDrop).toHaveBeenCalledWith(mockItem);
    });

    it('should not call onDrop when onDrop is null', () => {
      renderHook(() => UseFileDrop(null as any));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'test.txt' }] };
      
      // Should not throw when onDrop is null
      expect(() => config.drop(mockItem)).not.toThrow();
    });

    it('should not call onDrop when onDrop is undefined', () => {
      renderHook(() => UseFileDrop(undefined as any));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'test.txt' }] };
      
      // Should not throw when onDrop is undefined
      expect(() => config.drop(mockItem)).not.toThrow();
    });

    it('should handle drop with empty files array', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [] };
      config.drop(mockItem);

      expect(mockOnDrop).toHaveBeenCalledWith(mockItem);
    });

    it('should handle drop with multiple files', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = {
        files: [
          { name: 'file1.txt', size: 100 },
          { name: 'file2.pdf', size: 200 },
          { name: 'file3.jpg', size: 300 }
        ]
      };
      config.drop(mockItem);

      expect(mockOnDrop).toHaveBeenCalledWith(mockItem);
    });
  });

  describe('collect function', () => {
    it('should collect isOver and canDrop from monitor', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(false);

      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const collected = config.collect(mockMonitor);

      expect(collected).toEqual({
        isOver: true,
        canDrop: false
      });
    });

    it('should call monitor methods correctly', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      config.collect(mockMonitor);

      expect(mockMonitor.isOver).toHaveBeenCalled();
      expect(mockMonitor.canDrop).toHaveBeenCalled();
    });
  });

  describe('dependency array', () => {
    it('should pass onDrop in dependency array to useDrop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      expect(mockUseDrop).toHaveBeenCalledWith(
        expect.any(Function),
        [mockOnDrop]
      );
    });

    it('should update dependencies when onDrop changes', () => {
      const { rerender } = renderHook(
        ({ onDrop }) => UseFileDrop(onDrop),
        { initialProps: { onDrop: mockOnDrop } }
      );

      const newOnDrop = jest.fn();
      rerender({ onDrop: newOnDrop });

      // Should have been called twice - initial and after rerender
      expect(mockUseDrop).toHaveBeenCalledTimes(2);
      expect(mockUseDrop).toHaveBeenLastCalledWith(
        expect.any(Function),
        [newOnDrop]
      );
    });
  });

  describe('real-world file drop scenarios', () => {
    it('should handle single file drop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const singleFile = {
        files: [{
          name: 'document.pdf',
          size: 1024,
          type: 'application/pdf',
          lastModified: Date.now()
        }]
      };

      config.drop(singleFile);

      expect(mockOnDrop).toHaveBeenCalledWith(singleFile);
    });

    it('should handle image file drop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const imageFile = {
        files: [{
          name: 'photo.jpg',
          size: 2048,
          type: 'image/jpeg'
        }]
      };

      config.drop(imageFile);

      expect(mockOnDrop).toHaveBeenCalledWith(imageFile);
    });

    it('should handle large file drop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const largeFile = {
        files: [{
          name: 'large-video.mp4',
          size: 1024 * 1024 * 100, // 100MB
          type: 'video/mp4'
        }]
      };

      config.drop(largeFile);

      expect(mockOnDrop).toHaveBeenCalledWith(largeFile);
    });

    it('should handle file drop with special characters in name', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const specialFile = {
        files: [{
          name: 'file with spaces & special chars (1).txt',
          size: 512
        }]
      };

      config.drop(specialFile);

      expect(mockOnDrop).toHaveBeenCalledWith(specialFile);
    });
  });

  describe('drag states simulation', () => {
    it('should handle drag enter state', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(true);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(true);
      expect(result.current.canDrop).toBe(true);
    });

    it('should handle drag leave state', () => {
      mockMonitor.isOver.mockReturnValue(false);
      mockMonitor.canDrop.mockReturnValue(true);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(false);
      expect(result.current.canDrop).toBe(true);
    });

    it('should handle invalid drag item state', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(false);

      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current.isOver).toBe(true);
      expect(result.current.canDrop).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle onDrop throwing error gracefully', () => {
      const errorOnDrop = jest.fn().mockImplementation(() => {
        throw new Error('Drop handler error');
      });

      renderHook(() => UseFileDrop(errorOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'test.txt' }] };

      expect(() => config.drop(mockItem)).toThrow('Drop handler error');
      expect(errorOnDrop).toHaveBeenCalledWith(mockItem);
    });

    it('should handle malformed item in drop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const malformedItem = { notFiles: 'invalid' } as any;
      config.drop(malformedItem);

      expect(mockOnDrop).toHaveBeenCalledWith(malformedItem);
    });

    it('should handle null item in drop', () => {
      renderHook(() => UseFileDrop(mockOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      config.drop(null as any);

      expect(mockOnDrop).toHaveBeenCalledWith(null);
    });
  });

  describe('return value structure', () => {
    it('should return correct interface structure', () => {
      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      expect(result.current).toHaveProperty('canDrop');
      expect(result.current).toHaveProperty('isOver');
      expect(result.current).toHaveProperty('dropTarget');

      expect(typeof result.current.canDrop).toBe('boolean');
      expect(typeof result.current.isOver).toBe('boolean');
      expect(result.current.dropTarget).toBe(mockDrop);
    });

    it('should provide dropTarget reference for component attachment', () => {
      const { result } = renderHook(() => UseFileDrop(mockOnDrop));

      // The dropTarget should be the same reference returned by useDrop
      expect(result.current.dropTarget).toBe(mockDrop);
    });
  });

  describe('performance considerations', () => {
    it('should maintain dropTarget reference across re-renders with same onDrop', () => {
      const { result, rerender } = renderHook(
        ({ onDrop }) => UseFileDrop(onDrop),
        { initialProps: { onDrop: mockOnDrop } }
      );

      const initialDropTarget = result.current.dropTarget;

      // Re-render with same onDrop
      rerender({ onDrop: mockOnDrop });

      // useDrop should manage reference stability based on dependencies
      expect(result.current.dropTarget).toBe(mockDrop);
    });

    it('should handle frequent state updates efficiently', () => {
      mockMonitor.isOver.mockReturnValue(true);
      mockMonitor.canDrop.mockReturnValue(true);

      const { result, rerender } = renderHook(() => UseFileDrop(mockOnDrop));

      // Multiple re-renders should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      expect(result.current.isOver).toBe(true);
      expect(result.current.canDrop).toBe(true);
    });
  });

  describe('component integration patterns', () => {
    it('should support conditional drop handling', () => {
      let shouldAcceptDrop = true;
      const conditionalOnDrop = jest.fn((item) => {
        if (shouldAcceptDrop) {
          // Process the drop
          return item;
        }
      });

      renderHook(() => UseFileDrop(conditionalOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'test.txt' }] };
      config.drop(mockItem);

      expect(conditionalOnDrop).toHaveBeenCalledWith(mockItem);

      // Change condition
      shouldAcceptDrop = false;
      config.drop(mockItem);

      expect(conditionalOnDrop).toHaveBeenCalledTimes(2);
    });

    it('should support async drop handling', () => {
      const asyncOnDrop = jest.fn(async (item) => {
        await new Promise(resolve => setTimeout(resolve, 0));
        return item;
      });

      renderHook(() => UseFileDrop(asyncOnDrop));

      const configCallback = mockUseDrop.mock.calls[0][0];
      const config = configCallback();

      const mockItem = { files: [{ name: 'async-test.txt' }] };
      config.drop(mockItem);

      expect(asyncOnDrop).toHaveBeenCalledWith(mockItem);
    });
  });
});
