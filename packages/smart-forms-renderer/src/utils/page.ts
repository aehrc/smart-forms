import type { Pages } from '../interfaces/page.interface';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { isSpecificItemControl } from './itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';

export function getFirstVisiblePage(
  pages: Pages,
  enableWhenItems: EnableWhenItems,
  enableWhenExpressions: EnableWhenExpressions
) {
  // Only singleEnableWhenItems are relevant for page operations
  const { singleItems } = enableWhenItems;
  const { singleExpressions } = enableWhenExpressions;

  return Object.entries(pages)
    .sort(([, pageA], [, pageB]) => pageA.pageIndex - pageB.pageIndex)
    .findIndex(([pageLinkId, page]) => {
      if (page.isHidden) {
        return false;
      }

      const singleItem = singleItems[pageLinkId];
      if (singleItem) {
        return singleItem.isEnabled;
      }

      const singleExpression = singleExpressions[pageLinkId];
      if (singleExpression) {
        return singleExpression.isEnabled;
      }

      return true;
    });
}

/**
 * Checks if a top-level QItem is a page
 *
 * @author Riza Nafis
 */
export function isPageTopLevel(topLevelQItem: QuestionnaireItem): boolean {
  return isSpecificItemControl(topLevelQItem, 'page');
}

/**
 * Checks if any of the items in a qItem array is a page item
 * Returns true if there is at least one page item
 *
 * @author Riza Nafis
 */
export function containsPages(topLevelQItem: QuestionnaireItem): boolean {
  if (!topLevelQItem.item) {
    return false;
  }

  const pages = getPageItems(topLevelQItem.item);
  return pages.length > 0;
}

/**
 * Get page items from a qItem array
 *
 * @author Riza Nafis
 */
export function getPageItems(items: QuestionnaireItem[]): QuestionnaireItem[] {
  return items.filter((i: QuestionnaireItem) => isPage(i));
}

/**
 * Check if a qItem is a page item
 *
 * @author Riza Nafis
 */
export function isPage(item: QuestionnaireItem) {
  const itemControl = item.extension?.find(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );

  if (itemControl) {
    const pageCoding = itemControl.valueCodeableConcept?.coding?.find(
      (c: Coding) => c.code === 'page'
    );
    if (pageCoding) {
      return true;
    }
  }
  return false;
}

/**
 * Create a `Record<linkId, Pages>` key-value pair for all page items in a qItem array
 *
 * @author Riza Nafis
 */
export function constructPagesWithProperties(
  qItems: QuestionnaireItem[] | undefined,
  hasPage: boolean
): Pages {
  if (!qItems) return {};

  const qItemPages = hasPage ? qItems : qItems.filter(isPage);

  const pages: Pages = {};
  for (const [i, qItem] of qItemPages.entries()) {
    pages[qItem.linkId] = {
      pageIndex: i,
      isComplete: false,
      isHidden: structuredDataCapture.getHidden(qItem) ?? false
    };
  }
  return pages;
}
