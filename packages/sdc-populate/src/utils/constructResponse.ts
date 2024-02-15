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
  FhirResource,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Reference,
  ValueSet
} from 'fhir/r4';
import type { PopulationExpressions, ValueSetPromise } from '../interfaces/expressions.interface';
import {
  filterValueSetAnswersRecursive,
  getValueSetPromise,
  resolvePromises
} from './processValueSets';
import moment from 'moment';
import dayjs from 'dayjs';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { findInAnswerOptions } from './answerOption';

/**
 * Constructs a questionnaireResponse recursively from a specified questionnaire, its subject and its initialExpressions
 *
 * @param questionnaire - The questionnaire resource to construct a response from
 * @param subject - A subject reference to form the subject within the response
 * @param populationExpressions - expressions used for pre-population i.e. initialExpressions, itemPopulationContexts
 * @returns A populated questionnaire response wrapped within a Promise
 *
 * @author Sean Fong
 */
export async function constructResponse(
  questionnaire: Questionnaire,
  subject: Reference,
  populationExpressions: PopulationExpressions
): Promise<QuestionnaireResponse> {
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  };

  let valueSetPromises: Record<string, ValueSetPromise> = {};
  const answerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {};
  const containedValueSets: Record<string, ValueSet> = {};

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return questionnaireResponse;
  }

  const containedResources = questionnaire.contained ?? [];

  // Populate questionnaire response as a two-step process
  // In first step, populate answers from initialExpressions and get answerValueSet promises wherever population of valueSet answers are required
  // In second step, resolves all promises in parallel and populate valueSet answers by comparing their codes
  const topLevelQRItems: QuestionnaireResponseItem[] = [];
  for (const qItem of questionnaire.item) {
    const newTopLevelQRItem = constructResponseItemRecursive({
      qItem,
      qrItem: {
        linkId: qItem.linkId,
        text: qItem.text
      },
      qContainedResources: containedResources,
      populationExpressions,
      valueSetPromises,
      answerOptions,
      containedValueSets
    });

    if (Array.isArray(newTopLevelQRItem)) {
      if (newTopLevelQRItem.length > 0) {
        topLevelQRItems.push(...newTopLevelQRItem);
      }
      continue;
    }

    if (newTopLevelQRItem) {
      topLevelQRItems.push(newTopLevelQRItem);
      continue;
    }

    topLevelQRItems.push({
      linkId: qItem.linkId,
      text: qItem.text
    });
  }

  // Step 2: populate valueSet answers
  valueSetPromises = await resolvePromises(valueSetPromises);
  const updatedTopLevelQRItems: QuestionnaireResponseItem[] = topLevelQRItems
    .map((qrItem) =>
      filterValueSetAnswersRecursive(qrItem, valueSetPromises, answerOptions, containedValueSets)
    )
    .filter((item): item is QuestionnaireResponseItem => item !== null);

  questionnaireResponse.questionnaire = questionnaire.url;
  questionnaireResponse.item = updatedTopLevelQRItems;
  questionnaireResponse.subject = subject;

  return questionnaireResponse;
}

interface ConstructResponseItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  qContainedResources: FhirResource[];
  populationExpressions: PopulationExpressions;
  valueSetPromises: Record<string, ValueSetPromise>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  containedValueSets: Record<string, ValueSet>;
}

/**
 * Read a single questionnaire item/group recursively and generating questionnaire response items from initialExpressions if present
 *
 * @author Sean Fong
 */
function constructResponseItemRecursive(
  params: ConstructResponseItemRecursiveParams
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  const {
    qItem,
    qrItem,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets
  } = params;

  const items = qItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

    // If qItem is a repeat group, populate instances of repeat groups containing child items
    if (qItem.type === 'group' && qItem.repeats) {
      // Create number of repeat group instances based on the number of answers that the first child item has
      return constructRepeatGroupInstances(
        qItem,
        qContainedResources,
        populationExpressions,
        valueSetPromises,
        answerOptions,
        containedValueSets
      );
    }

    // Otherwise loop through qItem as usual
    for (const item of items) {
      const newQrItem = constructResponseItemRecursive({
        qItem: item,
        qrItem,
        qContainedResources,
        populationExpressions,
        valueSetPromises,
        answerOptions,
        containedValueSets
      });

      if (Array.isArray(newQrItem)) {
        if (newQrItem.length > 0) {
          qrItems.push(...newQrItem);
        }
      } else if (newQrItem) {
        qrItems.push(newQrItem);
      }
    }

    return constructGroupItem({
      qItem,
      qrItems,
      qContainedResources,
      populationExpressions,
      valueSetPromises,
      answerOptions,
      containedValueSets
    });
  }

  return constructSingleItem({
    qItem,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets
  });
}

