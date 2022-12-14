import Recipe from '../resources/recipe.json';
import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import { constructMasterQuestionnaire } from './ConstructMaster';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import { createInvalidMasterQuestionnaireOutcome } from './CreateOutcomes';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default function assemble() {
  const recipeQuestionnaire = Recipe as Questionnaire;
  const masterQuestionnaire = constructMasterQuestionnaire(recipeQuestionnaire);
  if (!masterQuestionnaire) {
    return createInvalidMasterQuestionnaireOutcome();
  }

  const subquestionnaireCanonicals = getCanonicalUrls(masterQuestionnaire);
  if (!subquestionnaireCanonicals) {
    return createInvalidMasterQuestionnaireOutcome();
  }

  fetchSubquestionnaires(
    subquestionnaireCanonicals,
    (subquestionnaires: Questionnaire[]) => {
      console.log(subquestionnaires);
    },
    (outcome: OperationOutcome) => {
      return outcome;
    }
  );
}
