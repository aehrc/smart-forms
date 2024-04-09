/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
  Extension,
  FhirResource,
  OperationOutcome,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r4';
import { createErrorOutcome } from './operationOutcome';

/**
 * Propagate (assemble) collected properties from subquestionnaires to the parent questionnaire.
 *
 * @param parentQuestionnaire - The parent Questionnaire resource
 * @param urlsFromSubquestionnaires - The urls of the subquestionnaires
 * @param itemsFromSubquestionnaires - The items from the subquestionnaires
 * @param containedResourcesFromSubquestionnaires - The contained resources from the subquestionnaires
 * @param rootLevelExtensions - The root level extensions collected from the subquestionnaires
 * @param itemLevelExtensions - The item level extensions collected from the subquestionnaires
 * @returns The complete assembled Questionnaire resource
 *
 * @author Sean Fong
 */
export function propagateProperties(
  parentQuestionnaire: Questionnaire,
  urlsFromSubquestionnaires: string[],
  itemsFromSubquestionnaires: (QuestionnaireItem[] | null)[],
  containedResourcesFromSubquestionnaires: Record<string, FhirResource>,
  rootLevelExtensions: Extension[],
  itemLevelExtensions: (Extension[] | null)[]
): Questionnaire | OperationOutcome {
  if (!parentQuestionnaire.item || parentQuestionnaire.item.length === 0) {
    return parentQuestionnaire;
  }

  const parentQuestionnaireForm: QuestionnaireItem | undefined = parentQuestionnaire.item[0];

  if (!parentQuestionnaireForm?.item || parentQuestionnaireForm?.item?.length === 0) {
    return parentQuestionnaire;
  }

  // Propagate items
  const questionnaireItems: QuestionnaireItem[] = [];
  for (let i = 0; i < parentQuestionnaireForm.item.length; i++) {
    const itemFromParent = parentQuestionnaireForm.item[i];
    if (!itemFromParent) continue;

    const itemsFromSubquestionnaire = itemsFromSubquestionnaires[i];
    if (itemsFromSubquestionnaire) {
      questionnaireItems.push(...itemsFromSubquestionnaire);
    } else {
      questionnaireItems.push(itemFromParent);
    }
  }

  parentQuestionnaireForm.item = questionnaireItems;

  // Propagate item-level extensions into top-level item
  // Also check for duplicate variables
  const flattenedItemLevelExtensions = itemLevelExtensions.flatMap(
    (extensions) => extensions
  ) as Extension[];

  const combinedTopLevelItemExtensions = [
    ...(parentQuestionnaireForm.extension ?? []),
    ...flattenedItemLevelExtensions
  ];

  const checkResult = checkDuplicatesInTopLevelItemVariables(combinedTopLevelItemExtensions);
  if (checkResult !== null) {
    return checkResult;
  }

  parentQuestionnaireForm.extension = combinedTopLevelItemExtensions;

  parentQuestionnaire.item[0] = parentQuestionnaireForm;

  // Propagate contained resources
  const containedResources: FhirResource[] = parentQuestionnaire.contained
    ? parentQuestionnaire.contained
    : [];

  // Replace duplicate contained resources from subquestionnaires with resources from parent
  if (containedResources && containedResources.length > 0) {
    for (const resource of containedResources) {
      const resourceId = resource.id;
      if (resourceId && containedResourcesFromSubquestionnaires[resourceId]) {
        containedResourcesFromSubquestionnaires[resourceId] = resource;
      }
    }
  }

  // Merge in contained resources from subquestionnaires
  parentQuestionnaire.contained = [...Object.values(containedResourcesFromSubquestionnaires)];

  // Propagate root-level extensions
  const extensions: Extension[] = [];
  if (!parentQuestionnaire.extension) {
    extensions.push(...rootLevelExtensions);
  } else {
    const cqfLibraryAndLaunchContexts: Extension[] = [];
    const extensionsFromParent = parentQuestionnaire.extension;

    // Propagate cqf-library extension
    const cqfLibraryFromParent = extensionsFromParent.find(
      (extension: Extension) =>
        extension.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library'
    );

    // Merge in cqfLibrary from subquestionnaires only if it's not present in the parent
    if (cqfLibraryFromParent) {
      cqfLibraryAndLaunchContexts.push(cqfLibraryFromParent);
    } else {
      const cqfLibraryFromSubquestionnaires = rootLevelExtensions.find(
        (extension: Extension) =>
          extension.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library'
      );

      if (cqfLibraryFromSubquestionnaires) {
        cqfLibraryAndLaunchContexts.push(cqfLibraryFromSubquestionnaires);
      }
    }

    // Propagate launchContext extensions
    let launchContextExtensions: Record<string, Extension> = {};
    launchContextExtensions = getLaunchContextExtensions(
      extensionsFromParent,
      launchContextExtensions
    );
    launchContextExtensions = getLaunchContextExtensions(
      rootLevelExtensions,
      launchContextExtensions
    );

    cqfLibraryAndLaunchContexts.push(...Object.values(launchContextExtensions));

    // Filter initial cqfLibrary and LaunchContext extensions from parent extensions before merging new extensions
    const initialExtensions = extensionsFromParent.filter(
      (extension: Extension) =>
        !(
          extension.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library' ||
          extension.url ===
            'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext' ||
          (extension.url ===
            'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation' &&
            extension.valueCode === 'assemble-root')
        )
    );
    extensions.push(...initialExtensions, ...cqfLibraryAndLaunchContexts);
  }

  // Add assembledFrom extension to assembled questionnaire
  for (const url of urlsFromSubquestionnaires) {
    extensions.push({
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembledFrom',
      valueCanonical: url
    });
  }

  parentQuestionnaire.extension = extensions;

  // Add [version]-assembled attribute
  parentQuestionnaire.version = `${parentQuestionnaire.version}-assembled`;

  // Remove questionnaire-modular profile from meta
  if (parentQuestionnaire.meta?.profile) {
    parentQuestionnaire.meta.profile = parentQuestionnaire.meta?.profile?.filter(
      (profile) =>
        profile !== 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular'
    );
  }

  // Remove text element
  if (parentQuestionnaire.text) {
    delete parentQuestionnaire.text;
  }

  return parentQuestionnaire;
}

