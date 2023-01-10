import type { Extension, FhirResource, Questionnaire, QuestionnaireItem } from 'fhir/r5';

export function propagateSubquestionnaireItems(
  parentQuestionnaire: Questionnaire,
  itemsFromSubquestionnaires: (QuestionnaireItem[] | null)[],
  containedResourcesFromSubquestionnaires: Record<string, FhirResource>,
  rootLevelExtensions: Extension[]
): Questionnaire {
  if (!parentQuestionnaire.item || parentQuestionnaire.item.length === 0) {
    return parentQuestionnaire;
  }

  const parentQuestionnaireForm = parentQuestionnaire.item[0];

  if (
    !parentQuestionnaireForm ||
    !parentQuestionnaireForm.item ||
    parentQuestionnaireForm.item.length === 0
  ) {
    return parentQuestionnaire;
  }

  // Propagate items
  const questionnaireItems: QuestionnaireItem[] = [];
  for (let i = 0; i < parentQuestionnaireForm.item.length; i++) {
    const itemFromParentQuestionnaire = parentQuestionnaireForm.item[i];
    if (!itemFromParentQuestionnaire) continue;

    const itemsFromSubquestionnaire = itemsFromSubquestionnaires[i];
    if (itemsFromSubquestionnaire) {
      questionnaireItems.push(...itemsFromSubquestionnaire);
    } else {
      questionnaireItems.push(itemFromParentQuestionnaire);
    }
  }
  parentQuestionnaire.item = questionnaireItems;

  // Propagate contained resources
  const containedResources: FhirResource[] = parentQuestionnaire.contained
    ? parentQuestionnaire.contained
    : [];

  // Replace duplicate contained resources from subquestionnaires with resources from parent
  if (containedResources.length > 0) {
    for (const resource of containedResources) {
      const resourceId = resource.id;
      if (resourceId && containedResourcesFromSubquestionnaires[resourceId]) {
        containedResourcesFromSubquestionnaires[resourceId] = resource;
      }
    }
  }

  // Merge in contained resources from subquestionnaires
  containedResources.push(...Object.values(containedResourcesFromSubquestionnaires));
  parentQuestionnaire.contained = containedResources;

  // Propagate root-level extensions
  const extensions: Extension[] = [];
  if (!parentQuestionnaire.extension) {
    extensions.push(...rootLevelExtensions);
  } else {
    const cqfLibraryAndLaunchContexts: Extension[] = [];
    const extensionsFromParentQuestionnaire = parentQuestionnaire.extension;

    // Propagate cqf-library extension
    const cqfLibraryFromParent = extensionsFromParentQuestionnaire.find(
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
    let mergedLaunchContexts: Record<string, Extension> = {};
    mergedLaunchContexts = mergeLaunchContextsFromExtensions(
      extensionsFromParentQuestionnaire,
      mergedLaunchContexts
    );

    mergedLaunchContexts = mergeLaunchContextsFromExtensions(
      rootLevelExtensions,
      mergedLaunchContexts
    );

    cqfLibraryAndLaunchContexts.push(...Object.values(mergedLaunchContexts));

    // Filter initial cqfLibrary and LaunchContext extensions from parent extensions before merging new extensions
    const initialExtensions = extensionsFromParentQuestionnaire.filter(
      (extension: Extension) =>
        !(
          extension.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library' ||
          extension.url ===
            'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext'
        )
    );
    extensions.push(...initialExtensions, ...cqfLibraryAndLaunchContexts);
  }
  parentQuestionnaire.extension = extensions;

  return parentQuestionnaire;
}

function mergeLaunchContextsFromExtensions(
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
