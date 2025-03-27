import type { Questionnaire } from 'fhir/r4';
import type { Pages } from '../../interfaces/page.interface';
import { constructPagesWithProperties, isFooter, isHeader, isPage } from '../page';

export function extractPages(questionnaire: Questionnaire): Pages {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  // Two scenarios to consider here:
  /* 1. Proper way:
   * - Every single top-level item is a page, header or footer
   * Note: "header" and "footer" itemControl is not supported ATM so there's no way to have a header or footer
   */
  const renderQuestionnaireAsPaginated = questionnaire.item.every(
    (item) => isPage(item) || isHeader(item) || isFooter(item)
  );

  if (renderQuestionnaireAsPaginated) {
    return constructPagesWithProperties(questionnaire.item, false);
  }

  /* 2. Using "page" item as a page-container - only preserved for backwards compatibility
   * - The first "page" item will be considered as a page-container, and all its children will be considered as pages
   * - You can have non-page items in the same level as the page-container to be used as faux headers or footers
   */
  const pageContainerItem = questionnaire.item.find((item) => isPage(item));
  if (pageContainerItem) {
    return constructPagesWithProperties(pageContainerItem.item, true);
  }

  return {};
}
