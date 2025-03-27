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
 * Checks if all items in a qItem array is a page item, header item, or footer item
 * Returns true if all items is page item, header item, or footer item
 * Returns false if only have one item
 *
 * @author Riza Nafis, Sean Fong
 */
export function isPaginatedForm(topLevelQItems: QuestionnaireItem[] | undefined): boolean {
  if (!topLevelQItems) return false;

  return topLevelQItems.every(
    (topLevelQItem: QuestionnaireItem) =>
      isPage(topLevelQItem) || isHeader(topLevelQItem) || isFooter(topLevelQItem)
  );
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
 * Check if a qItem is a header item
 *
 * @author Sean Fong
 */
export function isHeader(item: QuestionnaireItem) {
  return isSpecificItemControl(item, 'header');
}

/**
 * Check if a qItem is a footer item
 *
 * @author Sean Fong
 */
export function isFooter(item: QuestionnaireItem) {
  return isSpecificItemControl(item, 'footer');
}

/**
 * Create a `Record<linkId, Pages>` key-value pair for all page items in a qItem array
 *
 * @author Riza Nafis
 */
export function constructPagesWithProperties(
  qItems: QuestionnaireItem[] | undefined,
  allChildItemsArePages: boolean
): Pages {
  if (!qItems) return {};

  const pages: Pages = {};
  for (const [i, qItem] of qItems.entries()) {
    // allChildItemsArePages will only be true if we are using the backwards-compatible method, it should be false most of the time
    if (allChildItemsArePages || isPage(qItem)) {
      pages[qItem.linkId] = {
        pageIndex: i,
        isComplete: false,
        isHidden: structuredDataCapture.getHidden(qItem) ?? false
      };
    }
  }
  return pages;
}

interface constructPagesWithVisibilityParams {
  pages: Pages;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
}

export function constructPagesWithVisibility(
  params: constructPagesWithVisibilityParams
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
