import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import { deepEqual } from 'fast-equals';

export type ItemToRepopulateAnswers = {
  itemText: string | null;
  currentValue: string | null;
  serverValue: string | null;
}[];

export type ItemsToRepopulateTuplesByHeadings = Map<string, Array<[string, ItemToRepopulate]>>;

export function getRepopulatedItemTuplesByHeadingsMap(
  itemsToRepopulate: Record<string, ItemToRepopulate>
): Map<string, Array<[string, ItemToRepopulate]>> {
  const itemsToRepopulateTuplesByHeadings: ItemsToRepopulateTuplesByHeadings = new Map<
    string,
    Array<[string, ItemToRepopulate]>
  >();

  for (const [itemKey, item] of Object.entries(itemsToRepopulate)) {
    const heading = item.heading ?? '';
    if (!itemsToRepopulateTuplesByHeadings.has(heading)) {
      itemsToRepopulateTuplesByHeadings.set(heading, []);
    }
    itemsToRepopulateTuplesByHeadings.get(heading)!.push([itemKey, item]);
  }

  return itemsToRepopulateTuplesByHeadings;
}

/**
 * Creates a unique selection key for a parent item or its child item for RepopulateSelector.
 * There will only be a child item if parent item is a repeating group.
 * The key includes the headingIndex for more granular identification.
 */
export function createSelectionKey(
  headingIndex: string | number,
  parentItemIndex: number,
  childItemIndex?: number
): string {
  return typeof childItemIndex === 'number'
    ? `heading-${headingIndex}-parent-${parentItemIndex}-child-${childItemIndex}`
    : `heading-${headingIndex}-parent-${parentItemIndex}`;
}

/**
 * Counts how many child items within a parent item are selected vs. valid for RepopulateSelector.
 */
export function getChildItemEntryCounts(
  headingIndex: number,
  parentItemIndex: number,
  selectedEntries: Set<string>,
  allValidEntries: Set<string>
): { numOfSelectedChildItems: number; numOfValidChildItems: number } {
  const childItemPrefix = `heading-${headingIndex}-parent-${parentItemIndex}-child-`;

  const numOfSelectedChildItems = Array.from(selectedEntries).filter((key) =>
    key.startsWith(childItemPrefix)
  ).length;

  const numOfValidChildItems = Array.from(allValidEntries).filter((key) =>
    key.startsWith(childItemPrefix)
  ).length;

  return { numOfSelectedChildItems, numOfValidChildItems };
}

/**
 * Returns a set of selectable keys for all items (including repeat group children) in itemsToRepopulate.
 * Uses createSelectionKey(headingIndex, parentItemIndex, childItemIndex?) for key generation.
 * Accepts a Map where each entry is [heading, Array<[itemKey, ItemToRepopulate]>].
 *
 * Exclude items with this criterion:
 * 1. A child item's current and server values are the same
 */
export function getItemsToRepopulateValidKeys(
  itemsToRepopulateTuplesByHeadings: Map<string, Array<[string, ItemToRepopulate]>>
): Set<string> {
  const selectableItems: Set<string> = new Set();

  // Convert map to array to access headingIndex
  const headingsArray = Array.from(itemsToRepopulateTuplesByHeadings.entries());

  for (let headingIndex = 0; headingIndex < headingsArray.length; headingIndex++) {
    const [, itemsToRepopulateTuples] = headingsArray[headingIndex];

    for (
      let parentItemIndex = 0;
      parentItemIndex < itemsToRepopulateTuples.length;
      parentItemIndex++
    ) {
      const [, itemToRepopulate] = itemsToRepopulateTuples[parentItemIndex];

      // Repeat group: check child items
      if (
        (itemToRepopulate.currentQRItems && itemToRepopulate.currentQRItems?.length > 0) ||
        (itemToRepopulate.serverQRItems && itemToRepopulate.serverQRItems?.length > 0)
      ) {
        const currentLength = itemToRepopulate.currentQRItems?.length ?? 0;
        const serverLength = itemToRepopulate.serverQRItems?.length ?? 0;
        const maxLength = Math.max(currentLength, serverLength);

        for (let childIndex = 0; childIndex < maxLength; childIndex++) {
          const currentChild = itemToRepopulate.currentQRItems?.[childIndex];
          const serverChild = itemToRepopulate.serverQRItems?.[childIndex];

          // Repeat group child: heading-{headingIndex}-parent-{parentItemIndex}-child-{childIndex}
          // Skip if both current and server values are the same
          if (!deepEqual(currentChild, serverChild)) {
            selectableItems.add(createSelectionKey(headingIndex, parentItemIndex, childIndex));
          }
        }
      } else {
        // Non-repeat group: heading-{headingIndex}-parent-{parentItemIndex}
        selectableItems.add(createSelectionKey(headingIndex, parentItemIndex));
      }
    }
  }

  return selectableItems;
}

