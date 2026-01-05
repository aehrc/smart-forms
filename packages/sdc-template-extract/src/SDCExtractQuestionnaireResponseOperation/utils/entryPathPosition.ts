import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';
import { parseFhirPath } from './parseFhirPath';

/**
 * Calculates the starting index for a given `entryPath` based on its position within
 * a list of `EntryPathPosition` entries mapped to a `baseEntryPath`, accounting for the
 * position of the entry path in the templated array and the number of entries already
 * inserted into the base entry path.
 *
 * @param {string} baseEntryPath - The base key used to look up the list of positions.
 * @param {string} entryPath - The specific path whose starting index is being calculated.
 * @param {Map<string, EntryPathPosition[]>} entryPathPositionMap - A map from base paths to arrays of entry positions.
 * @returns {number} The computed starting index for the `entryPath`. Defaults to 0 if `entryPath` is not a path to an array element.
 */
export function getStartingIndex(
  baseEntryPath: string,
  entryPath: string,
  entryPathPositionMap: Map<string, EntryPathPosition[]>
): number {
  // Parse entryPath to get the position of the element in the template array
  const entryPathSegments = parseFhirPath(entryPath);
  const finalSegment = entryPathSegments[entryPathSegments.length - 1];

  if (typeof finalSegment === 'number') {
    // We begin at the index given by the entry path
    let startIndex = finalSegment;

    const entryPathPositions = entryPathPositionMap.get(baseEntryPath);
    if (entryPathPositions) {
      for (const entryPathPosition of entryPathPositions) {
        // Increment startIndex by the count of previous entries added to the base entry path
        // We substract 1 to account for the templated object itself which is removed from the template before inserting values
        startIndex += entryPathPosition.count - 1;
      }
    }

    return startIndex;
  }

  // Final segment is not a number, return 0 (entryPath is not a path to an array element)
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
