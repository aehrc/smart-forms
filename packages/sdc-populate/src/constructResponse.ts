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
import dayjs from 'dayjs';
import moment from 'moment';

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

  const topLevelQItems = questionnaire.item;

  if (!topLevelQItems) {
    return questionnaireResponse;
  }

  // Populate questionnaire response as a two-step process
  // In first step, populate answers from initialExpressions and get answerValueSet promises wherever population of valueSet answers are required
  // In second step, resolves all promises in parallel and populate valueSet answers by comparing their codes
  const topLevelQRItems: QuestionnaireResponseItem[] = [];
  for (const qItem of topLevelQItems) {
    const topLevelQRItem: QuestionnaireResponseItem = {
      linkId: qItem.linkId,
      text: qItem.text,
      item: []
    };
    const newTopLevelQRItem = constructResponseItem(
      qItem,
      topLevelQRItem,
      initialExpressions,
      valueSetPromises
    );

    if (Array.isArray(newTopLevelQRItem)) {
      topLevelQRItems.push(...newTopLevelQRItem);
    } else if (newTopLevelQRItem) {
      topLevelQRItems.push(newTopLevelQRItem);
    }
  }

  valueSetPromises = await resolvePromises(valueSetPromises);
  const updatedTopLevelQRItems = topLevelQRItems.map((qrItem) => {
    return addValueSetAnswers(qrItem, valueSetPromises);
  });

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
function constructResponseItem(
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
      return constructRepeatGroupInstances(qItem, initialExpressions);
    } else {
      // Otherwise loop through qItem as usual
      items.forEach((item) => {
        const newQrItem = constructResponseItem(item, qrItem, initialExpressions, valueSetPromises);

        if (Array.isArray(newQrItem)) {
          qrItems.push(...newQrItem);
        } else if (newQrItem) {
          qrItems.push(newQrItem);
        }
      });
    }

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

    if (typeof value === 'boolean') {
      return { valueBoolean: value };
    } else if (typeof value === 'object') {
      return { valueCoding: value };
    } else if (typeof value === 'number') {
      return Number.isInteger(value) ? { valueInteger: value } : { valueDecimal: value };
    } else if (checkIsDate(value)) {
      return { valueDate: value };
    } else if (checkIsDateTime(value)) {
      return { valueDateTime: value };
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
 * Check if an answer is a date in the formats YYYY, YYYY-MM, YYYY-MM-DD
 *
 * @author Sean Fong
 */
export function checkIsDate(value: string): boolean {
  const acceptedFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'];
  return dayjs(value, acceptedFormats, true).isValid();
}

/**
 * Check if an answer is a datetime in the format YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss+zz:zz
 *
 * @author Sean Fong
 */
export function checkIsDateTime(value: string): boolean {
  const acceptedFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'];
  return moment(value, acceptedFormats, true).isValid();
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
  initialExpressions: Record<string, InitialExpression>
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
    if (initialValues && initialValues.length > 0) {
      const { newValues } = getAnswerValues(initialValues, childItem);
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
