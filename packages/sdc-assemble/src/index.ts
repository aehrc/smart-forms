import Master from './resources/masterQuestionnaire2.json';
import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import { createOperationOutcome } from './CreateOutcomes';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function assemble() {
  const masterQuestionnaire = Master as Questionnaire;
  const allCanonicals: string[] = [];

  const assembled = await assembleQuestionnaire({ ...masterQuestionnaire }, allCanonicals);
  console.log(assembled);
}

async function assembleQuestionnaire(
  parentQuestionnaire: Questionnaire,
  allCanonicals: string[]
): Promise<Questionnaire | OperationOutcome> {
  const canonicals = getCanonicalUrls(parentQuestionnaire, allCanonicals);
  if (!Array.isArray(canonicals)) return canonicals;

  // Exit operation if there are no subquestionnaires to be assembled
  if (canonicals.length === 0) return parentQuestionnaire;

  // Keep a record of all traversed canonical urls to prevent an infinite loop situation during assembly
  allCanonicals.push(...canonicals);

  const subquestionnaires = await fetchSubquestionnaires(canonicals);
  if (!Array.isArray(subquestionnaires)) return subquestionnaires;

  // Recursively assemble subquestionnaires if required
  for (let subquestionnaire of subquestionnaires) {
    const assembledSubquestionnaire = await assembleQuestionnaire(subquestionnaire, allCanonicals);
    if (assembledSubquestionnaire.resourceType === 'Questionnaire') {
      subquestionnaire = assembledSubquestionnaire;
    } else {
      // Prematurely end the operation if there is an error within further assembly operations
      return assembledSubquestionnaire;
    }
  }
  console.log(subquestionnaires);

  // Begin assembly process for parent questionnaire
  // Do stuff

  return createOperationOutcome('Development in progress');
}
