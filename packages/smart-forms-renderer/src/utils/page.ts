import type { Pages } from '../interfaces/page.interface';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { QuestionnaireItem } from 'fhir/r4';
import { isSpecificItemControl } from './itemControl';
import { isHiddenByEnableWhen } from './qItem';
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
 * Checks if all of the items in a qItem array is a page item
 * Returns true if all items is page item
 * Returns false if only have one item
 *
 * @author Riza Nafis
 */
export function everyIsPages(topLevelQItem: QuestionnaireItem[] | undefined): boolean {
  if (!topLevelQItem) return false;

  if (isPageContainer(topLevelQItem)) return false;

  return topLevelQItem.every((i: QuestionnaireItem) => isPage(i));
}

export function isPageContainer(topLevelQItem: QuestionnaireItem[] | undefined): boolean {
  const anyPage = topLevelQItem?.filter(isPage);

  if (!anyPage) return false;

  return anyPage.some((page) => page.item?.every((i) => i.type === 'group') || false);
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

  const pages = topLevelQItem.item.filter((i) => isPage(i));
  return pages.length > 0;
}

/**
 * Check if a qItem is a page item
 *
 * @author Riza Nafis
 */
export function isPage(item: QuestionnaireItem) {
  return isSpecificItemControl(item, 'page');
}

/**
 * Create a `Record<linkId, Pages>` key-value pair for all page items in a qItem array
 *
 * @author Riza Nafis
 */
export function constructPagesWithProperties(
  qItems: QuestionnaireItem[] | undefined,
  hasPageContainer: boolean
): Pages {
  if (!qItems) return {};

  const qItemPages = hasPageContainer ? qItems : qItems.filter(isPage);

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

interface contructPagesWithVisibilityParams {
  pages: Pages;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

export function constructPagesWithVisibility(
  params: contructPagesWithVisibilityParams
): { linkId: string; isVisible: boolean }[] {
  const { pages, enableWhenIsActivated, enableWhenItems, enableWhenExpressions } = params;

  return Object.entries(pages).map(([linkId]) => {
    const isVisible = !isHiddenByEnableWhen({
      linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    return {
      linkId,
      isVisible
    };
  });
}
