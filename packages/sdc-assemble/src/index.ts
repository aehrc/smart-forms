import Master from './resources/masterQuestionnaire2.json';
import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import { createOperationOutcome } from './CreateOutcomes';
import {
  checkMatchingLanguage,
  checkProhibitedAttributes,
  propagateContainedResources,
  propagateExtensions,
  propagateItems
} from './PropagateItems';
import type { PropagatedExtensions } from './Interfaces';

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

  // Begin assembly process for parent questionnaire
  const prohibitedAttributesOutcome = checkProhibitedAttributes(subquestionnaires);
  if (prohibitedAttributesOutcome) return prohibitedAttributesOutcome;

  const matchingLanguageOutcome = checkMatchingLanguage(subquestionnaires, parentQuestionnaire);
  if (matchingLanguageOutcome) return matchingLanguageOutcome;

  const propagatedItems = propagateItems(subquestionnaires);

  const containedResources: Record<string, FhirResource> =
    propagateContainedResources(subquestionnaires);

  const propagatedExtensions = propagateExtensions(subquestionnaires);
  if (!isPropagatedExtensions(propagatedExtensions)) return propagatedExtensions;

  const { rootLevelExtensions, itemLevelExtensions } = propagatedExtensions;

  console.log(propagatedItems);
  console.log(containedResources);
  console.log(rootLevelExtensions);
  console.log(itemLevelExtensions);

  // TODO Do more stuff

  return createOperationOutcome('Development in progress');
}

function isPropagatedExtensions(
  obj: PropagatedExtensions | OperationOutcome
): obj is PropagatedExtensions {
  return typeof 'rootLevelExtensions' in obj && typeof 'itemLevelExtensions' in obj;
}
