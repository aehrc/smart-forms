import type { Questionnaire } from 'fhir/r4';
import type { Pages } from '../../interfaces/page.interface';
import { constructPagesWithProperties, isPage } from '../page';

export function extractPages(questionnaire: Questionnaire): Pages {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  let totalPages = {};
  for (const topLevelItem of questionnaire.item) {
    const items = topLevelItem.item;
    const topLevelItemIsPageContainer = isPage(topLevelItem);

    const pages = constructPagesWithProperties(items, topLevelItemIsPageContainer);
    totalPages = { ...totalPages, ...pages };
  }

  return totalPages;
}
