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

import type {
  Bundle,
  CodeableConcept,
  Observation,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { readQuestionnaireResponse, traverseQuestionnaire } from './genericRecursive';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { nanoid } from 'nanoid';
import { getRelevantCodingProperties } from './choice';

/**
 * Extract an array of Observations from a QuestionnaireResponse and its source Questionnaire.
 * @see https://build.fhir.org/ig/HL7/sdc/extraction.html#observation-based-extraction
 *
 * @author Riza Nafis
 */
export function extractObservationBased(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Observation[] {
  const observations: Observation[] = [];

  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !questionnaireResponse.item ||
    questionnaireResponse.item.length === 0
  ) {
    return observations;
  }

  if (!questionnaireResponse.id) {
    questionnaireResponse.id = generateUniqueId(
      (questionnaireResponse.identifier && questionnaireResponse.identifier.value) || 'QR'
    );
  }

  const qItemExtractableMap = mapQItemsExtractable(questionnaire);

  return readQuestionnaireResponse(
    questionnaire,
    questionnaireResponse,
    extractObservationBasedRecursive,
    { qr: questionnaireResponse, qItemMap: qItemExtractableMap }
  );
}

const FHIR_OBSERVATION_EXTRACT_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract';

const FHIR_OBSERVATION_EXTRACT_CATEGORY_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observation-extract-category';

function extractObservationBasedRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  extraData?: { qr: QuestionnaireResponse; qItemMap: Record<string, Extractable> }
): Observation[] | null {
  // Process items with child items
  const observations: Observation[] = [];

  if (!extraData?.qr || !extraData?.qItemMap) return observations;

  // Map qrItemOrItems into an array of qrItems
  let qrItems: QuestionnaireResponseItem[] = [];
  if (qrItemOrItems) {
    if (Array.isArray(qrItemOrItems)) {
      qrItems = qrItemOrItems;
    } else {
      qrItems = [qrItemOrItems];
    }
  }

  for (const responseItem of qrItems) {
    // Check if the response item has any values or nested items
    if (responseItem.answer && responseItem.answer.length > 0) {
      for (const answer of responseItem.answer) {
        const currentQItemExtractable = extraData.qItemMap[qItem.linkId];

        if (currentQItemExtractable.extractable) {
          const observation = createObservation(
            qItem,
            extraData.qr,
            answer,
            currentQItemExtractable.extractCategories
          );

          observations.push(observation);
        }
      }
    }
  }

  const childQItems = qItem.item;
  if (!childQItems || childQItems.length === 0) return observations;

  // Map qrItemOrItems into an array of qrItems
  let childQrItems: QuestionnaireResponseItem[] = [];
  if (qrItemOrItems) {
    if (Array.isArray(qrItemOrItems)) {
      childQrItems = qrItemOrItems;
    } else {
      childQrItems = qrItemOrItems.item ?? [];
    }
  }

  const indexMap = mapQItemsIndex(qItem);
  const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

  for (const [index, childQItem] of childQItems.entries()) {
    const childQRItemOrItems = qrItemsByIndex[index];

    const childObservations = extractObservationBasedRecursive(
      childQItem,
      childQRItemOrItems ?? null,
      extraData
    );

    if (childObservations) {
      observations.push(...childObservations);
    }
  }

  return observations;
}

export type Extractable = {
  extractable: boolean;
  extractCategories: CodeableConcept[];
};

export function mapQItemsExtractable(questionnaire: Questionnaire): Record<string, Extractable> {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  const initialExtension = questionnaire.extension?.find(
    (e) => e.url === FHIR_OBSERVATION_EXTRACT_EXTENSION
  );

  const extractCategoryExts = questionnaire.extension
    ?.filter((e) => e.url === FHIR_OBSERVATION_EXTRACT_CATEGORY_EXTENSION && e.valueCodeableConcept)
    ?.map((e) => e.valueCodeableConcept) as CodeableConcept[] | undefined;

  const initialExtractMap: Record<string, Extractable> = {
    [questionnaire.id ?? 'root']: {
      extractable: initialExtension?.valueBoolean ?? false,
      extractCategories: extractCategoryExts ?? []
    }
  };

  traverseQuestionnaire(questionnaire, mapQItemsExtractableRecursive, initialExtractMap);

  return initialExtractMap;
}

