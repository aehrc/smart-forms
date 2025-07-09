import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import { deepEqual } from 'fast-equals';
import { QuestionnaireResponseItem } from 'fhir/r4';

export type ItemToRepopulateAnswers = {
  itemText: string | null;
  currentValue: string | null;
  serverValue: string | null;
}[];

export type ItemsToRepopulateTuplesByHeadings = Map<string, Array<[string, ItemToRepopulate]>>;

export function getRepopulatedItemTuplesByHeadingsMap(
  itemsToRepopulate: Record<string, ItemToRepopulate>
): ItemsToRepopulateTuplesByHeadings {
  const itemsToRepopulateTuplesByHeadings: ItemsToRepopulateTuplesByHeadings = new Map<
    string,
    Array<[string, ItemToRepopulate]>
  >();

  for (const [itemKey, item] of Object.entries(itemsToRepopulate)) {
    const heading = item.sectionItemText ?? '';
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
  itemsToRepopulateTuplesByHeadings: ItemsToRepopulateTuplesByHeadings
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

/**
 * Filters a Map of questionnaire items based on checklist selections, in preparation for downstream repopulation.
 *
 * This function operates in two main steps:
 *
 * 1. Selection Filtering:
 * Iterates through all items and repeat group children, including only those whose selection keys are present in the provided `selectedKeys` set. For repeat groups, only selected children are included.
 *
 * 2. Value Restoration:
 * Because unselected repeat group children are omitted from the filtered arrays, a second step is required.
 * In this step, the original (current) values for any unselected children must be injected back into their positions. This ensures that unselected data is preserved and not overwritten by server values.
 *
 */
export function getFilteredItemsToRepopulate(
  itemsToRepopulateTuplesByHeadingsMap: Map<string, Array<[string, ItemToRepopulate]>>,
  selectedKeys: Set<string>,
  originalItemsToRepopulate: Record<string, ItemToRepopulate>
): Record<string, ItemToRepopulate> {
  const filteredItemsToRepopulate: Record<string, ItemToRepopulate> = {};

  /* 1. Selection Filtering */
  // Convert to array (actually a tuple) to access index
  const itemsToRepopulateTuplesByHeadingsTuples = Array.from(
    itemsToRepopulateTuplesByHeadingsMap.entries()
  );

  // Iterate through each heading and its items
  for (
    let headingIndex = 0;
    headingIndex < itemsToRepopulateTuplesByHeadingsTuples.length;
    headingIndex++
  ) {
    const [, itemsToRepopulateTuples] = itemsToRepopulateTuplesByHeadingsTuples[headingIndex];

    // Iterate through each parent item
    for (
      let parentItemIndex = 0;
      parentItemIndex < itemsToRepopulateTuples.length;
      parentItemIndex++
    ) {
      const [linkId, itemToRepopulate] = itemsToRepopulateTuples[parentItemIndex];

      // Repeat group: check for selected children
      if (
        (itemToRepopulate.currentQRItems && itemToRepopulate.currentQRItems.length > 0) ||
        (itemToRepopulate.serverQRItems && itemToRepopulate.serverQRItems.length > 0)
      ) {
        const currentItemsCount = itemToRepopulate.currentQRItems?.length ?? 0;
        const serverItemsCount = itemToRepopulate.serverQRItems?.length ?? 0;
        const maxItemsCount = Math.max(currentItemsCount, serverItemsCount);

        // Gather only selected children
        const selectedCurrentQRItems: typeof itemToRepopulate.currentQRItems = [];
        const selectedServerQRItems: typeof itemToRepopulate.serverQRItems = [];

        for (let childIndex = 0; childIndex < maxItemsCount; childIndex++) {
          const childKey = `heading-${headingIndex}-parent-${parentItemIndex}-child-${childIndex}`;
          if (selectedKeys.has(childKey)) {
            // Add childItems from currentQRItems to the filtered result
            if (itemToRepopulate.currentQRItems?.[childIndex]) {
              selectedCurrentQRItems[childIndex] = itemToRepopulate.currentQRItems[childIndex];
            }

            // Add childItems from serverQRItems to the filtered result
            if (itemToRepopulate.serverQRItems?.[childIndex]) {
              selectedServerQRItems[childIndex] = itemToRepopulate.serverQRItems[childIndex];
            }
            // If the case where an item is deleted in the patient record, mark explicit deletion if the child was selected (but server value is missing given it is deleted)
            // If the current item exists but server item does not, it means it was deleted
            else if (
              itemToRepopulate.currentQRItems?.[childIndex] &&
              !itemToRepopulate.serverQRItems?.[childIndex]
            ) {
              selectedServerQRItems[childIndex] = {
                ...itemToRepopulate.currentQRItems[childIndex],
                extension: [
                  ...(itemToRepopulate.currentQRItems[childIndex].extension || []),
                  {
                    url: 'https://smartforms.csiro.au/custom-functionality/repopulation/mark-as-deleted',
                    valueBoolean: true
                  }
                ]
              };
            }
          }
        }

        // Only add to filtered results if at least one child was selected
        if (selectedCurrentQRItems.length > 0 || selectedServerQRItems.length > 0) {
          filteredItemsToRepopulate[linkId] = {
            ...itemToRepopulate,
            currentQRItems: selectedCurrentQRItems.length > 0 ? selectedCurrentQRItems : undefined,
            serverQRItems: selectedServerQRItems.length > 0 ? selectedServerQRItems : undefined
          };
        }
      } else {
        // Non-repeat group: check parent selection key
        const parentKey = `heading-${headingIndex}-parent-${parentItemIndex}`;
        if (selectedKeys.has(parentKey)) {
          filteredItemsToRepopulate[linkId] = { ...itemToRepopulate };
        }
      }
    }
  }

  /* 2. Value Restoration */
  for (const linkId in filteredItemsToRepopulate) {
    const filteredItem = filteredItemsToRepopulate[linkId];
    const originalItem = originalItemsToRepopulate[linkId];

    // Only process repeat groups with arrays
    if (
      (filteredItem.currentQRItems || filteredItem.serverQRItems) &&
      (originalItem?.currentQRItems || originalItem?.serverQRItems)
    ) {
      // Value Restoration step 1: Use currentQRItems from the original item directly
      filteredItem.currentQRItems = originalItem.currentQRItems;

      // Value Restoration step 2: For serverQRItems, fill in unselected children with current values
      if (originalItem.currentQRItems) {
        const maxNumberOfItems = Math.max(
          filteredItem.serverQRItems?.length ?? 0,
          originalItem.currentQRItems.length
        );

        if (!filteredItem.serverQRItems) {
          filteredItem.serverQRItems = [];
        }

        for (let i = 0; i < maxNumberOfItems; i++) {
          if (filteredItem.serverQRItems[i] === undefined && originalItem.currentQRItems[i]) {
            filteredItem.serverQRItems[i] = originalItem.currentQRItems[i];
          }

          // If the original item is marked as deleted (has the https://smartforms.csiro.au/custom-functionality/repopulation/mark-as-deleted extension), remove the deleted item
          if (filteredItem.serverQRItems[i]) {
            const hasDeletedExtension = itemHasMarkAsDeletedExtension(
              filteredItem.serverQRItems[i]
            );

            if (hasDeletedExtension) {
              filteredItem.serverQRItems.splice(i, 1);
            }
          }
        }
      }
    }
  }

  return filteredItemsToRepopulate;
}

function itemHasMarkAsDeletedExtension(qrItem: QuestionnaireResponseItem): boolean {
  return !!qrItem.extension?.find(
    (ext) =>
      ext.url === 'https://smartforms.csiro.au/custom-functionality/repopulation/mark-as-deleted' &&
      ext.valueBoolean === true
  );
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
