import type { Questionnaire } from 'fhir/r4';
import type { Pages } from '../../interfaces/page.interface';
import { constructPagesWithProperties } from '../page';

export function extractPages(questionnaire: Questionnaire): Pages {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  return constructPagesWithProperties(questionnaire.item);
}
