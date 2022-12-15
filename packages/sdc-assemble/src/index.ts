import Recipe from '../resources/recipe.json';
import type { Questionnaire } from 'fhir/r5';
import { constructMasterQuestionnaire } from './ConstructMaster';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import { createInvalidMasterQuestionnaireOutcome } from './CreateOutcomes';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble() {
  const recipeQuestionnaire = Recipe as Questionnaire;
  const masterQuestionnaire = constructMasterQuestionnaire(recipeQuestionnaire);
  if (!masterQuestionnaire) {
    return createInvalidMasterQuestionnaireOutcome();
  }

  const subquestionnaireCanonicals = getCanonicalUrls(masterQuestionnaire);
  if (!subquestionnaireCanonicals) {
    return createInvalidMasterQuestionnaireOutcome();
  }

  return await fetchSubquestionnaires(subquestionnaireCanonicals);
}
