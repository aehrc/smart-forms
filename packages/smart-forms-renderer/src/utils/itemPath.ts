import type { ItemPath } from '../interfaces/itemPath.interface';

/**
 * Creates an `ItemPath` containing a single segment for the given `linkId`.
 * This is useful when you want to construct a path to a specific item without referencing its ancestry,
 * such as when working with top-level items or when only the item's identity is relevant.
 *
 * @param linkId - The `linkId` of the item.
 * @param repeatIndex - (Optional) If the item is part of a repeating group, specify its index.
 * @returns An `ItemPath` containing one segment.
 *
 * @example
 * ```ts
 * const path = createSingleItemPath('question-1');
 * // Output: [{ linkId: 'question-1' }]
 *
 * const pathWithRepeat = createSingleItemPath('question-1', 2);
 * // Output: [{ linkId: 'question-1', repeatIndex: 2 }]
 * ```
 */
export function createSingleItemPath(linkId: string, repeatIndex?: number): ItemPath {
  return repeatIndex !== undefined ? [{ linkId, repeatIndex }] : [{ linkId }];
}

/**
 * Creates a new `ItemPath` by extending the given path with a new segment for the provided `linkId`.
 * This version does NOT include a `repeatIndex`. If repeat handling is needed,
 * use `appendRepeatIndexToLastSegment` after extending.
 *
 * @param currentPath - The existing item path.
 * @param linkId - The `linkId` to use in the new path segment.
 * @returns A new `ItemPath` with the added segment.
 */
export function extendItemPath(currentPath: ItemPath, linkId: string): ItemPath {
  return [...currentPath, { linkId }];
}

/**
 * Returns a new `ItemPath` with a `repeatIndex` applied to the last segment.
 * Useful for denoting which repetition of a group is being accessed.
 *
 * @param path - The item path to modify.
 * @param repeatIndex - The index to assign to the final segment.
 * @returns A new `ItemPath` with the last segment modified to include `repeatIndex`.
 *
 * @example
 * const basePath = [{ linkId: 'groupA' }, { linkId: 'groupB' }];
 * appendRepeatIndexToLastSegment(basePath, 2);
 * // → [{ linkId: 'groupA' }, { linkId: 'groupB', repeatIndex: 2 }]
 */
export function appendRepeatIndexToLastSegment(path: ItemPath, repeatIndex: number): ItemPath {
  if (path.length === 0) return [];

  const newPath = [...path];
  newPath[path.length - 1] = { ...newPath[path.length - 1], repeatIndex };
  return newPath;
}

/**
 * Converts an `ItemPath` to a FHIRPath-compatible string.
 *
 * For example, the path:
 * [
 *   { linkId: 'groupA' },
 *   { linkId: 'repeatingGroup', repeatIndex: 1 },
 *   { linkId: 'questionB' }
 * ]
 *
 * Returns: "item.where(linkId='groupA').item.where(linkId='repeatingGroup')[1].item.where(linkId='questionB')"
 */
export function itemPathToFhirPathString(path: ItemPath): string {
  return path
    .map((segment, index) => {
      const base = `where(linkId='${segment.linkId}')`;
      const repeat = segment.repeatIndex !== undefined ? `[${segment.repeatIndex}]` : '';
      return (index === 0 ? 'item.' : '') + base + repeat;
    })
    .join('.item.');
}
