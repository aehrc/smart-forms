import Recipe from '../resources/recipe.json';
import type { Questionnaire } from 'fhir/r5';
import { constructMasterQuestionnaire } from './ConstructMaster';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble() {
  const recipeQuestionnaire = Recipe as Questionnaire;

  // Construct master questionnaire from recipe
  const masterQuestionnaire = constructMasterQuestionnaire(recipeQuestionnaire);
  if (masterQuestionnaire.resourceType === 'OperationOutcome') return masterQuestionnaire;

  // Retrieve subquestionnaires' canonical urls
  const subquestionnaireCanonicals = getCanonicalUrls(masterQuestionnaire);
  if (!Array.isArray(subquestionnaireCanonicals)) return subquestionnaireCanonicals;

  return await fetchSubquestionnaires(subquestionnaireCanonicals);
}
