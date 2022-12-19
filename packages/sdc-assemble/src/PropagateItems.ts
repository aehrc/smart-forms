import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
import { createOperationOutcome } from './CreateOutcomes';

export function checkProhibitedAttributes(
  subquestionnaires: Questionnaire[]
): OperationOutcome | null {
  for (const subquestionnaire of subquestionnaires) {
    if (subquestionnaire.implicitRules) {
      return createOperationOutcome(
        'The subquestionnaire ' +
          subquestionnaire.url +
          ' contains implicitRules, which is prohibited.'
      );
    }

    if (subquestionnaire.modifierExtension) {
      return createOperationOutcome(
        'The subquestionnaire ' +
          subquestionnaire.url +
          ' contains a modifierExtension, which is prohibited.'
      );
    }
  }
  return null;
}

export function checkMatchingLanguage(
  subquestionnaires: Questionnaire[],
  parentQuestionnaire: Questionnaire
): OperationOutcome | null {
  for (const subquestionnaire of subquestionnaires) {
    if (subquestionnaire.language) {
      if (!parentQuestionnaire.language) {
        return createOperationOutcome(
          'The subquestionnaire ' +
            subquestionnaire.url +
            ' contains a language attribute but its parent questionnaire ' +
            parentQuestionnaire.url +
            " doesn't."
        );
      }

      if (subquestionnaire.language !== parentQuestionnaire.language) {
        return createOperationOutcome(
          'The subquestionnaire ' +
            subquestionnaire.url +
            ' has a different language from its parent questionnaire ' +
            parentQuestionnaire.url
        );
      }
    }
  }
  return null;
}

export function propagateContainedResources(
  subquestionnaires: Questionnaire[]
): Record<string, FhirResource> {
  const containedResources: Record<string, FhirResource> = {};
  for (const subquestionnaire of subquestionnaires) {
    if (!subquestionnaire.contained) continue;

    for (const resource of subquestionnaire.contained) {
      const resourceId = resource.id;
      if (resourceId && !containedResources[resourceId]) {
        containedResources[resourceId] = resource;
      }
    }
  }
  return containedResources;
}