function mapQItemsExtractableRecursive(
  qItem: QuestionnaireItem,
  root?: Questionnaire,
  parent?: QuestionnaireItem,
  qItemExtractableMap?: Record<string, Extractable>
): void {
  if (!qItemExtractableMap) return;

  if (!qItemExtractableMap[qItem.linkId]) {
    qItemExtractableMap[qItem.linkId] = { extractable: false, extractCategories: [] };
  }

  // Check if questionnaireItem is observation-extractable
  const extension = qItem.extension?.find((e) => e.url === FHIR_OBSERVATION_EXTRACT_EXTENSION);

  if (extension?.valueBoolean || extension?.valueBoolean === false) {
    qItemExtractableMap[qItem.linkId].extractable = extension?.valueBoolean ?? false;
  } else if (parent && qItemExtractableMap[parent.linkId]) {
    qItemExtractableMap[qItem.linkId].extractable = qItemExtractableMap[parent.linkId].extractable;
  } else if (root && qItemExtractableMap[root.id ?? 'root']) {
    qItemExtractableMap[qItem.linkId].extractable =
      qItemExtractableMap[root?.id ?? 'root'].extractable;
  } else {
    qItemExtractableMap[qItem.linkId].extractable = false;
  }

  // if questionnaire extractable, check for extract category
  if (qItemExtractableMap[qItem.linkId].extractable) {
    const extractCategoryExts = qItem.extension
      ?.filter(
        (e) => e.url === FHIR_OBSERVATION_EXTRACT_CATEGORY_EXTENSION && e.valueCodeableConcept
      )
      ?.map((e) => e.valueCodeableConcept) as CodeableConcept[] | undefined;

    if (extractCategoryExts) {
      qItemExtractableMap[qItem.linkId].extractCategories = extractCategoryExts;
    } else if (parent && qItemExtractableMap[parent.linkId].extractCategories.length) {
      qItemExtractableMap[qItem.linkId].extractCategories =
        qItemExtractableMap[parent.linkId].extractCategories;
    } else if (root && qItemExtractableMap[root.id ?? 'root'].extractCategories.length) {
      qItemExtractableMap[qItem.linkId].extractCategories =
        qItemExtractableMap[root?.id ?? 'root'].extractCategories;
    } else {
      qItemExtractableMap[qItem.linkId].extractCategories = [];
    }
  }

  if (qItem.item && qItem.item.length !== 0) {
    for (const qChildItem of qItem.item) {
      mapQItemsExtractableRecursive(qChildItem, root, qItem, qItemExtractableMap);
    }
  }
}

export function createObservation(
  questionnaireItem: QuestionnaireItem,
  questionnaireResponse: QuestionnaireResponse,
  answer: QuestionnaireResponseItemAnswer,
  categories: CodeableConcept[]
): Observation {
  const qrRef = `QuestionnaireResponse/${questionnaireResponse.id}`;

  const observation: Observation = {
    resourceType: 'Observation',
    status: 'final',
    ...removeIfNull('id', questionnaireItem.linkId, `obs-${questionnaireItem.linkId}`),
    code: {
      coding:
        questionnaireItem.code?.map((c) => ({
          ...removeIfNull('system', c.system),
          ...removeIfNull('code', c.code),
          ...removeIfNull('display', c.display)
        })) ?? []
    },
    derivedFrom: [{ reference: qrRef }]
  };

  // Add comprehensive checks for all QuestionnaireResponse fields
  if (questionnaireResponse.basedOn) {
    observation.basedOn = questionnaireResponse.basedOn;
  }

  if (questionnaireResponse.partOf) {
    observation.partOf = questionnaireResponse.partOf;
  }

  if (questionnaireResponse.subject) {
    observation.subject = questionnaireResponse.subject;
  }

  if (questionnaireResponse.encounter) {
    observation.encounter = questionnaireResponse.encounter;
  }

  if (questionnaireResponse.authored) {
    observation.effectiveDateTime = questionnaireResponse.authored;
    observation.issued = questionnaireResponse.authored;
  }

  if (questionnaireResponse.author) {
    observation.performer = [questionnaireResponse.author];
  }

  // Additional checks for other QuestionnaireResponse fields
  if (questionnaireResponse.identifier) {
    // Ensure identifier is an array for Observation
    observation.identifier = Array.isArray(questionnaireResponse.identifier)
      ? questionnaireResponse.identifier
      : [questionnaireResponse.identifier];
  }

  // Set the value of the Observation based on the answer type
  if (answer.valueQuantity) {
    observation.valueQuantity = answer.valueQuantity;
  } else if (answer.valueString) {
    observation.valueString = answer.valueString;
  } else if (answer.valueBoolean) {
    observation.valueBoolean = answer.valueBoolean;
  } else if (answer.valueInteger) {
    observation.valueInteger = answer.valueInteger;
  } else if (answer.valueCoding) {
    observation.valueCodeableConcept = {
      coding: [getRelevantCodingProperties(answer.valueCoding)]
    };
  }

  if (categories.length) {
    observation.category = categories;
  }

  return observation;
}

