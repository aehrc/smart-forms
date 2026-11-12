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

import {
  createSelectionKey,
  getChildItemEntryCounts,
  getChipColorByValueChangeMode,
  getDiffBackgroundColor,
  getFilteredItemsToRepopulate,
  getGridColumnHeadersByValueChangeMode,
  getGridTemplateColumnsByValueChangeMode,
  getItemsToRepopulateValidKeys,
  getRepopulatedItemTuplesByHeadingsMap,
  getValueChangeMode
} from '../utils/itemsToRepopulateSelector.ts';
import {
  itemsToRepopulateTestData,
  itemsToRepopulateTuplesByHeadingsMapTestData
} from './data/itemsToRepopulateTuplesByHeadingsMapTestData.ts';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';

describe('createSelectionKey', () => {
  it('returns correct key without child', () => {
    expect(createSelectionKey(1, 2)).toBe('heading-1-parent-2');
    expect(createSelectionKey('a', 2)).toBe('heading-a-parent-2');
  });

  it('returns correct key with child', () => {
    expect(createSelectionKey(1, 2, 3)).toBe('heading-1-parent-2-child-3');
    expect(createSelectionKey('b', 0, 1)).toBe('heading-b-parent-0-child-1');
  });
});

describe('getRepopulatedItemTuplesByHeadingsMap', () => {
  it('groups items under headings', () => {
    const items = {
      foo: { sectionItemText: 'Section 1', x: 1 },
      bar: { sectionItemText: 'Section 2', y: 2 },
      baz: { sectionItemText: 'Section 1', z: 3 }
    } as Record<string, any>;

    const map = getRepopulatedItemTuplesByHeadingsMap(items);

    expect(Array.from(map.keys())).toEqual(['Section 1', 'Section 2']);

    expect(map.get('Section 1')).toHaveLength(2);
    expect(map.get('Section 2')).toHaveLength(1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(map.get('Section 1')![0][0]).toBe('foo');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(map.get('Section 1')![1][0]).toBe('baz');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(map.get('Section 2')![0][0]).toBe('bar');
  });
});

describe('getChildItemEntryCounts', () => {
  it('counts only matching prefix keys', () => {
    const selected = new Set(['heading-1-parent-2-child-1', 'heading-1-parent-2-child-3', 'other']);
    const valid = new Set(['heading-1-parent-2-child-0', 'heading-1-parent-2-child-3']);
    const counts = getChildItemEntryCounts(1, 2, selected, valid);
    expect(counts).toEqual({
      numOfSelectedChildItems: 2,
      numOfValidChildItems: 2
    });
  });
  it('returns zeros when none match', () => {
    const selected = new Set(['foo', 'bar']);
    const valid = new Set([]);
    const counts = getChildItemEntryCounts(1, 2, selected, valid);
    expect(counts).toEqual({
      numOfSelectedChildItems: 0,
      numOfValidChildItems: 0
    });
  });
});

describe('getItemsToRepopulateValidKeys', () => {
  it('returns parent keys for non-repeat, child keys for repeat groups, and skips equal values', () => {
    const result = getItemsToRepopulateValidKeys(itemsToRepopulateTuplesByHeadingsMapTestData);

    expect(result).toEqual(
      new Set([
        'heading-0-parent-0',
        'heading-1-parent-0-child-3',
        'heading-1-parent-0-child-4',
        'heading-2-parent-0-child-0'
      ])
    );
  });
});

describe('getFilteredItemsToRepopulate', () => {
  it('correctly filters by selectedKeys using sample data', () => {
    const selectedKeys = new Set([
      'heading-0-parent-0', // About the health check
      'heading-1-parent-0-child-3', // UTI
      'heading-1-parent-0-child-4', // Diabetes
      'heading-2-parent-0-child-0' // Chloramphenicol medication
    ]);

    const tuplesMap = itemsToRepopulateTuplesByHeadingsMapTestData;
    const origItemsToRepopulate = itemsToRepopulateTestData;

    const filtered = getFilteredItemsToRepopulate(tuplesMap, selectedKeys, origItemsToRepopulate);

    // Check "Date this health check commenced" item is included and has correct values
    expect(filtered['63fe14f3-2374-4382-bce7-180e2747c97f']).toBeDefined();

    const item = filtered['63fe14f3-2374-4382-bce7-180e2747c97f'];
    expect(item.currentQRItem?.answer?.[0].valueDate).toBe('2025-07-04');
    expect(item.serverQRItem?.answer?.[0].valueDate).toBe('2025-07-28');

    // For Medical history group, only indices 3 and 4 should come from server, others from current
    const filteredMedHistory = filtered['92bd7d05-9b5e-4cf9-900b-703f361dad9d'];
    const origMedHistory = origItemsToRepopulate['92bd7d05-9b5e-4cf9-900b-703f361dad9d'];

    if (
      !filteredMedHistory.currentQRItems ||
      !filteredMedHistory.serverQRItems ||
      !origMedHistory.currentQRItems
    ) {
      throw new Error('Expected currentQRItems and serverQRItems to be defined');
    }

    for (let i = 0; i < filteredMedHistory.currentQRItems.length; i++) {
      if (
        ['heading-1-parent-0-child-3', 'heading-1-parent-0-child-4'].includes(
          `heading-1-parent-0-child-${i}`
        )
      ) {
        // These should match the server (were selected)
        expect(filteredMedHistory.serverQRItems[i]).not.toEqual(origMedHistory.currentQRItems[i]);
        // Optionally: expect toEqual origMedGroup.serverQRItems[i] (could do a deep check)
      } else {
        // Unselected: should match the current
        expect(filteredMedHistory.serverQRItems[i]).toEqual(origMedHistory.currentQRItems[i]);
      }
    }

    // For medications: only child 0 should come from server, child 1 from current
    const filteredMeds = filtered['regularmedications-summary-current'];
    const origMeds = origItemsToRepopulate['regularmedications-summary-current'];

    if (!filteredMeds.currentQRItems || !filteredMeds.serverQRItems || !origMeds.currentQRItems) {
      throw new Error('Expected currentQRItems and serverQRItems to be defined for medical group');
    }

    expect(filteredMeds.serverQRItems[0]).not.toEqual(origMeds.currentQRItems[0]);
    expect(filteredMeds.serverQRItems[1]).toEqual(origMeds.currentQRItems[1]);
  });

  it('includes new server value when current value is empty and item is selected', () => {
    // Setup tuplesMap with current empty but server has new value
    const tuplesMap: Map<string, [string, ItemToRepopulate][]> = new Map([
      [
        'About the health check',
        [
          [
            '63fe14f3-2374-4382-bce7-180e2747c97f',
            {
              qItem: {
                linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
                text: 'Date this health check commenced',
                type: 'date',
                repeats: false
              },
              sectionItemText: 'About the health check',
              parentItemText: 'About the health check',
              isInGrid: false,
              currentQRItem: undefined, // current empty
              serverQRItem: {
                linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
                text: 'Date this health check commenced',
                answer: [{ valueDate: '2025-07-28' }]
              },
              serverQRItems: [],
              currentQRItems: []
            }
          ]
        ]
      ]
    ]);

    const originalItems: Record<string, ItemToRepopulate> = {
      ['63fe14f3-2374-4382-bce7-180e2747c97f']: {
        qItem: {
          linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
          text: 'Date this health check commenced',
          type: 'date',
          repeats: false
        },
        sectionItemText: 'About the health check',
        parentItemText: 'About the health check',
        isInGrid: false,
        currentQRItem: undefined,
        serverQRItem: {
          linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
          text: 'Date this health check commenced',
          answer: [{ valueDate: '2025-07-28' }]
        },
        serverQRItems: [],
        currentQRItems: []
      }
    };

    const selectedKeys = new Set([`heading-0-parent-0`]);

    const filtered = getFilteredItemsToRepopulate(tuplesMap, selectedKeys, originalItems);

    expect(filtered['63fe14f3-2374-4382-bce7-180e2747c97f']).toBeDefined();

    // Should include the new server value in serverQRItem
    const serverItem = filtered['63fe14f3-2374-4382-bce7-180e2747c97f'].serverQRItem;
    if (!serverItem) {
      throw new Error('Expected serverQRItem to be defined');
    }

    expect(serverItem.answer).toEqual([{ valueDate: '2025-07-28' }]);

    // currentQRItem should stay undefined / as per original
    expect(filtered['63fe14f3-2374-4382-bce7-180e2747c97f'].currentQRItem).toBeUndefined();
  });

  // Regression tests for https://github.com/aehrc/smart-forms/issues/1940
  // Rows deleted on the server between repopulations: the dialog correctly shows the
  // deletions, but applying them corrupted the result (deleted rows resurrected/duplicated
  // and the internal mark-as-deleted extension leaked into the QuestionnaireResponse).
  describe('server-side deletions in repeat groups', () => {
    const markAsDeletedUrl =
      'https://smartforms.csiro.au/custom-functionality/repopulation/mark-as-deleted';

    function buildRepeatGroupRow(value: string) {
      return {
        linkId: 'problem',
        item: [{ linkId: 'problem-name', answer: [{ valueString: value }] }]
      };
    }

    const rowA = buildRepeatGroupRow('A');
    const rowB = buildRepeatGroupRow('B');
    const rowC = buildRepeatGroupRow('C');

    function buildDeletionScenario(): {
      tuplesMap: Map<string, [string, ItemToRepopulate][]>;
      originalItems: Record<string, ItemToRepopulate>;
    } {
      // Form has rows [A, B, C]; rows A and B were deleted on the server, so it returns [C].
      // Detection (retrieveRepeatGroupCurrentQRItems) aligns matched pairs first:
      // currentQRItems = [C, A, B], serverQRItems = [C]
      // → dialog child 0 hidden (C unchanged), child 1 "A removed", child 2 "B removed"
      const itemToRepopulate: ItemToRepopulate = {
        qItem: { linkId: 'problem', text: 'Recorded problems', type: 'group', repeats: true },
        sectionItemText: 'Clinical details',
        parentItemText: 'Clinical details',
        isInGrid: false,
        currentQRItems: [rowC, rowA, rowB],
        serverQRItems: [rowC]
      };

      return {
        tuplesMap: new Map([['Clinical details', [['problem', itemToRepopulate]]]]),
        originalItems: { problem: itemToRepopulate }
      };
    }

    it('removes all accepted deletions instead of resurrecting/duplicating rows', () => {
      const { tuplesMap, originalItems } = buildDeletionScenario();

      // Accept both deletions, as shown in the dialog
      const selectedKeys = new Set(['heading-0-parent-0-child-1', 'heading-0-parent-0-child-2']);

      const filtered = getFilteredItemsToRepopulate(tuplesMap, selectedKeys, originalItems);

      // The dialog promised only row C remains
      expect(filtered['problem'].serverQRItems).toEqual([rowC]);
    });

    it('does not leak the mark-as-deleted extension into the result', () => {
      const { tuplesMap, originalItems } = buildDeletionScenario();

      const selectedKeys = new Set(['heading-0-parent-0-child-1', 'heading-0-parent-0-child-2']);

      const filtered = getFilteredItemsToRepopulate(tuplesMap, selectedKeys, originalItems);

      const leakedMarkers = (filtered['problem'].serverQRItems ?? []).filter((serverQRItem) =>
        serverQRItem.extension?.some((ext) => ext.url === markAsDeletedUrl)
      );
      expect(leakedMarkers).toEqual([]);
    });

    it('keeps unaccepted deletions in the form', () => {
      const { tuplesMap, originalItems } = buildDeletionScenario();

      // Accept only the deletion of row A; leave row B's deletion unselected
      const selectedKeys = new Set(['heading-0-parent-0-child-1']);

      const filtered = getFilteredItemsToRepopulate(tuplesMap, selectedKeys, originalItems);

      // Row A removed, row B preserved from current values
      expect(filtered['problem'].serverQRItems).toEqual([rowC, rowB]);
    });
  });
});

describe('getChipColorByValueChangeMode', () => {
  it('returns proper color', () => {
    expect(getChipColorByValueChangeMode('new')).toBe('secondary');
    expect(getChipColorByValueChangeMode('removed')).toBe('error');
    expect(getChipColorByValueChangeMode('updated')).toBe('primary');
  });
});

describe('getGridColumnHeadersByValueChangeMode', () => {
  it('returns columns for each mode', () => {
    expect(getGridColumnHeadersByValueChangeMode('new', false)).toEqual([
      { key: 'server', label: 'Patient record values' }
    ]);
    expect(getGridColumnHeadersByValueChangeMode('removed', false)).toEqual([
      { key: 'current', label: 'Current values' }
    ]);
    expect(getGridColumnHeadersByValueChangeMode('updated', false)).toEqual([
      { key: 'current', label: 'Current values' },
      { key: 'arrow', label: '→' },
      { key: 'server', label: 'Patient record values' }
    ]);
  });

  it('prepends itemText column for repeat group', () => {
    expect(getGridColumnHeadersByValueChangeMode('updated', true)[0]).toEqual({
      key: 'itemText',
      label: ''
    });
  });
});

describe('getGridTemplateColumnsByValueChangeMode', () => {
  it('gives base template for each mode', () => {
    expect(getGridTemplateColumnsByValueChangeMode('updated', false)).toBe('3fr auto 3fr');
    expect(getGridTemplateColumnsByValueChangeMode('new', false)).toBe('3fr');
    expect(getGridTemplateColumnsByValueChangeMode('removed', false)).toBe('3fr');
  });

  it('prepends 1fr for repeat group', () => {
    expect(getGridTemplateColumnsByValueChangeMode('updated', true)).toBe('1fr 3fr auto 3fr');
    expect(getGridTemplateColumnsByValueChangeMode('new', true)).toBe('1fr 3fr');
  });
});

describe('getValueChangeMode', () => {
  it('returns "new" if only server values', () => {
    expect(
      getValueChangeMode([{ currentValue: null, serverValue: 'a', itemText: 'x' } as any])
    ).toBe('new');
  });
  it('returns "removed" if only current values', () => {
    expect(
      getValueChangeMode([{ currentValue: 'b', serverValue: null, itemText: 'y' } as any])
    ).toBe('removed');
  });
  it('returns "updated" if both current and server', () => {
    expect(
      getValueChangeMode([{ currentValue: 'b', serverValue: 'z', itemText: 'y' } as any])
    ).toBe('updated');
    expect(
      getValueChangeMode([{ currentValue: null, serverValue: null, itemText: 'h' } as any])
    ).toBe('updated'); // both falsy, can't be new or removed
  });
});

describe('getDiffBackgroundColor', () => {
  it('returns null if values match', () => {
    expect(getDiffBackgroundColor('current', true)).toBeNull();
    expect(getDiffBackgroundColor('server', true)).toBeNull();
  });
  it('returns "#FFEBE9" for current column if mismatch', () => {
    expect(getDiffBackgroundColor('current', false)).toBe('#FFEBE9');
  });
  it('returns "#DAFBE1" for server column if mismatch', () => {
    expect(getDiffBackgroundColor('server', false)).toBe('#DAFBE1');
  });
  it('returns null for unexpected column', () => {
    expect(getDiffBackgroundColor('bogus' as any, false)).toBeNull();
  });
});
