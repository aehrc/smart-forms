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
import { QueryClient } from '@tanstack/react-query';
import useRendererQueryClient from '../hooks/useRendererQueryClient';

// Mock the QueryClient constructor
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  keepPreviousData: 'keepPreviousData'
}));

const MockedQueryClient = QueryClient as jest.MockedClass<typeof QueryClient>;

describe('useRendererQueryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock QueryClient constructor to return a mock instance
    MockedQueryClient.mockImplementation(
      () =>
        ({
          getQueryData: jest.fn(),
          setQueryData: jest.fn(),
          invalidateQueries: jest.fn(),
          clear: jest.fn()
        }) as any
    );
  });

  describe('basic functionality', () => {
    it('should create and return a QueryClient instance', () => {
      const { result } = renderHook(() => useRendererQueryClient());

      expect(MockedQueryClient).toHaveBeenCalled();
      expect(result.current).toBeDefined();
    });

    it('should configure QueryClient with correct default options', () => {
      renderHook(() => useRendererQueryClient());

      expect(MockedQueryClient).toHaveBeenCalledWith({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            placeholderData: 'keepPreviousData'
          }
        }
      });
    });

    it('should create a new QueryClient instance on each call', () => {
      const { result, rerender } = renderHook(() => useRendererQueryClient());

      const firstClient = result.current;

      rerender();

      const secondClient = result.current;

      expect(MockedQueryClient).toHaveBeenCalledTimes(2);
      // Each call should create a new instance
      expect(firstClient).toBeDefined();
      expect(secondClient).toBeDefined();
    });
  });

  describe('default options configuration', () => {
    it('should disable refetchOnWindowFocus', () => {
      renderHook(() => useRendererQueryClient());

      const callArgs = MockedQueryClient.mock.calls[0]?.[0];
      expect(callArgs?.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('should set placeholderData to keepPreviousData', () => {
      renderHook(() => useRendererQueryClient());

      const callArgs = MockedQueryClient.mock.calls[0]?.[0];
      expect(callArgs?.defaultOptions?.queries?.placeholderData).toBe('keepPreviousData');
    });

    it('should have queries configuration under defaultOptions', () => {
      renderHook(() => useRendererQueryClient());

      const callArgs = MockedQueryClient.mock.calls[0]?.[0];
      expect(callArgs?.defaultOptions).toHaveProperty('queries');
      expect(typeof callArgs?.defaultOptions?.queries).toBe('object');
    });
  });

  describe('QueryClient instance properties', () => {
    it('should return a valid QueryClient-like object', () => {
      const mockInstance = {
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
        clear: jest.fn(),
        getQueryCache: jest.fn(),
        getMutationCache: jest.fn()
      };

      MockedQueryClient.mockImplementation(() => mockInstance as any);

      const { result } = renderHook(() => useRendererQueryClient());

      expect(result.current).toBe(mockInstance);
    });

    it('should handle QueryClient constructor throwing error', () => {
      MockedQueryClient.mockImplementation(() => {
        throw new Error('QueryClient creation failed');
      });

      expect(() => {
        renderHook(() => useRendererQueryClient());
      }).toThrow('QueryClient creation failed');
    });
  });

  describe('multiple hook instances', () => {
    it('should create separate QueryClient instances for different hook calls', () => {
      const { result: result1 } = renderHook(() => useRendererQueryClient());
      const { result: result2 } = renderHook(() => useRendererQueryClient());

      expect(MockedQueryClient).toHaveBeenCalledTimes(2);
      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
    });

    it('should call QueryClient constructor with same configuration for each instance', () => {
      renderHook(() => useRendererQueryClient());
      renderHook(() => useRendererQueryClient());

      const expectedConfig = {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            placeholderData: 'keepPreviousData'
          }
        }
      };

      expect(MockedQueryClient).toHaveBeenNthCalledWith(1, expectedConfig);
      expect(MockedQueryClient).toHaveBeenNthCalledWith(2, expectedConfig);
    });
  });

  describe('configuration consistency', () => {
    it('should use consistent configuration across multiple calls', () => {
      const { rerender } = renderHook(() => useRendererQueryClient());

      const firstCallConfig = MockedQueryClient.mock.calls[0][0];

      rerender();

      const secondCallConfig = MockedQueryClient.mock.calls[1][0];

      expect(firstCallConfig).toEqual(secondCallConfig);
    });

    it('should maintain configuration structure', () => {
      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];

      expect(config).toHaveProperty('defaultOptions');
      expect(config?.defaultOptions).toHaveProperty('queries');
      expect(config?.defaultOptions?.queries).toHaveProperty('refetchOnWindowFocus');
      expect(config?.defaultOptions?.queries).toHaveProperty('placeholderData');
    });
  });

  describe('real-world usage scenarios', () => {
    it('should work in a typical React Query setup', () => {
      const mockQueryClientMethods = {
        getQueryData: jest.fn(),
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
        prefetchQuery: jest.fn(),
        fetchQuery: jest.fn(),
        clear: jest.fn()
      };

      MockedQueryClient.mockImplementation(() => mockQueryClientMethods as any);

      const { result } = renderHook(() => useRendererQueryClient());

      // Simulate typical QueryClient usage
      expect(result.current).toHaveProperty('getQueryData');
      expect(result.current).toHaveProperty('setQueryData');
      expect(result.current).toHaveProperty('invalidateQueries');
    });

    it('should support renderer-specific query patterns', () => {
      const { result } = renderHook(() => useRendererQueryClient());

      // The configuration should support renderer patterns
      const config = MockedQueryClient.mock.calls[0][0];

      // No window focus refetching for form renderers
      expect(config?.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);

      // Preserve previous data for better UX
      expect(config?.defaultOptions?.queries?.placeholderData).toBe('keepPreviousData');
    });

    it('should be suitable for terminology server queries', () => {
      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];

      // Configuration should be suitable for terminology lookups
      expect(config?.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config?.defaultOptions?.queries?.placeholderData).toBe('keepPreviousData');
    });
  });

  describe('error handling', () => {
    it('should handle keepPreviousData import issues', () => {
      // Test case where keepPreviousData might be undefined
      jest.doMock('@tanstack/react-query', () => ({
        QueryClient: jest.fn().mockImplementation(() => ({})),
        keepPreviousData: undefined
      }));

      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];
      expect(config?.defaultOptions?.queries?.placeholderData).toBe('keepPreviousData');
    });

    it('should handle partial configuration gracefully', () => {
      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];

      // Should not have mutations config by default
      expect(config?.defaultOptions?.mutations).toBeUndefined();

      // Should only configure queries
      expect(Object.keys(config?.defaultOptions || {})).toEqual(['queries']);
    });
  });

  describe('TypeScript compatibility', () => {
    it('should return properly typed QueryClient', () => {
      const { result } = renderHook(() => useRendererQueryClient());

      // In a real scenario, this would be a QueryClient instance
      // Here we're testing that our mock returns what we expect
      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
    });
  });

  describe('configuration customization potential', () => {
    it('should provide baseline configuration that can be extended', () => {
      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];

      // Verify structure allows for extension
      expect(config?.defaultOptions).toBeDefined();
      expect(config?.defaultOptions?.queries).toBeDefined();

      // These are the minimal required options for renderer
      expect(Object.keys(config?.defaultOptions?.queries || {})).toContain('refetchOnWindowFocus');
      expect(Object.keys(config?.defaultOptions?.queries || {})).toContain('placeholderData');
    });

    it('should use TanStack Query v5 compatible configuration', () => {
      renderHook(() => useRendererQueryClient());

      const config = MockedQueryClient.mock.calls[0][0];

      // Verify v5 compatible option names and values
      expect(config?.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config?.defaultOptions?.queries?.placeholderData).toBe('keepPreviousData');
    });
  });
});
