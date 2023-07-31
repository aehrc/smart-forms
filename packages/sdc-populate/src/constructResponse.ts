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
} from 'fhir/r4';
import type { InitialExpression, ValueSetPromise } from './interfaces/expressions.interface';
import { addValueSetAnswers, getValueSetPromise, resolvePromises } from './processValueSets';
import moment from 'moment';
import dayjs from 'dayjs';

/**
 * Constructs a questionnaireResponse recursively from a specified questionnaire, its subject and its initialExpressions
 *
 * @param questionnaire - The questionnaire resource to construct a response from
 * @param subject - A subject reference to form the subject within the response
 * @param initialExpressions - A key-value pair of <linkId, initialExpressions> to be used for population
 * @returns A populated questionnaire response wrapped within a Promise
 *
 * @author Sean Fong
 */
export async function constructResponse(
  questionnaire: Questionnaire,
  subject: Reference,
  initialExpressions: Record<string, InitialExpression>
): Promise<QuestionnaireResponse> {
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  };

  let valueSetPromises: Record<string, ValueSetPromise> = {};

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return questionnaireResponse;
  }

  // Populate questionnaire response as a two-step process
  // In first step, populate answers from initialExpressions and get answerValueSet promises wherever population of valueSet answers are required
  // In second step, resolves all promises in parallel and populate valueSet answers by comparing their codes
  const topLevelQRItems: QuestionnaireResponseItem[] = [];
  for (const qItem of questionnaire.item) {
    const newTopLevelQRItem = constructResponseItemRecursive(
      qItem,
      {
        linkId: qItem.linkId,
        text: qItem.text,
        item: []
      },
      initialExpressions,
      valueSetPromises
    );

    if (Array.isArray(newTopLevelQRItem)) {
      topLevelQRItems.push(...newTopLevelQRItem);
      continue;
    }

    if (newTopLevelQRItem) {
      topLevelQRItems.push(newTopLevelQRItem);
      continue;
    }

    topLevelQRItems.push({
      linkId: qItem.linkId,
      text: qItem.text,
      item: []
    });
  }

  valueSetPromises = await resolvePromises(valueSetPromises);
  const updatedTopLevelQRItems: QuestionnaireResponseItem[] = topLevelQRItems.map((qrItem) =>
    addValueSetAnswers(qrItem, valueSetPromises)
  );

  questionnaireResponse.questionnaire = questionnaire.url;
  questionnaireResponse.item = updatedTopLevelQRItems;
  questionnaireResponse.subject = subject;

  return questionnaireResponse;
}

/**
 * Read a single questionnaire item/group recursively and generating questionnaire response items from initialExpressions if present
 *
 * @author Sean Fong
 */
function constructResponseItemRecursive(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  const items = qItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

    // If qItem is a repeat group, populate instances of repeat groups containing child items
    if (qItem.type === 'group' && qItem.repeats) {
      // Create number of repeat group instances based on the number of answers that the first child item has
      return constructRepeatGroupInstances(qItem, initialExpressions, valueSetPromises);
    }

    // Otherwise loop through qItem as usual
    items.forEach((item) => {
      const newQrItem = constructResponseItemRecursive(
        item,
        qrItem,
        initialExpressions,
        valueSetPromises
      );

      if (Array.isArray(newQrItem)) {
        qrItems.push(...newQrItem);
      } else if (newQrItem) {
        qrItems.push(newQrItem);
      }
    });

    return constructGroupItem(qItem, qrItems, initialExpressions, valueSetPromises);
  }

  return constructSingleItem(qItem, initialExpressions, valueSetPromises);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem | null {
  // Populate answers from initialExpressions if present
  const initialExpression = initialExpressions[qItem.linkId];
  let populatedAnswers: QuestionnaireResponseItemAnswer[] | undefined;
  if (initialExpression) {
    const initialValues = initialExpression.value;

    if (initialValues && initialValues.length) {
      const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);
      populatedAnswers = newValues;

      if (expandRequired && qItem.answerValueSet) {
        const valueSetUrl = qItem.answerValueSet;
        getValueSetPromise(qItem, valueSetUrl, valueSetPromises);
      }
    }
  }

  return qrItems.length > 0 || populatedAnswers
    ? {
        linkId: qItem.linkId,
        text: qItem.text,
        item: qrItems,
        ...(qrItems.length > 0 ? { item: qrItems } : {}),
        ...(populatedAnswers ? { answer: populatedAnswers } : {})
      }
    : null;
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem | null {
  // Populate answers from initialExpressions if present
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

    if (typeof value === 'boolean' && qItem.type === 'boolean') {
      return { valueBoolean: value };
    }

    if (typeof value === 'number') {
      if (qItem.type === 'decimal') {
        return { valueDecimal: value };
      }
      if (qItem.type === 'integer') {
        return { valueInteger: value };
      }
    }

    if (typeof value === 'object') {
      return { valueCoding: value };
    }

    // Value is string at this point
    if (qItem.type === 'date' && checkIsDate(value)) {
      return { valueDate: value };
    }

    if (qItem.type === 'dateTime' && checkIsDateTime(value)) {
      return { valueDateTime: value };
    }

    if (qItem.type === 'time' && checkIsTime(value)) {
      return { valueTime: value };
    }

    // Process answerValueSets only if value is a string - so we don't make unnecessary $expand requests
    if (qItem.answerValueSet && !qItem.answerValueSet.startsWith('#')) {
      expandRequired = true;
    }

    return { valueString: value };
  });
  return { newValues, expandRequired };
}

