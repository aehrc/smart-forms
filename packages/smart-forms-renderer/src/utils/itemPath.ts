import type { ItemPath, ItemPathSegment } from '../interfaces/itemPath.interface';

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
 *
 * @param currentPath - The existing item path.
 * @param linkId - The `linkId` to use in the new path segment.
 * @param repeatIndex - (Optional) The index if this is a repeated item.
 * @returns A new `ItemPath` with the added segment.
 */
export function extendItemPath(
  currentPath: ItemPath,
  linkId: string,
  repeatIndex?: number
): ItemPath {
  const segment: ItemPathSegment = {
    linkId,
    ...(repeatIndex !== undefined ? { repeatIndex } : {})
  };

  return [...currentPath, segment];
}
