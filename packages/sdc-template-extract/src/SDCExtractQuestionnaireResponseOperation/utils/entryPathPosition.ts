import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';

/**
 * Calculates the starting index for a given `entryPath` based on its position within
 * a list of `EntryPathPosition` entries mapped to a `baseEntryPath`.
 *
 * It iterates through the list associated with `baseEntryPath` and either:
 * - Returns the `startIndex` of the exact matching `entryPath`, or
 * - Accumulates counts of preceding entries until the end, returning the cumulative index.
 *
 * @param {string} baseEntryPath - The base key used to look up the list of positions.
 * @param {string} entryPath - The specific path whose starting index is being calculated.
 * @param {Map<string, EntryPathPosition[]>} entryPathPositionMap - A map from base paths to arrays of entry positions.
 * @returns {number} The computed starting index for the `entryPath`. Defaults to 0 if `baseEntryPath` is not found.
 */
export function getStartingIndex(
  baseEntryPath: string,
  entryPath: string,
  entryPathPositionMap: Map<string, EntryPathPosition[]>
): number {
  const entryPathPositions = entryPathPositionMap.get(baseEntryPath);
  if (entryPathPositions) {
    let startIndex = 0;
    for (const entryPathPosition of entryPathPositions) {
      // EntryPath matches the baseEntryPath, return startIndex
      if (entryPathPosition.entryPath === entryPath) {
        return entryPathPosition.startIndex;
      }

      // Increment startIndex by the count of previous entries
      startIndex += entryPathPosition.count;
    }

    return startIndex;
  }

  // BaseEntryPath not found in map, return 0 (default starting index)
  return 0;
}

/**
 * Adds a new `EntryPathPosition` entry to the list associated with the given `baseEntryPath`
 * in the `entryPathPositionMap`.
 *
 * If the `baseEntryPath` does not exist in the map yet, it initializes a new array for it.
 * The new position includes the `entryPath`, its `startIndex`, and the count of values being inserted.
 *
 * @param {string} baseEntryPath - The base entry path used to group related entry positions.
 * @param {string} entryPath - The specific entry path to be recorded within the group.
 * @param {number} startIndex - The index at which this entry's values begin.
 * @param {number} numberOfValuesToInsert - The number of values associated with this entry path.
 * @param {Map<string, EntryPathPosition[]>} entryPathPositionMap - A map tracking all positions grouped by base entry paths.
 */
export function addCurrentEntryPathPosition(
  baseEntryPath: string,
  entryPath: string,
  startIndex: number,
  numberOfValuesToInsert: number,
  entryPathPositionMap: Map<string, EntryPathPosition[]>
) {
  // Initialise baseEntryPath entry if it does not exist
  if (!entryPathPositionMap.has(baseEntryPath)) {
    entryPathPositionMap.set(baseEntryPath, []);
  }

  const entryPathPosition: EntryPathPosition = {
    entryPath: entryPath,
    startIndex: startIndex,
    count: numberOfValuesToInsert
  };

  // Push entryPathPosition into the baseEntryPath positions array
  const baseEntryPathPositions = entryPathPositionMap.get(baseEntryPath);
  if (baseEntryPathPositions) {
    baseEntryPathPositions.push(entryPathPosition);
  }
}
