import type {
  CodeableConcept,
  Observation,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { readQuestionnaireResponse, transverseQuestionnaire } from './genericRecursive';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';

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

  transverseQuestionnaire(questionnaire, mapQItemsExtractableRecursive, initialExtractMap);

  return initialExtractMap;
}

function mapQItemsExtractableRecursive(
  qItem: QuestionnaireItem,
  root?: Questionnaire,
  parent?: QuestionnaireItem,
  qItemExtrableMap?: Record<string, Extractable>
): void {
  if (!qItemExtrableMap) return;

  if (!qItemExtrableMap[qItem.linkId]) {
    qItemExtrableMap[qItem.linkId] = { extractable: false, extractCategories: [] };
  }

  // Check if questionnaire extractable
  const extension = qItem.extension?.find((e) => e.url === FHIR_OBSERVATION_EXTRACT_EXTENSION);

  if (extension?.valueBoolean || extension?.valueBoolean === false) {
    qItemExtrableMap[qItem.linkId].extractable = extension?.valueBoolean ?? false;
  } else if (parent && qItemExtrableMap[parent.linkId]) {
    qItemExtrableMap[qItem.linkId].extractable = qItemExtrableMap[parent.linkId].extractable;
  } else if (root && qItemExtrableMap[root.id ?? 'root']) {
    qItemExtrableMap[qItem.linkId].extractable = qItemExtrableMap[root?.id ?? 'root'].extractable;
  } else {
    qItemExtrableMap[qItem.linkId].extractable = false;
  }

  // if questionnaire extractable, check for extract category
  if (qItemExtrableMap[qItem.linkId].extractable) {
    const extractCategoryExts = qItem.extension
      ?.filter(
        (e) => e.url === FHIR_OBSERVATION_EXTRACT_CATEGORY_EXTENSION && e.valueCodeableConcept
      )
      ?.map((e) => e.valueCodeableConcept) as CodeableConcept[] | undefined;

    if (extractCategoryExts) {
      qItemExtrableMap[qItem.linkId].extractCategories = extractCategoryExts;
    } else if (parent && qItemExtrableMap[parent.linkId].extractCategories.length) {
      qItemExtrableMap[qItem.linkId].extractCategories =
        qItemExtrableMap[parent.linkId].extractCategories;
    } else if (root && qItemExtrableMap[root.id ?? 'root'].extractCategories.length) {
      qItemExtrableMap[qItem.linkId].extractCategories =
        qItemExtrableMap[root?.id ?? 'root'].extractCategories;
    } else {
      qItemExtrableMap[qItem.linkId].extractCategories = [];
    }
  }

  if (qItem.item && qItem.item.length !== 0) {
    for (const qChildItem of qItem.item) {
      mapQItemsExtractableRecursive(qChildItem, root, qItem, qItemExtrableMap);
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
    ...removeIfNull('basedOn', questionnaireResponse.basedOn),
    ...removeIfNull('partOf', questionnaireResponse.partOf),
    ...removeIfNull('subject', questionnaireResponse.subject),
    ...removeIfNull('encounter', questionnaireResponse.encounter),
    derivedFrom: [{ reference: qrRef }],
    ...removeIfNull('effectiveDateTime', questionnaireResponse.authored),
    ...removeIfNull('issued', questionnaireResponse.authored),
    ...removeIfNull('author', questionnaireResponse.author)
  };

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
    observation.valueCodeableConcept = { coding: [answer.valueCoding] };
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
