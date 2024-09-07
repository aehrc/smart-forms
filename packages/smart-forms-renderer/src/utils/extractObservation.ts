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
  extraData?: { qr: QuestionnaireResponse; qItemMap: Record<string, boolean> }
): Observation[] | null {
  // Process items with child items
  const observations: Observation[] = [];

  if (!extraData?.qr || !extraData?.qItemMap) return observations;

  if (!extraData.qItemMap[qItem.linkId]) return observations;

  // Map qrItemOrItems into an array of qrItems
  let qrItems: QuestionnaireResponseItem[] = [];
  if (qrItemOrItems) {
    if (Array.isArray(qrItemOrItems)) {
      qrItems = qrItemOrItems;
    } else {
      qrItems = [qrItemOrItems];
    }
  }

  const categories: CodeableConcept[] = [];

  for (const responseItem of qrItems) {
    if (categories.length) break;

    if (responseItem.extension) {
      const exts = responseItem.extension.filter(
        (e) => e.url === FHIR_OBSERVATION_EXTRACT_CATEGORY_EXTENSION
      );

      exts.forEach((e) => e.valueCodeableConcept && categories.push(e.valueCodeableConcept));
    }
  }

  for (const responseItem of qrItems) {
    // Check if the response item has any values or nested items
    if (responseItem.answer && responseItem.answer.length > 0) {
      for (const answer of responseItem.answer) {
        const observation = createObservation(qItem, extraData.qr, answer, categories);

        observations.push(observation);
      }
    }
  }

  return observations;
}

export function mapQItemsExtractable(questionnaire: Questionnaire): Record<string, boolean> {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  const initialExtension = questionnaire.extension?.find(
    (e) => e.url === FHIR_OBSERVATION_EXTRACT_EXTENSION
  );

  const initialExtractMap: Record<string, boolean> = {
    [questionnaire.id ?? 'root']: initialExtension?.valueBoolean ?? false
  };

  transverseQuestionnaire(questionnaire, mapQItemsExtractableRecursive, initialExtractMap);

  return initialExtractMap;
}

function mapQItemsExtractableRecursive(
  qItem: QuestionnaireItem,
  root?: Questionnaire,
  parent?: QuestionnaireItem,
  qItemExtrableMap?: Record<string, boolean>
): void {
  if (!qItemExtrableMap) return;

  const extension = qItem.extension?.find((e) => e.url === FHIR_OBSERVATION_EXTRACT_EXTENSION);

  if (extension?.valueBoolean) {
    qItemExtrableMap[qItem.linkId] = true;
  } else if (parent && qItemExtrableMap[parent.linkId]) {
    qItemExtrableMap[qItem.linkId] = qItemExtrableMap[parent.linkId];
  } else if (root && qItemExtrableMap[root.id ?? 'root']) {
    qItemExtrableMap[qItem.linkId] = qItemExtrableMap[root?.id ?? 'root'];
  } else {
    qItemExtrableMap[qItem.linkId] = false;
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

function generateUniqueId(prefix: string) {
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
