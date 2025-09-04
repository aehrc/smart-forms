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
import type { GroupTableRowModel } from '../interfaces/groupTable.interface';
import useGroupTableRows from '../hooks/useGroupTableRows';

describe('useGroupTableRows', () => {
  // Test data
  const mockRow1: GroupTableRowModel = {
    id: 'row-1',
    qrItem: { linkId: 'item-1', text: 'Item 1' }
  };

  const mockRow2: GroupTableRowModel = {
    id: 'row-2',
    qrItem: { linkId: 'item-2', text: 'Item 2' }
  };

  const mockRow3: GroupTableRowModel = {
    id: 'row-3',
    qrItem: null
  };

  describe('initialization', () => {
    it('should initialize with provided table rows', () => {
      const initialRows = [mockRow1, mockRow2];
      const { result } = renderHook(() => useGroupTableRows(initialRows));

      expect(result.current.tableRows).toEqual(initialRows);
      expect(result.current.tableRows).toHaveLength(2);
    });

    it('should initialize selected IDs from provided rows', () => {
      const initialRows = [mockRow1, mockRow2, mockRow3];
      const { result } = renderHook(() => useGroupTableRows(initialRows));

      expect(result.current.selectedIds).toEqual(['row-1', 'row-2', 'row-3']);
    });

    it('should handle empty initial rows', () => {
      const { result } = renderHook(() => useGroupTableRows([]));

      expect(result.current.tableRows).toEqual([]);
      expect(result.current.selectedIds).toEqual([]);
    });

    it('should provide setter functions', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      expect(typeof result.current.setTableRows).toBe('function');
      expect(typeof result.current.setSelectedIds).toBe('function');
    });
  });

  describe('tableRows state management', () => {
    it('should update table rows when setTableRows is called', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      expect(result.current.tableRows).toEqual([mockRow1]);

      act(() => {
        result.current.setTableRows([mockRow1, mockRow2]);
      });

      expect(result.current.tableRows).toEqual([mockRow1, mockRow2]);
    });

    it('should replace all table rows when setting new rows', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      act(() => {
        result.current.setTableRows([mockRow3]);
      });

      expect(result.current.tableRows).toEqual([mockRow3]);
      expect(result.current.tableRows).toHaveLength(1);
    });

    it('should handle setting empty table rows', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      act(() => {
        result.current.setTableRows([]);
      });

      expect(result.current.tableRows).toEqual([]);
    });

    it('should handle adding new rows', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      act(() => {
        result.current.setTableRows([...result.current.tableRows, mockRow2, mockRow3]);
      });

      expect(result.current.tableRows).toHaveLength(3);
      expect(result.current.tableRows).toEqual([mockRow1, mockRow2, mockRow3]);
    });
  });

  describe('selectedIds state management', () => {
    it('should update selected IDs when setSelectedIds is called', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      expect(result.current.selectedIds).toEqual(['row-1', 'row-2']);

      act(() => {
        result.current.setSelectedIds(['row-1']);
      });

      expect(result.current.selectedIds).toEqual(['row-1']);
    });

    it('should handle empty selected IDs', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      act(() => {
        result.current.setSelectedIds([]);
      });

      expect(result.current.selectedIds).toEqual([]);
    });

    it('should handle adding selected IDs', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      act(() => {
        result.current.setSelectedIds([...result.current.selectedIds, 'row-2', 'row-3']);
      });

      expect(result.current.selectedIds).toEqual(['row-1', 'row-2', 'row-3']);
    });

    it('should handle removing selected IDs', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2, mockRow3]));

      act(() => {
        result.current.setSelectedIds(['row-2']);
      });

      expect(result.current.selectedIds).toEqual(['row-2']);
    });
  });

  describe('independent state updates', () => {
    it('should update table rows without affecting selected IDs', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      const originalSelectedIds = result.current.selectedIds;

      act(() => {
        result.current.setTableRows([mockRow3]);
      });

      expect(result.current.tableRows).toEqual([mockRow3]);
      expect(result.current.selectedIds).toEqual(originalSelectedIds);
    });

    it('should update selected IDs without affecting table rows', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      const originalTableRows = result.current.tableRows;

      act(() => {
        result.current.setSelectedIds(['custom-id']);
      });

      expect(result.current.selectedIds).toEqual(['custom-id']);
      expect(result.current.tableRows).toEqual(originalTableRows);
    });
  });

  describe('complex row models', () => {
    it('should handle rows with complex qrItem data', () => {
      const complexRow: GroupTableRowModel = {
        id: 'complex-row',
        qrItem: {
          linkId: 'complex-item',
          text: 'Complex Item',
          item: [
            { linkId: 'nested-1', text: 'Nested 1' },
            { linkId: 'nested-2', text: 'Nested 2' }
          ]
        }
      };

      const { result } = renderHook(() => useGroupTableRows([complexRow]));

      expect(result.current.tableRows[0]).toEqual(complexRow);
      expect(result.current.selectedIds).toEqual(['complex-row']);
    });

    it('should handle rows with null qrItem', () => {
      const rowWithNullItem: GroupTableRowModel = {
        id: 'null-item-row',
        qrItem: null
      };

      const { result } = renderHook(() => useGroupTableRows([rowWithNullItem]));

      expect(result.current.tableRows[0].qrItem).toBeNull();
      expect(result.current.selectedIds).toEqual(['null-item-row']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle duplicate row IDs', () => {
      const duplicateRows = [
        { ...mockRow1 },
        { ...mockRow1, qrItem: { linkId: 'different', text: 'Different' } }
      ];

      const { result } = renderHook(() => useGroupTableRows(duplicateRows));

      expect(result.current.selectedIds).toEqual(['row-1', 'row-1']);
    });

    it('should handle special characters in IDs', () => {
      const specialIdRow: GroupTableRowModel = {
        id: 'row-with-special@chars#123!',
        qrItem: { linkId: 'special-item' }
      };

      const { result } = renderHook(() => useGroupTableRows([specialIdRow]));

      expect(result.current.selectedIds).toEqual(['row-with-special@chars#123!']);
    });

    it('should handle empty string IDs', () => {
      const emptyIdRow: GroupTableRowModel = {
        id: '',
        qrItem: { linkId: 'empty-id-item' }
      };

      const { result } = renderHook(() => useGroupTableRows([emptyIdRow]));

      expect(result.current.selectedIds).toEqual(['']);
    });
  });

  describe('large datasets', () => {
    it('should handle many rows efficiently', () => {
      const manyRows: GroupTableRowModel[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `row-${i}`,
        qrItem: { linkId: `item-${i}`, text: `Item ${i}` }
      }));

      const { result } = renderHook(() => useGroupTableRows(manyRows));

      expect(result.current.tableRows).toHaveLength(1000);
      expect(result.current.selectedIds).toHaveLength(1000);
      expect(result.current.selectedIds[0]).toBe('row-0');
      expect(result.current.selectedIds[999]).toBe('row-999');
    });

    it('should handle updates to large datasets', () => {
      const initialRows: GroupTableRowModel[] = Array.from({ length: 100 }, (_, i) => ({
        id: `row-${i}`,
        qrItem: { linkId: `item-${i}` }
      }));

      const { result } = renderHook(() => useGroupTableRows(initialRows));

      act(() => {
        result.current.setSelectedIds(result.current.selectedIds.filter((_, i) => i < 50));
      });

      expect(result.current.selectedIds).toHaveLength(50);
      expect(result.current.tableRows).toHaveLength(100); // Unchanged
    });
  });

  describe('functional updates', () => {
    it('should support functional updates for table rows', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      act(() => {
        result.current.setTableRows((prev) => [...prev, mockRow2]);
      });

      expect(result.current.tableRows).toEqual([mockRow1, mockRow2]);
    });

    it('should support functional updates for selected IDs', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1, mockRow2]));

      act(() => {
        result.current.setSelectedIds((prev) => prev.filter((id) => id !== 'row-1'));
      });

      expect(result.current.selectedIds).toEqual(['row-2']);
    });

    it('should handle chained functional updates', () => {
      const { result } = renderHook(() => useGroupTableRows([mockRow1]));

      act(() => {
        result.current.setTableRows((prev) => [...prev, mockRow2]);
        result.current.setSelectedIds((prev) => [...prev, 'new-id']);
      });

      expect(result.current.tableRows).toEqual([mockRow1, mockRow2]);
      expect(result.current.selectedIds).toEqual(['row-1', 'new-id']);
    });
  });

  describe('re-initialization behavior', () => {
    it('should maintain independent state from initial props', () => {
      const initialRows = [mockRow1];
      const { result } = renderHook(() => useGroupTableRows(initialRows));

      // Modify the returned state
      act(() => {
        result.current.setTableRows([mockRow2]);
        result.current.setSelectedIds(['custom-selection']);
      });

      // Original array should be unchanged
      expect(initialRows).toEqual([mockRow1]);
      expect(result.current.tableRows).toEqual([mockRow2]);
      expect(result.current.selectedIds).toEqual(['custom-selection']);
    });

    it('should not be affected by mutations to initial props', () => {
      const initialRows = [mockRow1, mockRow2];
      const { result } = renderHook(() => useGroupTableRows(initialRows));

      // Mutate the original array
      initialRows.push(mockRow3);

      // Hook state should be unaffected
      expect(result.current.tableRows).toEqual([mockRow1, mockRow2]);
      expect(result.current.selectedIds).toEqual(['row-1', 'row-2']);
    });
  });
});
