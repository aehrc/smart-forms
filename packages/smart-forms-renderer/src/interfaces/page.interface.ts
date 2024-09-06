/**
 * Page interface
 *
 * @property pageIndex - The index of the page
 * @property isComplete - Whether the page is marked as complete
 * @property isHidden - Whether the page is hidden
 */
export type Page = { pageIndex: number; isComplete: boolean; isHidden: boolean };

/**
 * Key-value pair of pages `Record<linkId, Page>`
 */
export type Pages = Record<string, Page>;
