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

import type { QuestionnaireResponseItem } from 'fhir/r4';
import { getGroupTableItemsToUpdate, reorderRows } from '../../utils/groupTable';
import type { GroupTableRowModel } from '../../interfaces/groupTable.interface';

describe('groupTable utilities', () => {
  describe('reorderRows', () => {
    const createMockRow = (id: string): GroupTableRowModel => ({
      id,
      qrItem: {
        linkId: id,
        item: []
      } as QuestionnaireResponseItem
    });

    it('should reorder rows from lower to higher index', () => {
      const rows = [
        createMockRow('row1'),
        createMockRow('row2'),
        createMockRow('row3'),
        createMockRow('row4')
      ];

      const result = reorderRows(rows, 0, 2); // Move row1 to position 2

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('row2');
      expect(result[1].id).toBe('row3');
      expect(result[2].id).toBe('row1'); // Moved here
      expect(result[3].id).toBe('row4');
    });

    it('should reorder rows from higher to lower index', () => {
      const rows = [
        createMockRow('row1'),
        createMockRow('row2'),
        createMockRow('row3'),
        createMockRow('row4')
      ];

      const result = reorderRows(rows, 3, 1); // Move row4 to position 1

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('row1');
      expect(result[1].id).toBe('row4'); // Moved here
      expect(result[2].id).toBe('row2');
      expect(result[3].id).toBe('row3');
    });

    it('should handle moving to the same position', () => {
      const rows = [createMockRow('row1'), createMockRow('row2'), createMockRow('row3')];

      const result = reorderRows(rows, 1, 1); // Move row2 to position 1 (same)

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('row1');
      expect(result[1].id).toBe('row2');
      expect(result[2].id).toBe('row3');
    });

    it('should handle moving first element to last', () => {
      const rows = [createMockRow('first'), createMockRow('middle'), createMockRow('last')];

      const result = reorderRows(rows, 0, 2); // Move first to last position

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('middle');
      expect(result[1].id).toBe('last');
      expect(result[2].id).toBe('first');
    });

    it('should handle moving last element to first', () => {
      const rows = [createMockRow('first'), createMockRow('middle'), createMockRow('last')];

      const result = reorderRows(rows, 2, 0); // Move last to first position

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('last');
      expect(result[1].id).toBe('first');
      expect(result[2].id).toBe('middle');
    });

    it('should handle single element array', () => {
      const rows = [createMockRow('only')];

      const result = reorderRows(rows, 0, 0);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('only');
    });

    it('should handle empty array', () => {
      const rows: GroupTableRowModel[] = [];

      const result = reorderRows(rows, 0, 0);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should not mutate original array', () => {
      const rows = [createMockRow('row1'), createMockRow('row2'), createMockRow('row3')];
      const originalRows = [...rows];

      reorderRows(rows, 0, 2);

      expect(rows).toEqual(originalRows);
    });

    it('should create a new array with same objects', () => {
      const rows = [createMockRow('row1'), createMockRow('row2'), createMockRow('row3')];

      const result = reorderRows(rows, 1, 2);

      expect(result).not.toBe(rows); // Different array reference
      expect(result[0]).toBe(rows[0]); // Same object references
      expect(result[2]).toBe(rows[1]); // Same object references
    });
  });

  describe('getGroupTableItemsToUpdate', () => {
    const createRowWithQrItem = (
      id: string,
      qrItem?: QuestionnaireResponseItem
    ): GroupTableRowModel => ({
      id,
      qrItem: qrItem || {
        linkId: id,
        item: []
      }
    });

    const createRowWithoutQrItem = (id: string): GroupTableRowModel => ({
      id,
      qrItem: null
    });

    it('should return qrItems for selected rows', () => {
      const qrItem1 = { linkId: 'item1', item: [] } as QuestionnaireResponseItem;
      const qrItem2 = { linkId: 'item2', item: [] } as QuestionnaireResponseItem;

      const tableRows = [
        createRowWithQrItem('row1', qrItem1),
        createRowWithQrItem('row2', qrItem2),
        createRowWithQrItem('row3')
      ];
      const selectedIds = ['row1', 'row2'];

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(2);
      expect(result[0].linkId).toBe('item1');
      expect(result[1].linkId).toBe('item2');
    });

    it('should filter out rows without qrItem', () => {
      const qrItem1 = { linkId: 'item1', item: [] } as QuestionnaireResponseItem;

      const tableRows = [
        createRowWithQrItem('row1', qrItem1),
        createRowWithoutQrItem('row2'),
        createRowWithQrItem('row3')
      ];
      const selectedIds = ['row1', 'row2', 'row3'];

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(2); // Only row1 and row3 have qrItems
      expect(result[0].linkId).toBe('item1');
      expect(result[1].linkId).toBe('row3');
    });

    it('should return empty array when no rows are selected', () => {
      const tableRows = [createRowWithQrItem('row1'), createRowWithQrItem('row2')];
      const selectedIds: string[] = [];

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(0);
    });

    it('should return empty array when no selected rows exist in table', () => {
      const tableRows = [createRowWithQrItem('row1'), createRowWithQrItem('row2')];
      const selectedIds = ['row3', 'row4']; // Non-existent rows

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(0);
    });

    it('should handle empty table rows', () => {
      const tableRows: GroupTableRowModel[] = [];
      const selectedIds = ['row1', 'row2'];

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(0);
    });

    it('should create deep clones of qrItems (structuredClone)', () => {
      const originalQrItem = {
        linkId: 'item1',
        item: [{ linkId: 'nested', item: [] }]
      } as QuestionnaireResponseItem;

      const tableRows = [createRowWithQrItem('row1', originalQrItem)];
      const selectedIds = ['row1'];

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toBe(originalQrItem); // Different object reference
      expect(result[0]).toEqual(originalQrItem); // Same content
      expect(result[0].linkId).toBe('item1');
    });

    it('should handle mixed scenarios with some rows having qrItems and some not', () => {
      const qrItem1 = { linkId: 'item1', item: [] } as QuestionnaireResponseItem;
      const qrItem3 = { linkId: 'item3', item: [] } as QuestionnaireResponseItem;

      const tableRows = [
        createRowWithQrItem('row1', qrItem1),
        createRowWithoutQrItem('row2'),
        createRowWithQrItem('row3', qrItem3),
        createRowWithoutQrItem('row4'),
        createRowWithQrItem('row5')
      ];
      const selectedIds = ['row1', 'row2', 'row3', 'row4']; // Mix of with/without qrItems

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(2); // Only row1 and row3 have qrItems
      expect(result[0].linkId).toBe('item1');
      expect(result[1].linkId).toBe('item3');
    });

    it('should handle partial selection correctly', () => {
      const tableRows = [
        createRowWithQrItem('row1'),
        createRowWithQrItem('row2'),
        createRowWithQrItem('row3'),
        createRowWithQrItem('row4')
      ];
      const selectedIds = ['row2', 'row4']; // Select only some rows

      const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

      expect(result).toHaveLength(2);
      expect(result[0].linkId).toBe('row2');
      expect(result[1].linkId).toBe('row4');
    });

    describe('edge cases', () => {
      it('should handle null qrItem explicitly', () => {
        const tableRows = [{ id: 'row1', qrItem: null }];
        const selectedIds = ['row1'];

        const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

        expect(result).toHaveLength(0);
      });

      it('should handle duplicate selected IDs', () => {
        const tableRows = [createRowWithQrItem('row1')];
        const selectedIds = ['row1', 'row1', 'row1']; // Duplicates

        const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

        expect(result).toHaveLength(1); // Should still only return one item
      });

      it('should maintain order based on table rows, not selected IDs', () => {
        const tableRows = [
          createRowWithQrItem('row1'),
          createRowWithQrItem('row2'),
          createRowWithQrItem('row3')
        ];
        const selectedIds = ['row3', 'row1']; // Different order than table

        const result = getGroupTableItemsToUpdate(tableRows, selectedIds);

        expect(result).toHaveLength(2);
        expect(result[0].linkId).toBe('row1'); // Table order is preserved
        expect(result[1].linkId).toBe('row3');
      });
    });
  });
});
