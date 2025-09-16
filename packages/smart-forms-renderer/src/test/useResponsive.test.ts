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
import type { Breakpoint } from '@mui/material/styles';
import useResponsive, { type UseResponsiveProps } from '../hooks/useResponsive';

// Mock MUI hooks and theme
const mockUseTheme = jest.fn();
const mockUseMediaQuery = jest.fn();

// Mock theme breakpoints
const mockBreakpoints = {
  up: jest.fn(),
  down: jest.fn(),
  between: jest.fn(),
  only: jest.fn()
};

const mockTheme = {
  breakpoints: mockBreakpoints
};

jest.mock('@mui/material/styles', () => ({
  useTheme: () => mockUseTheme()
}));

jest.mock(
  '@mui/material/useMediaQuery',
  () =>
    (...args: any[]) =>
      mockUseMediaQuery(...args)
);

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseTheme.mockReturnValue(mockTheme);
    mockUseMediaQuery.mockReturnValue(false);

    // Mock breakpoint methods to return query strings
    mockBreakpoints.up.mockImplementation((bp: Breakpoint) => `(min-width: ${bp})`);
    mockBreakpoints.down.mockImplementation((bp: Breakpoint) => `(max-width: ${bp})`);
    mockBreakpoints.between.mockImplementation(
      (start: Breakpoint, end: Breakpoint) => `(min-width: ${start}) and (max-width: ${end})`
    );
    mockBreakpoints.only.mockImplementation((bp: Breakpoint) => `(breakpoint: ${bp})`);
  });

  describe('query type: "up"', () => {
    it('should return true when "up" query matches', () => {
      // Mock only the "up" media query to return true
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(min-width: md)') return true;
        return false;
      });

      const props: UseResponsiveProps = {
        query: 'up',
        start: 'md'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.up).toHaveBeenCalledWith('md');
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(min-width: md)');
    });

    it('should return false when "up" query does not match', () => {
      mockUseMediaQuery.mockReturnValue(false);

      const props: UseResponsiveProps = {
        query: 'up',
        start: 'lg'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(false);
      expect(mockBreakpoints.up).toHaveBeenCalledWith('lg');
    });

    it('should work with all breakpoint sizes for "up" query', () => {
      const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

      breakpoints.forEach((breakpoint) => {
        mockUseMediaQuery.mockImplementation(
          (query: string) => query === `(min-width: ${breakpoint})`
        );

        const props: UseResponsiveProps = {
          query: 'up',
          start: breakpoint
        };

        const { result } = renderHook(() => useResponsive(props));

        expect(result.current).toBe(true);
        expect(mockBreakpoints.up).toHaveBeenCalledWith(breakpoint);
      });
    });
  });

  describe('query type: "down"', () => {
    it('should return true when "down" query matches', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: sm)') return true;
        return false;
      });

      const props: UseResponsiveProps = {
        query: 'down',
        start: 'sm'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.down).toHaveBeenCalledWith('sm');
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(max-width: sm)');
    });

    it('should return false when "down" query does not match', () => {
      mockUseMediaQuery.mockReturnValue(false);

      const props: UseResponsiveProps = {
        query: 'down',
        start: 'md'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(false);
      expect(mockBreakpoints.down).toHaveBeenCalledWith('md');
    });

    it('should work with all breakpoint sizes for "down" query', () => {
      const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

      breakpoints.forEach((breakpoint) => {
        mockUseMediaQuery.mockImplementation(
          (query: string) => query === `(max-width: ${breakpoint})`
        );

        const props: UseResponsiveProps = {
          query: 'down',
          start: breakpoint
        };

        const { result } = renderHook(() => useResponsive(props));

        expect(result.current).toBe(true);
        expect(mockBreakpoints.down).toHaveBeenCalledWith(breakpoint);
      });
    });
  });

  describe('query type: "between"', () => {
    it('should return true when "between" query matches', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(min-width: sm) and (max-width: lg)') return true;
        return false;
      });

      const props: UseResponsiveProps = {
        query: 'between',
        start: 'sm',
        end: 'lg'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.between).toHaveBeenCalledWith('sm', 'lg');
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(min-width: sm) and (max-width: lg)');
    });

    it('should return false when "between" query does not match', () => {
      mockUseMediaQuery.mockReturnValue(false);

      const props: UseResponsiveProps = {
        query: 'between',
        start: 'md',
        end: 'xl'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(false);
      expect(mockBreakpoints.between).toHaveBeenCalledWith('md', 'xl');
    });

    it('should use default end value "xl" when end is not provided', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(min-width: md) and (max-width: xl)') return true;
        return false;
      });

      const props: UseResponsiveProps = {
        query: 'between',
        start: 'md'
        // No end specified, should default to 'xl'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.between).toHaveBeenCalledWith('md', 'xl');
    });

    it('should work with various breakpoint combinations', () => {
      const combinations = [
        { start: 'xs' as Breakpoint, end: 'sm' as Breakpoint },
        { start: 'sm' as Breakpoint, end: 'md' as Breakpoint },
        { start: 'md' as Breakpoint, end: 'lg' as Breakpoint },
        { start: 'lg' as Breakpoint, end: 'xl' as Breakpoint },
        { start: 'xs' as Breakpoint, end: 'xl' as Breakpoint }
      ];

      combinations.forEach(({ start, end }) => {
        mockUseMediaQuery.mockImplementation(
          (query: string) => query === `(min-width: ${start}) and (max-width: ${end})`
        );

        const props: UseResponsiveProps = {
          query: 'between',
          start,
          end
        };

        const { result } = renderHook(() => useResponsive(props));

        expect(result.current).toBe(true);
        expect(mockBreakpoints.between).toHaveBeenCalledWith(start, end);
      });
    });
  });

  describe('query type: "only"', () => {
    it('should return true when "only" query matches', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(breakpoint: md)') return true;
        return false;
      });

      const props: UseResponsiveProps = {
        query: 'only',
        start: 'md'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.only).toHaveBeenCalledWith('md');
      expect(mockUseMediaQuery).toHaveBeenCalledWith('(breakpoint: md)');
    });

    it('should return false when "only" query does not match', () => {
      mockUseMediaQuery.mockReturnValue(false);

      const props: UseResponsiveProps = {
        query: 'only',
        start: 'lg'
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(false);
      expect(mockBreakpoints.only).toHaveBeenCalledWith('lg');
    });

    it('should work with all breakpoint sizes for "only" query', () => {
      const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

      breakpoints.forEach((breakpoint) => {
        mockUseMediaQuery.mockImplementation(
          (query: string) => query === `(breakpoint: ${breakpoint})`
        );

        const props: UseResponsiveProps = {
          query: 'only',
          start: breakpoint
        };

        const { result } = renderHook(() => useResponsive(props));

        expect(result.current).toBe(true);
        expect(mockBreakpoints.only).toHaveBeenCalledWith(breakpoint);
      });
    });
  });

  describe('default behavior and fallbacks', () => {
    it('should default to "only" query when query type is unrecognized', () => {
      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(breakpoint: sm)') return true;
        return false;
      });

      // Type assertion to test invalid query type
      const props = {
        query: 'invalid' as any,
        start: 'sm' as Breakpoint
      };

      const { result } = renderHook(() => useResponsive(props));

      expect(result.current).toBe(true);
      expect(mockBreakpoints.only).toHaveBeenCalledWith('sm');
    });

    it('should handle theme integration correctly', () => {
      const props: UseResponsiveProps = {
        query: 'up',
        start: 'md'
      };

      renderHook(() => useResponsive(props));

      expect(mockUseTheme).toHaveBeenCalled();
      expect(mockBreakpoints.up).toHaveBeenCalledWith('md');
    });
  });

  describe('multiple media queries registration', () => {
    it('should register all media queries regardless of the selected query type', () => {
      const props: UseResponsiveProps = {
        query: 'up',
        start: 'md',
        end: 'lg'
      };

      renderHook(() => useResponsive(props));

      // All breakpoint methods should be called to register media queries
      expect(mockBreakpoints.up).toHaveBeenCalledWith('md');
      expect(mockBreakpoints.down).toHaveBeenCalledWith('md');
      expect(mockBreakpoints.between).toHaveBeenCalledWith('md', 'lg');
      expect(mockBreakpoints.only).toHaveBeenCalledWith('md');

      // All useMediaQuery calls should be made
      expect(mockUseMediaQuery).toHaveBeenCalledTimes(4);
    });

    it('should use end parameter for between query only', () => {
      const props: UseResponsiveProps = {
        query: 'between',
        start: 'sm',
        end: 'lg'
      };

      renderHook(() => useResponsive(props));

      expect(mockBreakpoints.between).toHaveBeenCalledWith('sm', 'lg');
    });

    it('should ignore end parameter for non-between queries', () => {
      const props: UseResponsiveProps = {
        query: 'up',
        start: 'md',
        end: 'lg' // This should be ignored for 'up' query
      };

      renderHook(() => useResponsive(props));

      expect(mockBreakpoints.up).toHaveBeenCalledWith('md');
      // Between should still be called with end parameter due to how the hook is structured
      expect(mockBreakpoints.between).toHaveBeenCalledWith('md', 'lg');
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle rapid re-renders with different props', () => {
      const { result, rerender } = renderHook(
        ({ props }: { props: UseResponsiveProps }) => useResponsive(props),
        {
          initialProps: {
            props: { query: 'up', start: 'md' } as UseResponsiveProps
          }
        }
      );

      mockUseMediaQuery.mockReturnValue(true);

      // Change to down query
      rerender({
        props: { query: 'down', start: 'sm' } as UseResponsiveProps
      });

      expect(result.current).toBe(true);
      expect(mockBreakpoints.down).toHaveBeenCalledWith('sm');
    });

    it('should handle custom breakpoints (if supported by theme)', () => {
      // Mock custom breakpoint
      const customBreakpoint = 'tablet' as Breakpoint;

      const props: UseResponsiveProps = {
        query: 'up',
        start: customBreakpoint
      };

      renderHook(() => useResponsive(props));

      expect(mockBreakpoints.up).toHaveBeenCalledWith(customBreakpoint);
    });

    it('should maintain consistent behavior across multiple hook instances', () => {
      const props1: UseResponsiveProps = { query: 'up', start: 'md' };
      const props2: UseResponsiveProps = { query: 'down', start: 'lg' };

      mockUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(min-width: md)') return true;
        if (query === '(max-width: lg)') return false;
        return false;
      });

      const { result: result1 } = renderHook(() => useResponsive(props1));
      const { result: result2 } = renderHook(() => useResponsive(props2));

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
    });
  });

  describe('performance and optimization', () => {
    it('should call useMediaQuery for each breakpoint type', () => {
      const props: UseResponsiveProps = {
        query: 'up',
        start: 'md'
      };

      renderHook(() => useResponsive(props));

      // Should call useMediaQuery 4 times (up, down, between, only)
      expect(mockUseMediaQuery).toHaveBeenCalledTimes(4);
    });

    it('should call theme breakpoint methods correctly', () => {
      const props: UseResponsiveProps = {
        query: 'between',
        start: 'sm',
        end: 'lg'
      };

      renderHook(() => useResponsive(props));

      expect(mockBreakpoints.up).toHaveBeenCalledTimes(1);
      expect(mockBreakpoints.down).toHaveBeenCalledTimes(1);
      expect(mockBreakpoints.between).toHaveBeenCalledTimes(1);
      expect(mockBreakpoints.only).toHaveBeenCalledTimes(1);
    });
  });
});
