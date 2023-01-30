/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Reference
} from 'fhir/r5';
import type { InitialExpression, ValueSetPromise } from './Interfaces';
import { addValueSetAnswers, getValueSetPromise, resolvePromises } from './ProcessValueSets';

const cleanQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

/**
 * Constructs a questionnaireResponse recursively from a specified questionnaire, its subject and its initialExpressions.
 *
 * @author Sean Fong
 */
export async function constructResponse(
  questionnaire: Questionnaire,
  subject: Reference,
  initialExpressions: Record<string, InitialExpression>
): Promise<QuestionnaireResponse> {
  const questionnaireResponse = cleanQuestionnaireResponse;
  let valueSetPromises: Record<string, ValueSetPromise> = {};

  if (!questionnaire.item) return questionnaireResponse;
  const qForm = questionnaire.item[0];

  if (!qForm) return questionnaireResponse;
  let qrForm: QuestionnaireResponseItem = {
    linkId: qForm.linkId,
    text: qForm.text,
    item: []
  };

  qrForm = readQuestionnaire(questionnaire, qrForm, initialExpressions, valueSetPromises);
  valueSetPromises = await resolvePromises(valueSetPromises);
  qrForm = addValueSetAnswers(qrForm, valueSetPromises);

  questionnaireResponse.questionnaire = 'Questionnaire/' + questionnaire.id;
  questionnaireResponse.item = [qrForm];
  questionnaireResponse.subject = subject;

  return questionnaireResponse;
}

/**
 * Read items within a questionnaire recursively and generates a questionnaireResponseItem to be added to the populated response.
 *
 * @author Sean Fong
 */
function readQuestionnaire(
  questionnaire: Questionnaire,
  qrForm: QuestionnaireResponseItem,
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem {
  if (!questionnaire.item) return qrForm;

  questionnaire.item.forEach((item) => {
    const newQrForm = readQuestionnaireItem(item, qrForm, initialExpressions, valueSetPromises);
    if (newQrForm) {
      qrForm = { ...newQrForm };
    }
  });
  return qrForm;
}

/**
 * Read a single questionnaire item/group recursively and generating questionnaire response items from initialExpressions if present
 *
 * @author Sean Fong
 */
function readQuestionnaireItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem | null {
  const items = qItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

    items.forEach((item) => {
      const newQrItem = readQuestionnaireItem(item, qrItem, initialExpressions, valueSetPromises);
      if (newQrItem) {
        qrItems.push(newQrItem);
      }
    });

    return qrItems.length > 0
      ? {
          linkId: qItem.linkId,
          text: qItem.text,
          item: qrItems
        }
      : null;
  }

  const initialExpression = initialExpressions[qItem.linkId];
  if (initialExpression) {
    const initialValues = initialExpression.value;

    if (initialValues && initialValues.length) {
      const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);

      if (expandRequired && qItem.answerValueSet) {
        const valueSetUrl = qItem.answerValueSet;
        getValueSetPromise(qItem, valueSetUrl, valueSetPromises);
      }

      return {
        linkId: qItem.linkId,
        text: qItem.text,
        answer: newValues
      };
    }
  }
  return null;
}

/**
 * Determine a specific value[x] type from an initialValue answer
 *
 * @author Sean Fong
 */
function getAnswerValues(
  initialValues: any[],
  qItem: QuestionnaireItem
): { newValues: QuestionnaireResponseItemAnswer[]; expandRequired: boolean } {
  let expandRequired = false;
  const newValues = initialValues.map((value: any): QuestionnaireResponseItemAnswer => {
    if (qItem.answerOption) {
      const answerOption = qItem.answerOption.find(
        (option: QuestionnaireItemAnswerOption) => option.valueCoding?.code === value
      );

      if (answerOption) return answerOption;
    }

    if (typeof value === 'boolean') {
      return { valueBoolean: value };
    } else if (typeof value === 'object') {
      return { valueCoding: value };
    } else if (typeof value === 'number') {
      return Number.isInteger(value) ? { valueInteger: value } : { valueDecimal: value };
    } else if (checkIsDate(value)) {
      return { valueDate: value };
    } else {
      // Process answerValueSets only if value is a string - so we don't make unnecessary $expand requests
      if (qItem.answerValueSet && !qItem.answerValueSet.startsWith('#')) {
        expandRequired = true;
      }

      return { valueString: value };
    }
  });
  return { newValues, expandRequired };
}

/**
 * Check if an answer is a date in the format YYYY-MM-DD
 *
 * @author Sean Fong
 */
export function checkIsDate(value: string): boolean {
  const hasDateHyphens = value[4] === '-' && value[7] === '-';
  const hasYear = /^-?\d+$/.test(value.slice(0, 4));
  const hasMonth = /^-?\d+$/.test(value.slice(5, 7));
  const hasDate = /^-?\d+$/.test(value.slice(8, 10));

  return hasDateHyphens && hasYear && hasMonth && hasDate && value.length === 10;
}
