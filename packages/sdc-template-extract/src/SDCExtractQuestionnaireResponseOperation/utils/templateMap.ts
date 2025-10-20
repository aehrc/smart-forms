/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type { TemplateDetails } from '../interfaces/templateExtractPath.interface';
import { getQuestionnaireItem, getQuestionnaireResponseItemFhirPath } from './misc';
import type { TemplateExtractReference } from '../interfaces/templateExtractReference.interface';

/**
 * Builds a map of contained template resources (by `id`) to their contextual metadata
 * within the parent `Questionnaire` and `QuestionnaireResponse`.
 *
 * This is used to associate FHIR templates (typically contained `Questionnaire` resources)
 * with the specific `linkId` they are referenced from in the main questionnaire, based on
 * the `linkIdToTemplateExtractRefMap`.
 *
 * Each resulting `TemplateDetails` entry includes:
 * - the contained template resource,
 * - the `linkId` in the parent questionnaire that references it,
 * - the corresponding `Questionnaire.item`,
 * - and optionally the corresponding `QuestionnaireResponse.item` and its FHIRPath.
 *
 * @param {Questionnaire} questionnaire - The main questionnaire containing the template references and contained templates.
 * @param {QuestionnaireResponse} questionnaireResponse - The response associated with the questionnaire; may provide `item` context.
 * @param {Map<string, TemplateExtractReference>} linkIdToTemplateExtractRefMap - A map of linkId → template reference metadata.
 *
 * @returns {Map<string, TemplateDetails>} A map of template `id` → metadata for resolving contained templates and their context.
 */
export function createContainedTemplateMap(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  linkIdToTemplateExtractRefMap: Map<string, TemplateExtractReference[]>
): Map<string, TemplateDetails> {
  const templateMap = new Map<string, TemplateDetails>();
  if (questionnaire.contained) {
    // Create a templateId to linkId map
    const templateIdToLinkIdMap = createTemplateIdToLinkIdMap(linkIdToTemplateExtractRefMap);

    // Iterate over contained resources and map them to their templateId
    for (const containedResource of questionnaire.contained) {
      if (containedResource.id && templateIdToLinkIdMap.has(containedResource.id)) {
        // fallback to "" really shouldn't happen, since we have type safety on the line above, https://github.com/microsoft/TypeScript/issues/13086
        const targetLinkId = templateIdToLinkIdMap.get(containedResource.id) ?? '';

        const targetQItem = getQuestionnaireItem(questionnaire, targetLinkId);
        const targetQRItemFhirPath = getQuestionnaireResponseItemFhirPath(
          questionnaireResponse,
          targetLinkId
        );

        const templateExtractReferences = linkIdToTemplateExtractRefMap.get(targetLinkId);
        const templateExtractReference = templateExtractReferences?.find(
          (t) => t.templateId === containedResource.id
        );
        if (targetQItem && templateExtractReference) {
          templateMap.set(containedResource.id, {
            templateResource: containedResource,
            templateExtractReference,
            targetLinkId: targetLinkId,
            targetQItem: targetQItem,
            ...(targetQRItemFhirPath && { targetQRItemFhirPath })
          });
        }
      }
    }
  }

  return templateMap;
}

/**
 * Creates a reverse mapping from `templateId` to the `linkId` that references it.
 *
 * This is used to locate the `Questionnaire.item.linkId` that points to a particular
 * contained template resource, based on `linkIdToTemplateExtractRefMap` which maps linkIds
 * to their associated `TemplateExtractReference` metadata.
 *
 * @param {Map<string, TemplateExtractReference>} linkIdToTemplateExtractRefMap - A map of `linkId` to template reference info.
 *
 * @returns {Map<string, string>} A map of `templateId` → `linkId` that references the template.
 */
function createTemplateIdToLinkIdMap(
  linkIdToTemplateExtractRefMap: Map<string, TemplateExtractReference[]>
): Map<string, string> {
  const templateIdToLinkIdMap = new Map<string, string>();

  for (const [linkId, templateExtractRefs] of linkIdToTemplateExtractRefMap.entries()) {
    templateExtractRefs.forEach((templateExtractRef) => {
      if (templateExtractRef.templateId) {
        templateIdToLinkIdMap.set(templateExtractRef.templateId, linkId);
      }
    });
  }

  return templateIdToLinkIdMap;
}
