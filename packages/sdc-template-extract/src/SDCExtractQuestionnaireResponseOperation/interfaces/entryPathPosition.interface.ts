/**
 * Tracks where a bunch of evaluated values are inserted into a template entry path.
 */
export interface EntryPathPosition {
  entryPath: string;
  startIndex: number;
  count: number;
}
