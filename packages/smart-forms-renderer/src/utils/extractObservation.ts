import type {
  CodeableConcept,
  Observation,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { readQuestionnaireResponse } from './genericRecursive';

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

  return readQuestionnaireResponse(
    questionnaire,
    questionnaireResponse,
    extractObservationBasedRecursive,
    questionnaireResponse
  );
}

function extractObservationBasedRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  qr?: QuestionnaireResponse
): Observation[] | null {
  // Process items with child items
  const observations: Observation[] = [];
  if (qr) {
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
          (e) =>
            e.url ===
            'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observation-extract-category'
        );

        exts.forEach((e) => e.valueCodeableConcept && categories.push(e.valueCodeableConcept));
      }
    }

    for (const responseItem of qrItems) {
      // Check if the response item has any values or nested items
      if (responseItem.answer && responseItem.answer.length > 0) {
        for (const answer of responseItem.answer) {
          const observation = createObservation(qItem, qr, answer, categories);

          observations.push(observation);
        }
      }
    }

    return observations;
  }

  return observations;
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
      coding: [
        {
          ...removeIfNull('system', questionnaireItem.code?.[0]?.system),
          ...removeIfNull('code', questionnaireItem.code?.[0]?.code),
          ...removeIfNull('display', questionnaireItem.code?.[0]?.display)
        }
      ]
    },
    ...removeIfNull('basedOn', questionnaireResponse.basedOn),
    ...removeIfNull('partOf', questionnaireResponse.partOf),
    ...removeIfNull('subject', questionnaireResponse.subject),
    ...removeIfNull('encounter', questionnaireResponse.encounter),
    derivedFrom: [{ reference: qrRef }],
    ...removeIfNull('effectiveDateTime', questionnaireResponse.authored)
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

function removeIfNull<T, U>(
  key: string,
  value?: T,
  expectedValue?: U
): Record<string, T> | Record<string, U> | Record<string, never> {
  if (!value) return {};

  if (expectedValue) return { [key]: expectedValue };

  return { [key]: value };
}