/**
 * Get launchContext extensions from parent Questionnaire extensions or root-level extensions
 *
 * @param extensions - An extension array from parent Questionnaire or root-level extensions
 * @param mergedLaunchContexts - A key-value pair of launchContext extensions (to prevent duplicate launchContexts)
 * @returns A key-value pair of launchContext extensions
 *
 * @author Sean Fong
 */
function getLaunchContextExtensions(
  extensions: Extension[],
  mergedLaunchContexts: Record<string, Extension>
) {
  const launchContexts = extensions.filter(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
  );

  if (launchContexts) {
    for (const launchContext of launchContexts) {
      if (launchContext.extension) {
        for (const ext of launchContext.extension) {
          if (ext.url === 'name') {
            if (ext.valueCoding && ext.valueCoding.code) {
              mergedLaunchContexts[ext.valueCoding.code] = launchContext;
              break;
            }
          }
        }
      }
    }
  }
  return mergedLaunchContexts;
}

function checkDuplicatesInTopLevelItemVariables(topLevelItemExtensions: Extension[]) {
  const extensionNames = new Set();

  for (const extension of topLevelItemExtensions) {
    const isVariable = extension.url === 'http://hl7.org/fhir/StructureDefinition/variable';
    const variableName = extension.valueExpression?.name;
    if (isVariable && variableName) {
      if (extensionNames.has(variableName)) {
        return createErrorOutcome(
          `The variable ${variableName} is duplicated, which is prohibited.`
        );
      }

      extensionNames.add(variableName);
    }
  }

  return null;
}