let ID_COUNTER = 0;

export function generateUniqueId(prefix: string) {
  if (ID_COUNTER) {
    ID_COUNTER = 0;
  }

  return (
    prefix + '-' + Date.now() + '-' + ++ID_COUNTER + '-' + Math.random().toString(16).substring(2)
  );
}

function removeIfNull<T, U>(
  key: string,
  value?: T,
  expectedValue?: U
): Record<string, T> | Record<string, U> | Record<string, never> {
  if (!value) return {};

  if (expectedValue) return { [key]: expectedValue };

  return { [key]: value };
}

/**
 * Checks whether a Questionnaire or any of its items contains a valid `sdc-questionnaire-observationExtract` extension (and if it's at the item level, a valid item.code too).
 * Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension.
 *
 * @param questionnaire - The FHIR Questionnaire to check.
 * @returns `true` if at least one valid observationExtract extension exists.
 */
export function canBeObservationExtracted(questionnaire: Questionnaire): boolean {
  // Check Questionnaire-level extension
  const isObservationExtractable = hasObservationExtractExtension(questionnaire);
  if (isObservationExtractable) {
    return true;
  }

  // Check item-level extensions recursively
  if (questionnaire.item) {
    return questionnaire.item.some((item) => hasObservationExtractExtensionRecursive(item));
  }

  return false;
}

/**
 * Recursively checks whether a `QuestionnaireItem` or any of its child items contains a `sdc-questionnaire-observationExtract` extension (and if it's at the item level, a valid item.code too).
 * Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension.
 */
function hasObservationExtractExtensionRecursive(item: QuestionnaireItem): boolean {
  const isObservationExtractable = hasObservationExtractExtension(item);
  if (isObservationExtractable) {
    return true;
  }

  return item.item?.some((child) => hasObservationExtractExtensionRecursive(child)) ?? false;
}

/**
 * Checks if a Questionnaire or QuestionnaireItem has a `sdc-questionnaire-observationExtract` extension.
 * For items, also ensures that there is an item.code.
 */
function hasObservationExtractExtension(item: QuestionnaireItem | Questionnaire): boolean {
  const observationExtractPresent = !!item.extension?.find(
    (ext) => ext.url === FHIR_OBSERVATION_EXTRACT_EXTENSION
  );

  // Check if the item has a linkId (means it's a QuestionnaireItem), item.code must be present
  // This does not apply to the Questionnaire-level, hence itemCodePresent defaults to true
  let itemCodePresent = true;
  if ('linkId' in item) {
    itemCodePresent = !!item.code && item.code.length > 0;
  }

  return observationExtractPresent && itemCodePresent;
}

export function buildBundleFromObservationArray(observations: Observation[]): Bundle {
  return {
    resourceType: 'Bundle',
    id: `sdc-observation-extract-${nanoid()}`,
    meta: {
      tag: [
        {
          code: '@aehrc/smart-forms-renderer:generated',
          system: 'urn:aehrc:sdc-template-extract'
        }
      ]
    },
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: observations.map((observation) => {
      const observationId = observation.id || `obs-${nanoid()}`;
      return {
        fullUrl: `Observation/${observationId}`,
        resource: observation,
        request: {
          method: 'POST',
          url: 'Observation'
        }
      };
    })
  };
}
