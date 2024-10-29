import type { Questionnaire } from 'fhir/r4';
import type { Pages } from '../../interfaces/page.interface';
import { constructPagesWithProperties, isPage } from '../page';

export function extractPages(questionnaire: Questionnaire): Pages {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  const questionnaireHasPage = questionnaire.item.some((i) => isPage(i));

  if (questionnaireHasPage) {
    return constructPagesWithProperties(questionnaire.item);
  }

  return {};
}