export type ValueChangeMode = 'new' | 'updated' | 'removed';

/**
 * Returns the Material UI Chip color for a given ValueChangeMode.
 */
export function getChipColorByValueChangeMode(
  valueChangeMode: ValueChangeMode
): 'primary' | 'secondary' | 'error' {
  switch (valueChangeMode) {
    case 'new':
      return 'secondary';
    case 'removed':
      return 'error';
    case 'updated':
      return 'primary';
  }
}

/**
 * Returns the grid column headers for the changes grid, based on the given ValueChangeMode.
 * If isRepeatGroup is true, prepends a label column for the repeat group item.
 */
export function getGridColumnHeadersByValueChangeMode(
  valueChangeMode: ValueChangeMode,
  isRepeatGroup: boolean
): Array<{ key: string; label: string }> {
  // Base columns for each mode
  let columns: Array<{ key: string; label: string }>;
  switch (valueChangeMode) {
    case 'new':
      columns = [{ key: 'server', label: 'Patient record values' }];
      break;
    case 'removed':
      columns = [{ key: 'current', label: 'Current values' }];
      break;
    case 'updated':
      columns = [
        { key: 'current', label: 'Current values' },
        { key: 'arrow', label: '→' },
        { key: 'server', label: 'Patient record values' }
      ];
      break;
    default:
      columns = [];
  }

  // Prepend label column if this is a repeat group
  if (isRepeatGroup) {
    columns = [{ key: 'itemText', label: '' }, ...columns];
  }

  return columns;
}

/**
 * Returns the CSS gridTemplateColumns string for the changes grid layout, based on the ValueChangeMode and whether this is a repeat group.
 * If isRepeatGroup is true, prepends '1fr' for the label column for child items item.text.
 */
export function getGridTemplateColumnsByValueChangeMode(
  valueChangeMode: ValueChangeMode,
  isRepeatGroup: boolean
): string {
  let baseTemplate: string;

  switch (valueChangeMode) {
    case 'updated':
      baseTemplate = '3fr auto 3fr';
      break;
    case 'new':
    case 'removed':
      baseTemplate = '3fr';
      break;
    default:
      baseTemplate = '';
  }

  // Prepend '1fr' for repeat group label column for child items item.text
  return isRepeatGroup ? `1fr ${baseTemplate}` : baseTemplate;
}

/**
 * Determines the value change mode for a set of answers.
 * - 'new': Only new (server) values are present (added)
 * - 'removed': Only current values are present (removed)
 * - 'updated': Mixed, or both current and server values present
 * - 'none': No values present, probably should not happen
 */
export function getValueChangeMode(
  itemsToRepopulateAnswers: ItemToRepopulateAnswers
): ValueChangeMode {
  const hasCurrent = itemsToRepopulateAnswers.some((row) => !!row.currentValue);
  const hasServer = itemsToRepopulateAnswers.some((row) => !!row.serverValue);

  if (hasServer && !hasCurrent) {
    return 'new';
  }

  if (hasCurrent && !hasServer) {
    return 'removed';
  }

  return 'updated';
}

/**
 * Returns the GitHub-style diff background color for a cell, based on which column and whether the values match.
 */
export function getDiffBackgroundColor(
  columnKey: 'current' | 'server',
  valuesMatch: boolean
): string | null {
  if (valuesMatch) {
    return null;
  }

  if (columnKey === 'current') {
    return '#FFEBE9';
  }

  if (columnKey === 'server') {
    return '#DAFBE1';
  }

  return null;
}
