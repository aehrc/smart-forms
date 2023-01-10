import type {
  Extension,
  FhirResource,
  OperationOutcome,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r5';
import { createOperationOutcome } from './CreateOutcomes';
import type { PropagatedExtensions, PropagatedItems } from './Interfaces';
import { resolveDuplicateLinkIds } from './ResolveDuplicateLinkIds';
import { resolveDuplicateEnableWhenQuestions } from './ResolveDuplicateEnableWhenQuestions';

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

export function getContainedResources(
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

// TODO Commemnting this piece of code out in the case where we need to resolve duplicate contained resources.
// TODO At the moment multiple subquestionnaires contains same references to a contained resource for convenience
// Usage:
// if (containedResources[resourceId]) {
//   const prefixedResourceId = assignResourceIdPrefix(resourceId, containedResources);
//   containedResources[prefixedResourceId] = resource;
// } else {
//   containedResources[resourceId] = resource;
// }
//
// function assignResourceIdPrefix(
//   resourceId: string,
//   containedResources: Record<string, FhirResource>
// ) {
//   const linkIdPrefix = 'linkIdPrefix';
//   let prefixedId = linkIdPrefix + '-' + resourceId;
//
//   // Increment prefixCount on linkIdPrefix until it is not a duplicate
//   let prefixCount = 0;
//   while (containedResources[prefixedId]) {
//     prefixCount++;
//     prefixedId = linkIdPrefix + '-' + prefixCount.toString() + '-' + resourceId;
//   }
//   return prefixedId;
// }

export function getExtensions(
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
                  launchContexts[ext.valueCoding.code] = extension;
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

export function isValidExtensions(
  obj: PropagatedExtensions | OperationOutcome
): obj is PropagatedExtensions {
  return 'rootLevelExtensions' in obj && 'itemLevelExtensions' in obj;
}

export function getSubquestionnaireItems(subquestionnaires: Questionnaire[]): PropagatedItems {
  const items: (QuestionnaireItem[] | null)[] = [];
  const linkIds: Set<string> = new Set();
  for (const subquestionnaire of subquestionnaires) {
    if (!subquestionnaire.item) {
      items.push(null);
      continue;
    }

    // Resolve duplicate linkIds in items recursively by prepending linkIdPrefixes to duplicate linkIds
    let subquestionnaireItems = [];
    const duplicateLinkIds: Record<string, string> = {};
    for (const item of subquestionnaire.item) {
      const resolvedItem = resolveDuplicateLinkIds(item, linkIds, duplicateLinkIds);
      if (resolvedItem) {
        subquestionnaireItems.push(resolvedItem);
        linkIds.add(resolvedItem.linkId);
      } else {
        subquestionnaireItems.push(item);
        linkIds.add(item.linkId);
      }
    }

    // Prepend linkIdPrefix to EnableWhen.question of linked items with duplicate linkIds recursively
    if (duplicateLinkIds && Object.keys(duplicateLinkIds).length > 0) {
      // console.log(duplicateLinkIds);
      const newSubquestionnaireItems: QuestionnaireItem[] = [];
      for (const item of subquestionnaireItems) {
        const resolvedItem = resolveDuplicateEnableWhenQuestions(item, duplicateLinkIds);
        newSubquestionnaireItems.push(resolvedItem);
      }
      subquestionnaireItems = [...newSubquestionnaireItems];
    }

    items.push(subquestionnaireItems);
  }
  return { items, linkIds };
}

export function mergeExtensionsIntoItems(
  items: (QuestionnaireItem[] | null)[],
  itemLevelExtensions: (Extension[] | null)[]
): (QuestionnaireItem[] | null)[] {
  const newItems: (QuestionnaireItem[] | null)[] = [];
  for (let i = 0; i < items.length; i++) {
    const subquestionnaireItems = items[i];
    if (!subquestionnaireItems) {
      newItems.push(null);
      continue;
    }

    const newSubquestionnaireItems: QuestionnaireItem[] = [];
    for (const qItem of subquestionnaireItems) {
      const extensions = itemLevelExtensions[i];
      if (extensions) {
        const qItemExtensions: Extension[] = qItem.extension ? qItem.extension : [];
        qItemExtensions.push(...extensions);
        qItem.extension = qItemExtensions;
      }

      newSubquestionnaireItems.push(qItem);
    }
    newItems.push(newSubquestionnaireItems);
  }
  return newItems;
}
