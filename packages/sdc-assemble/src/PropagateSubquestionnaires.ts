import type {
  Extension,
  FhirResource,
  OperationOutcome,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r5';
import { createOperationOutcome } from './CreateOutcomes';
import type { PropagatedExtensions, PropagatedItems } from './Interfaces';

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

export function propagateExtensions(
  subquestionnaires: Questionnaire[]
): PropagatedExtensions | OperationOutcome {
  const rootLevelExtensions: Extension[] = [];
  const itemLevelExtensions: (Extension[] | null)[] = [];

  let cqfLibrary: Extension | null = null;
  const launchContexts: Record<string, Extension> = {};

  for (const subquestionnaire of subquestionnaires) {
    // Skip extension propagation if subquestionnaire doesn't have any extensions
    if (!subquestionnaire.extension) {
      itemLevelExtensions.push(null);
      continue;
    }

    const currentLevelExtensions: Extension[] = [];
    const variables: Record<string, Extension> = {};
    let itemPopulationContext: Extension | null = null;
    let itemExtractionContext: Extension | null = null;
    for (const extension of subquestionnaire.extension) {
      const extensionUrl = extension.url;

      switch (extensionUrl) {
        // Propagate extension to root level if extension is cqf-library or launch-context
        case 'http://hl7.org/fhir/StructureDefinition/cqf-library':
          if (!cqfLibrary) {
            cqfLibrary = extension;
          }
          break;
        case 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext':
          if (extension.extension) {
            for (const ext of extension.extension) {
              if (ext.url === 'name') {
                if (ext.valueCoding && ext.valueCoding.code) {
                  launchContexts[ext.valueCoding.code] = ext;
                  break;
                }
              }
            }
          }
          break;
        // Propagate extension to item level if extension is:
        // questionnaire-constaint, variable, itemPopulationContext or itemExtractionContext
        case 'http://hl7.org/fhir/StructureDefinition/questionnaire-constraint':
          currentLevelExtensions.push(extension);
          break;
        case 'http://hl7.org/fhir/StructureDefinition/variable':
          if (extension.valueExpression && extension.valueExpression.name) {
            if (variables[extension.valueExpression.name]) {
              return createOperationOutcome(
                'The subquestionnaire ' +
                  subquestionnaire.url +
                  ' has a different language from its parent questionnaire '
              );
            } else {
              variables[extension.valueExpression.name] = extension;
            }
          }
          break;
        case 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext':
          if (itemPopulationContext) {
            return createOperationOutcome(
              'The subquestionnaire is trying to propagate ' +
                subquestionnaire.url +
                ' more than one itemPopulationContext.'
            );
          } else {
            itemPopulationContext = extension;
          }
          break;
        case 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemExtractionContext':
          if (itemExtractionContext) {
            return createOperationOutcome(
              'The subquestionnaire is trying to propagate ' +
                subquestionnaire.url +
                ' more than one itemExtractionContext.'
            );
          } else {
            itemExtractionContext = extension;
          }
          break;
      }
    }

    // Aggregate current item level extensions and add to total item level extensions array
    const currentItemLevelExtensions: Extension[] = [
      ...currentLevelExtensions,
      ...Object.values(variables)
    ];

    if (itemPopulationContext) currentItemLevelExtensions.push(itemPopulationContext);
    if (itemExtractionContext) currentItemLevelExtensions.push(itemExtractionContext);

    itemLevelExtensions.push(currentItemLevelExtensions);
  }

  // Aggregate cqfLibrary and all launchContexts to root level extensions array
  if (cqfLibrary) rootLevelExtensions.push(cqfLibrary);
  rootLevelExtensions.push(...Object.values(launchContexts));

  return {
    rootLevelExtensions,
    itemLevelExtensions
  };
}

export function propagateSubquestionnaires(subquestionnaires: Questionnaire[]): PropagatedItems {
  const items: (QuestionnaireItem[] | null)[] = [];
  const linkIds: Set<string> = new Set();
  for (const subquestionnaire of subquestionnaires) {
    if (!subquestionnaire.item) {
      items.push(null);
      continue;
    }

    const subquestionnaireItems = [];
    for (const item of subquestionnaire.item) {
      const resolvedItem = resolveDuplicateLinkIds(item, linkIds);
      if (resolvedItem) {
        subquestionnaireItems.push(resolvedItem);
        linkIds.add(resolvedItem.linkId);
      } else {
        subquestionnaireItems.push(item);
        linkIds.add(item.linkId);
      }
    }
    items.push(subquestionnaireItems);
  }
  return { items, linkIds };
}

export function resolveDuplicateLinkIds(
  qItem: QuestionnaireItem,
  linkIds: Set<string>
): QuestionnaireItem | null {
  const items = qItem.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    const resolvedItems: QuestionnaireItem[] = [];
    items.forEach((item) => {
      const resolvedItem = resolveDuplicateLinkIds(item, linkIds);
      if (resolvedItem) {
        resolvedItems.push(resolvedItem);
        linkIds.add(resolvedItem.linkId);
      } else {
        resolvedItems.push(item);
        linkIds.add(item.linkId);
      }
    });
    qItem.item = resolvedItems;

    if (linkIds.has(qItem.linkId)) {
      qItem.linkId = 'linkIdPrefix' + qItem.linkId;
    }
    return qItem;
  }

  // Add linkIdPrefix to linkId if it's a duplicate
  if (linkIds.has(qItem.linkId)) {
    qItem.linkId = 'linkIdPrefix' + qItem.linkId;
    return qItem;
  }

  return null;
}
