import { useQuestionnaireStore } from '../stores';
import type { Pages } from '../interfaces/page.interface';
import { constructPagesWithVisibility } from '../utils/page';

function useNextAndPreviousVisiblePages(
  currentPageIndex?: number,
  pages?: Pages
): { previousPageIndex: number | null; nextPageIndex: number | null; numOfVisiblePages: number } {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  const pagesNotDefined = currentPageIndex === undefined || pages === undefined;

  if (pagesNotDefined) {
    return { previousPageIndex: null, nextPageIndex: null, numOfVisiblePages: 0 };
  }

  const pagesWithVisibility = constructPagesWithVisibility({
    pages,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });

  return {
    previousPageIndex: getPreviousPageIndex(currentPageIndex, pagesWithVisibility),
    nextPageIndex: getNextPageIndex(currentPageIndex, pagesWithVisibility),
    numOfVisiblePages: pagesWithVisibility.filter((tab) => tab.isVisible).length
  };
}

function getPreviousPageIndex(
  currentPageIndex: number,
  pagesWithVisibility: { linkId: string; isVisible: boolean }[]
): number | null {
  const previousPages = pagesWithVisibility.slice(0, currentPageIndex);
  const foundIndex = previousPages.reverse().findIndex((tab) => tab.isVisible);

  // Previous visible tab not found
  if (foundIndex === -1) {
    return null;
  }

  // Previous visible tab less than 0
  const previousPageIndex = currentPageIndex - foundIndex - 1;
  if (previousPageIndex < 0) {
    return null;
  }

  return previousPageIndex;
}

function getNextPageIndex(
  currentPageIndex: number,
  pagesWithVisibility: { linkId: string; isVisible: boolean }[]
): number | null {
  const subsequentPages = pagesWithVisibility.slice(currentPageIndex + 1);
  const foundIndex = subsequentPages.findIndex((tab) => tab.isVisible);

  // Next visible tab not found, something is wrong
  if (foundIndex === -1) {
    return null;
  }

  return currentPageIndex + foundIndex + 1;
}

export default useNextAndPreviousVisiblePages;