/**
 * Check if an answer is a date in the formats YYYY, YYYY-MM, YYYY-MM-DD
 *
 * @author Sean Fong
 */
export function checkIsDate(value: string): boolean {
  const acceptedFormats = ['YYYY-MM', 'YYYY-MM-DD'];
  return dayjs(value, acceptedFormats, true).isValid();
}

/**
 * Check if an answer is a datetime in the format YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss+zz:zz
 *
 * @author Sean Fong
 */
export function checkIsDateTime(value: string): boolean {
  const acceptedFormats = ['YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'];
  return moment(value, acceptedFormats, true).isValid();
}

/**
 * Check if an answer is in a  time format - Regex: ([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?
 *
 * @author Sean Fong
 */
export function checkIsTime(value: string): boolean {
  const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?$/;
  return timeRegex.test(value);
}

/**
 * Constructed populated repeat group instances based on its child items' answers from initialExpressions
 * Used with an itemPopulationContext extension at the parent-level and initialExpressions at the child-level
 * i.e. If there are four child items with five arrays of respective answers obtained from initialExpressions,
 *      five instances of repeat groups will be created.
 *
 * @author Sean Fong
 */
function constructRepeatGroupInstances(
  qRepeatGroupParent: QuestionnaireItem,
  initialExpressions: Record<string, InitialExpression>,
  valueSetPromises: Record<string, ValueSetPromise>
): QuestionnaireResponseItem[] {
  if (!qRepeatGroupParent.item) return [];

  const childItemAnswers: QuestionnaireResponseItemAnswer[][] = [];
  for (const [i, childItem] of qRepeatGroupParent.item.entries()) {
    const initialExpression = initialExpressions[childItem.linkId];
    if (!initialExpression) {
      childItemAnswers[i] = [];
      continue;
    }

    const initialValues = initialExpression.value;
    if (initialValues && initialValues.length > 0 && initialValues[0] !== '') {
      const { newValues, expandRequired } = getAnswerValues(initialValues, childItem);

      if (expandRequired && childItem.answerValueSet) {
        const valueSetUrl = childItem.answerValueSet;
        getValueSetPromise(childItem, valueSetUrl, valueSetPromises);
      }

      childItemAnswers[i] = newValues;
    } else {
      childItemAnswers[i] = [];
    }
  }

  // calculate number of instances to be created by getting the length of the longest answer array
  let numOfInstancesToBeCreated = 0;
  for (const answers of childItemAnswers) {
    if (answers.length > numOfInstancesToBeCreated) {
      numOfInstancesToBeCreated = answers.length;
    }
  }

  // return empty array early if no repeat group instances to be created
  if (numOfInstancesToBeCreated === 0) return [];

  const qrRepeatGroupInstances: QuestionnaireResponseItem[] = [];
  for (let i = 0; i < numOfInstancesToBeCreated; i++) {
    const childItemsWithAnswers: QuestionnaireResponseItem[] = [];

    for (let j = 0; j < childItemAnswers.length; j++) {
      const answerArray = childItemAnswers[j];
      if (answerArray) {
        const answerOfSpecificParent = answerArray[i];
        const qItemChild = qRepeatGroupParent.item[j];
        if (answerOfSpecificParent && qItemChild) {
          const qrItemChild: QuestionnaireResponseItem = {
            linkId: qItemChild.linkId,
            text: qItemChild.text,
            answer: [answerOfSpecificParent]
          };
          childItemsWithAnswers.push(qrItemChild);
        }
      }
    }

    const qItemParent = {
      linkId: qRepeatGroupParent.linkId,
      text: qRepeatGroupParent.text,
      item: childItemsWithAnswers
    };

    qrRepeatGroupInstances.push(qItemParent);
  }

  return qrRepeatGroupInstances;
}
