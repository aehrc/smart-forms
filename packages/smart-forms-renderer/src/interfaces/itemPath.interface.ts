/**
 * Represents a single step in the path to an item within a nested QuestionnaireResponse.
 * Each step is identified by its `linkId`, and optionally a `repeatIndex` if the item
 * occurs within a repeating group.
 */
export interface ItemPathSegment {
  /** The `linkId` of the QuestionnaireResponseItem at this path segment. */
  linkId: string;

  /**
   * The index of the repeated item if this segment occurs within a repeating group.
   * Omitted if the item is not part of a repeating group.
   */
  repeatIndex?: number;
}

/**
 * Represents a full path from the root of a QuestionnaireResponse to a deeply nested item.
 * Each segment corresponds to one level of the item hierarchy.
 *
 * Example:
 * [
 *   { linkId: 'sectionA' },
 *   { linkId: 'groupB', repeatIndex: 1 },
 *   { linkId: 'questionC' }
 * ]
 *
 * This path navigates through `sectionA`, into the second instance of `groupB`,
 * and finally to `questionC`.
 *
 * @author Sean Fong
 */
export type ItemPath = ItemPathSegment[];
