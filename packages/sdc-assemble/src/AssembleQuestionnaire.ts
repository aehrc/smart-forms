import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
import { fetchSubquestionnaires, getCanonicalUrls } from './SubQuestionnaires';
import {
  checkMatchingLanguage,
  checkProhibitedAttributes,
  getContainedResources,
  getExtensions,
  getSubquestionnaireItems,
  isValidExtensions,
  mergeExtensionsIntoItems
} from './GetSubquestionnaireItems';
import { propagateSubquestionnaireItems } from './PropagateSubquestionnaireItems';

export async function assembleQuestionnaire(
  questionnaire: Questionnaire,
  allCanonicals: string[]
): Promise<Questionnaire | OperationOutcome> {
  const parentQuestionnaire = JSON.parse(JSON.stringify(questionnaire));
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

  // Get items
  const items = getSubquestionnaireItems(subquestionnaires);

  // Get contained resources
  const containedResources: Record<string, FhirResource> = getContainedResources(subquestionnaires);

  // Get extensions
  const extensions = getExtensions(subquestionnaires);
  if (!isValidExtensions(extensions)) return extensions;
  const { rootLevelExtensions, itemLevelExtensions } = extensions;

  // Merge item-level extensions into items
  const itemsWithExtensions = mergeExtensionsIntoItems(items, itemLevelExtensions);

  // propagate items, contained resources and extensions into parent questionnaire
  return propagateSubquestionnaireItems(
    parentQuestionnaire,
    itemsWithExtensions,
    containedResources,
    rootLevelExtensions
  );
}