interface ConstructGroupItemParams {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  qContainedResources: FhirResource[];
  populationExpressions: PopulationExpressions;
  valueSetPromises: Record<string, ValueSetPromise>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  containedValueSets: Record<string, ValueSet>;
}

function constructGroupItem(params: ConstructGroupItemParams): QuestionnaireResponseItem | null {
  const {
    qItem,
    qrItems,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets
  } = params;

  const { initialExpressions } = populationExpressions;

  // Populate answers from initialExpressions if present
  const initialExpression = initialExpressions[qItem.linkId];
  let populatedAnswers: QuestionnaireResponseItemAnswer[] | undefined;
  if (initialExpression) {
    const initialValues = initialExpression.value;

    if (initialValues && initialValues.length) {
      const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);
      populatedAnswers = newValues;

      if (expandRequired) {
        recordAnswerValueSet(qItem, valueSetPromises);
      }

      recordAnswerOption(qItem, answerOptions);
      recordContainedValueSet(qItem, qContainedResources, containedValueSets);
    }
  }

  if (qrItems.length > 0) {
    return {
      linkId: qItem.linkId,
      text: qItem.text,
      item: qrItems,
      ...(populatedAnswers ? { answer: populatedAnswers } : {})
    };
  }

  if (populatedAnswers) {
    return {
      linkId: qItem.linkId,
      text: qItem.text,
      answer: populatedAnswers
    };
  }

  return null;
}

interface ConstructSingleItemParams {
  qItem: QuestionnaireItem;
  qContainedResources: FhirResource[];
  populationExpressions: PopulationExpressions;
  valueSetPromises: Record<string, ValueSetPromise>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  containedValueSets: Record<string, ValueSet>;
}

function constructSingleItem(params: ConstructSingleItemParams): QuestionnaireResponseItem | null {
  const {
    qItem,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets
  } = params;

  const { initialExpressions } = populationExpressions;

  if (itemIsHidden(qItem)) {
    return null;
  }

  // Populate answers from initialExpressions if present
  const initialExpression = initialExpressions[qItem.linkId];
  if (initialExpression) {
    const initialValues = initialExpression.value;

    if (initialValues && initialValues.length) {
      const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);

      if (expandRequired) {
        recordAnswerValueSet(qItem, valueSetPromises);
      }

      recordAnswerOption(qItem, answerOptions);
      recordContainedValueSet(qItem, qContainedResources, containedValueSets);

      return {
        linkId: qItem.linkId,
        answer: newValues,
        ...(qItem.text ? { text: qItem.text } : {})
      };
    }
  }
  return null;
}

function recordAnswerValueSet(
  qItem: QuestionnaireItem,
  valueSetPromises: Record<string, ValueSetPromise>
) {
  if (qItem.answerValueSet) {
    getValueSetPromise(qItem, qItem.answerValueSet, valueSetPromises);
  }
}

function recordAnswerOption(
  qItem: QuestionnaireItem,
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>
) {
  if (qItem.answerOption) {
    answerOptions[qItem.linkId] = qItem.answerOption;
  }
}

function recordContainedValueSet(
  qItem: QuestionnaireItem,
  qContainedResources: FhirResource[],
  containedValueSets: Record<string, ValueSet>
) {
  if (qItem.answerValueSet && qItem.answerValueSet.startsWith('#')) {
    const containedReference = qItem.answerValueSet.slice(1);
    const containedValueSet = qContainedResources.find(
      (resource) => resource.id === containedReference
    );

    if (containedValueSet) {
      containedValueSets[qItem.linkId] = containedValueSet as ValueSet;
    }
  }
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

  const newValues = initialValues.map((value: any) => {
    const parsedAnswer = parseValueToAnswer(qItem, value);
    if (parsedAnswer.valueString && qItem.answerValueSet && !qItem.answerValueSet.startsWith('#')) {
      expandRequired = true;
    }

    return parsedAnswer;
  });

  return { newValues, expandRequired };
}

function itemIsHidden(item: QuestionnaireItem): boolean {
  return !!item.extension?.find(
    (extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden' &&
      extension.valueBoolean === true
  );
}

function parseValueToAnswer(qItem: QuestionnaireItem, value: any): QuestionnaireResponseItemAnswer {
  if (qItem.answerOption) {
    const answerOption = findInAnswerOptions(qItem.answerOption, value);

    if (answerOption) {
      return answerOption;
    }
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
  if (qItem.type === 'date' && checkIsDateTime(value)) {
    return { valueDate: convertDateTimeToDate(value) };
  }

  if (qItem.type === 'dateTime' && checkIsDateTime(value)) {
    return { valueDateTime: value };
  }

  if (qItem.type === 'time' && checkIsTime(value)) {
    return { valueTime: value };
  }

  return { valueString: value };
}

/**
 * Check if an answer is a datetime in the format YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss+zz:zz
 *
 * @author Sean Fong
 */
export function checkIsDateTime(value: string): boolean {
  const acceptedFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ'];
  const formattedDate = dayjs(value).format();
  return moment(formattedDate, acceptedFormats, true).isValid();
}

export function convertDateTimeToDate(value: string): string {
  const acceptedFormats = ['YYYY-MM-DDTHH:mm:ssZ'];
  const formattedDate = dayjs(value).format();
  const isDateTime = moment(formattedDate, acceptedFormats, true).isValid();

  if (isDateTime) {
    return moment(formattedDate).format('YYYY-MM-DD');
  }

  return value;
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
  qContainedResources: FhirResource[],
  populationExpressions: PopulationExpressions,
  valueSetPromises: Record<string, ValueSetPromise>,
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>,
  containedValueSets: Record<string, ValueSet>
): QuestionnaireResponseItem[] {
  if (!qRepeatGroupParent.item || !qRepeatGroupParent.item[0]) {
    return [];
  }

  const { initialExpressions, itemPopulationContexts } = populationExpressions;

  // Look in initialExpressions of each of the child items to relate back to the itemPopulationContext its using
  const itemPopulationContextExpression =
    initialExpressions[qRepeatGroupParent.item[0].linkId]?.expression;

  if (!itemPopulationContextExpression) {
    return [];
  }

  const itemPopulationContextName = itemPopulationContextExpression.substring(
    itemPopulationContextExpression.indexOf('%') + 1,
    itemPopulationContextExpression.indexOf('.')
  );

  const itemPopulationContext = itemPopulationContexts[itemPopulationContextName];
  if (!itemPopulationContext || !itemPopulationContext.value) {
    return [];
  }

  const itemPopulationContextValues = itemPopulationContext.value;

  const qrRepeatGroupInstances: QuestionnaireResponseItem[] = [];
  for (const itemPopulationContextValue of itemPopulationContextValues) {
    const qrRepeatGroupInstance: QuestionnaireResponseItem = {
      linkId: qRepeatGroupParent.linkId,
      ...(qRepeatGroupParent.text ? { text: qRepeatGroupParent.text } : {}),
      item: []
    };

    for (const childItem of qRepeatGroupParent.item) {
      const initialExpression = initialExpressions[childItem.linkId];
      if (!initialExpression || itemIsHidden(childItem)) {
        continue;
      }

      try {
        const initialValues = fhirpath.evaluate(
          {},
          initialExpression.expression,
          { [itemPopulationContext.name]: [itemPopulationContextValue] },
          fhirpath_r4_model
        );

        if (initialValues && initialValues.length > 0 && initialValues[0] !== '') {
          const { newValues, expandRequired } = getAnswerValues(initialValues, childItem);

          if (expandRequired) {
            recordAnswerValueSet(childItem, valueSetPromises);
          }

          recordAnswerOption(childItem, answerOptions);
          recordContainedValueSet(childItem, qContainedResources, containedValueSets);

          qrRepeatGroupInstance.item?.push({
            linkId: childItem.linkId,
            answer: newValues,
            ...(childItem.text ? { text: childItem.text } : {})
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          console.warn(
            'Error: fhirpath evaluation for ItemPopulationContext child failed. Details below:' + e
          );
        }
      }
    }

    qrRepeatGroupInstances.push(qrRepeatGroupInstance);
  }

  return qrRepeatGroupInstances;
}
