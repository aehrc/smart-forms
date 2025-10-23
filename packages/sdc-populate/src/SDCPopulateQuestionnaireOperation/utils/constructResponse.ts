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
  Encounter,
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
import type {
  ItemPopulationContext,
  PopulationExpressions,
  ValueSetPromise
} from '../interfaces/expressions.interface';
import { filterValueSetAnswersRecursive, resolveValueSetPromises } from './processValueSets';
import moment from 'moment';
import dayjs from 'dayjs';
import fhirpath from 'fhirpath';
// Need to specifically import from 'index.js' to get it working with ts
import fhirpath_r4_model from 'fhirpath/fhir-context/r4/index.js';
import { getItemPopulationContextName } from './readPopulationExpressions';
import { createQuestionnaireReference } from './createQuestionnaireReference';
import { parseItemInitialToAnswer, parseValueToAnswer } from './parse';
import { getValueSetPromise } from '../api/expandValueSet';
import type { FetchTerminologyCallback, FetchTerminologyRequestConfig } from '../interfaces';
import { handleFhirPathResult } from './createFhirPathContext';
import { TERMINOLOGY_SERVER_URL } from '../../globals';
import { getDisplayName } from './humanName';

/**
 * Constructs a questionnaireResponse recursively from a specified questionnaire, its subject and its initialExpressions.
 * Handles population, context, and author/encounter metadata for the response.
 *
 * @param questionnaire - The questionnaire resource to construct a response from
 * @param subject - A subject reference to form the subject within the response
 * @param populationExpressions - expressions used for pre-population i.e. initialExpressions, itemPopulationContexts
 * @param fhirPathContext - A FHIRContext object to be used for FHIRPath evaluation
 * @param user - An optional FHIR resource representing the user to form the questionnaireResponse.author property
 * @param encounter - An optional encounter resource to form the questionnaireResponse.encounter property
 * @param fetchTerminologyCallback - An optional callback function to fetch terminology resources
 * @param fetchTerminologyRequestConfig - An optional configuration object to pass to the fetchTerminologyCallback
 * @returns A populated questionnaire response wrapped within a Promise
 *
 * @author Sean Fong
 */
export async function constructResponse(
  questionnaire: Questionnaire,
  subject: Reference,
  populationExpressions: PopulationExpressions,
  fhirPathContext: Record<string, any>,
  user?: FhirResource,
  encounter?: Encounter,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
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
    const newTopLevelQRItem = await constructResponseItemRecursive({
      qItem,
      qrItem: {
        linkId: qItem.linkId,
        text: qItem.text
      },
      qContainedResources: containedResources,
      populationExpressions,
      fhirPathContext,
      valueSetPromises,
      answerOptions,
      containedValueSets,
      fetchTerminologyCallback,
      fetchTerminologyRequestConfig
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
  valueSetPromises = await resolveValueSetPromises(valueSetPromises);
  const updatedTopLevelQRItems: QuestionnaireResponseItem[] = topLevelQRItems
    .map((qrItem) =>
      filterValueSetAnswersRecursive(qrItem, valueSetPromises, answerOptions, containedValueSets)
    )
    .filter((item): item is QuestionnaireResponseItem => item !== null);

  questionnaireResponse.questionnaire = createQuestionnaireReference(questionnaire);
  questionnaireResponse.item = updatedTopLevelQRItems;
  questionnaireResponse.subject = subject;

  // Add user reference to "author" and current dateTime to "authored" if user context present
  if (user && user.id && user.resourceType) {
    const displayName =
      user.resourceType === 'Practitioner' ||
      user.resourceType === 'RelatedPerson' ||
      user.resourceType === 'Patient'
        ? getDisplayName(user.name)
        : undefined;
    questionnaireResponse.author = {
      type: user.resourceType,
      reference: `${user.resourceType}/${user.id}`,
      ...(displayName && { display: displayName })
    };
    questionnaireResponse.authored = new Date().toISOString();
  }

  // Add encounter reference if present
  if (encounter && encounter.id) {
    questionnaireResponse.encounter = {
      type: 'Encounter',
      reference: `Encounter/${encounter.id}`
    };
  }

  // Add "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaireresponse" profile
  // const profiles: string[] = [
  //   'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaireresponse'
  // ];
  questionnaireResponse.meta = questionnaireResponse.meta || {};
  questionnaireResponse.meta.source = 'https://smartforms.csiro.au';

  return questionnaireResponse;
}

interface ConstructResponseItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  qContainedResources: FhirResource[];
  populationExpressions: PopulationExpressions;
  fhirPathContext: Record<string, any>;
  valueSetPromises: Record<string, ValueSetPromise>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  containedValueSets: Record<string, ValueSet>;
  fetchTerminologyCallback?: FetchTerminologyCallback;
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig;
}

/**
 * Read a single questionnaire item/group recursively and generating questionnaire response items from initialExpressions if present
 *
 * @author Sean Fong
 */
async function constructResponseItemRecursive(
  params: ConstructResponseItemRecursiveParams
): Promise<QuestionnaireResponseItem | QuestionnaireResponseItem[] | null> {
  const {
    qItem,
    qrItem,
    qContainedResources,
    populationExpressions,
    fhirPathContext,
    valueSetPromises,
    answerOptions,
    containedValueSets,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  } = params;

  const items = qItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

    // If qItem is a repeat group, populate instances of repeat groups containing child items
    if (qItem.type === 'group' && qItem.repeats) {
      // Create number of repeat group instances based on the number of answers that the first child item has
      return await constructRepeatGroupInstances(
        qItem,
        qContainedResources,
        populationExpressions,
        fhirPathContext,
        valueSetPromises,
        answerOptions,
        containedValueSets,
        fetchTerminologyCallback,
        fetchTerminologyRequestConfig
      );
    }

    // Otherwise loop through qItem as usual
    for (const item of items) {
      const newQrItem = await constructResponseItemRecursive({
        qItem: item,
        qrItem,
        qContainedResources,
        populationExpressions,
        fhirPathContext,
        valueSetPromises,
        answerOptions,
        containedValueSets,
        fetchTerminologyCallback: fetchTerminologyCallback,
        fetchTerminologyRequestConfig: fetchTerminologyRequestConfig
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
      containedValueSets,
      fetchTerminologyCallback: fetchTerminologyCallback,
      fetchTerminologyRequestConfig: fetchTerminologyRequestConfig
    });
  }

  return constructSingleItem({
    qItem,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets,
    fetchTerminologyCallback: fetchTerminologyCallback,
    fetchTerminologyRequestConfig: fetchTerminologyRequestConfig
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
  fetchTerminologyCallback?: FetchTerminologyCallback | undefined;
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig;
}

function constructGroupItem(params: ConstructGroupItemParams): QuestionnaireResponseItem | null {
  const {
    qItem,
    qrItems,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  } = params;

  const { initialExpressions } = populationExpressions;

  let populatedAnswers: QuestionnaireResponseItemAnswer[] | undefined;

  // This only applies to question (non-group) items! 'group' items should not have item.answer
  if (qItem.type !== 'group') {
    // Populate answers from item.initial if present
    // Process item.initial first, then can potentially overwrite with initialExpressions
    if (qItem.initial) {
      populatedAnswers = qItem.initial
        .map((initial) => parseItemInitialToAnswer(initial))
        .filter((answer): answer is QuestionnaireResponseItemAnswer => answer !== null);
    }

    // Populate answers from initialExpressions if present
    const initialExpression = initialExpressions[qItem.linkId];
    if (initialExpression) {
      const initialValues = initialExpression.value;

      if (initialValues && initialValues.length) {
        const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);
        populatedAnswers = newValues;

        if (expandRequired) {
          recordAnswerValueSet(
            qItem,
            valueSetPromises,
            fetchTerminologyCallback,
            fetchTerminologyRequestConfig
          );
        }

        recordAnswerOption(qItem, answerOptions);
        recordContainedValueSet(qItem, qContainedResources, containedValueSets);
      }
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
  fetchTerminologyCallback?: FetchTerminologyCallback | undefined;
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig;
}

function constructSingleItem(params: ConstructSingleItemParams): QuestionnaireResponseItem | null {
  const {
    qItem,
    qContainedResources,
    populationExpressions,
    valueSetPromises,
    answerOptions,
    containedValueSets,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  } = params;

  const { initialExpressions } = populationExpressions;

  // Populate answers from initialExpressions if present
  const initialExpression = initialExpressions[qItem.linkId];
  if (initialExpression) {
    const initialValues = initialExpression.value;

    if (initialValues && initialValues.length) {
      const { newValues, expandRequired } = getAnswerValues(initialValues, qItem);

      if (expandRequired) {
        recordAnswerValueSet(
          qItem,
          valueSetPromises,
          fetchTerminologyCallback,
          fetchTerminologyRequestConfig
        );
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

  // Populate answers from item.initial if present
  if (qItem.initial) {
    return {
      linkId: qItem.linkId,
      answer: qItem.initial
        .map((initial) => parseItemInitialToAnswer(initial))
        .filter((answer): answer is QuestionnaireResponseItemAnswer => answer !== null),
      ...(qItem.text ? { text: qItem.text } : {})
    };
  }

  return null;
}

function recordAnswerValueSet(
  qItem: QuestionnaireItem,
  valueSetPromises: Record<string, ValueSetPromise>,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
) {
  if (qItem.answerValueSet) {
    getValueSetPromise(
      qItem,
      qItem.answerValueSet,
      valueSetPromises,
      fetchTerminologyCallback,
      fetchTerminologyRequestConfig
    );
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

  let newValues = initialValues.map((value: any) => {
    const parsedAnswer = parseValueToAnswer(qItem, value);
    if (parsedAnswer.valueString && qItem.answerValueSet && !qItem.answerValueSet.startsWith('#')) {
      expandRequired = true;
    }

    return parsedAnswer;
  });

  // If qItem.repeats=false, it cannot have multiple answers
  if (!qItem.repeats && newValues[0]) {
    newValues = [newValues[0]];
  }

  return { newValues, expandRequired };
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
async function constructRepeatGroupInstances(
  qRepeatGroupParent: QuestionnaireItem,
  qContainedResources: FhirResource[],
  populationExpressions: PopulationExpressions,
  fhirPathContext: Record<string, any>,
  valueSetPromises: Record<string, ValueSetPromise>,
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>,
  containedValueSets: Record<string, ValueSet>,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<QuestionnaireResponseItem[]> {
  if (!qRepeatGroupParent.item || !qRepeatGroupParent.item[0]) {
    return [];
  }

  const { initialExpressions, itemPopulationContexts } = populationExpressions;

  const terminologyServerUrl = fetchTerminologyRequestConfig?.terminologyServerUrl ?? null;

  // Look in initialExpressions of each of the child items to relate back to the itemPopulationContext its using
  let itemPopulationContextExpression: string | undefined;
  let itemPopulationContext: ItemPopulationContext | undefined;
  for (const childItem of qRepeatGroupParent.item) {
    const expression = initialExpressions[childItem.linkId]?.expression;
    if (!expression) continue;

    const contextName = getItemPopulationContextName(expression);
    const context = contextName ? itemPopulationContexts[contextName] : undefined;

    if (context && context.value) {
      itemPopulationContextExpression = expression;
      itemPopulationContext = context;
      break; // Stop at the first valid match
    }
  }

  // No itemPopulationContext is found, return an empty array
  if (!itemPopulationContextExpression || !itemPopulationContext || !itemPopulationContext.value) {
    return [];
  }

  // Look for itemPopulationContexts which uses the parent itemPopulationContext
  const associatedItemPopulationContexts: Record<string, ItemPopulationContext> = {};
  for (const name in itemPopulationContexts) {
    const lookupItemPopulationContext = itemPopulationContexts[name];
    if (lookupItemPopulationContext) {
      const itemPopulationContextName = getItemPopulationContextName(
        lookupItemPopulationContext.expression
      );

      if (
        itemPopulationContextName ===
        getItemPopulationContextName(lookupItemPopulationContext.expression)
      ) {
        associatedItemPopulationContexts[lookupItemPopulationContext.linkId] =
          lookupItemPopulationContext;
      }
    }
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
      // Populate answers from initialExpressions
      const initialExpression = initialExpressions[childItem.linkId];
      if (initialExpression) {
        // Allow child items consuming itemPopulationContext to access renderer-wide variables via fhirPathContext
        const fhirPathContextWithItemPopulationContext = {
          ...fhirPathContext,
          [itemPopulationContext.name]: [itemPopulationContextValue]
        };

        try {
          const fhirPathResult = fhirpath.evaluate(
            {},
            initialExpression.expression,
            fhirPathContextWithItemPopulationContext,
            fhirpath_r4_model,
            {
              async: true,
              terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL
            }
          );
          const initialValues = await handleFhirPathResult(fhirPathResult);

          if (initialValues && initialValues.length > 0 && initialValues[0] !== '') {
            const { newValues, expandRequired } = getAnswerValues(initialValues, childItem);

            if (expandRequired) {
              recordAnswerValueSet(
                childItem,
                valueSetPromises,
                fetchTerminologyCallback,
                fetchTerminologyRequestConfig
              );
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
          // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
          console.warn(
            `SDC-Populate Error: fhirpath evaluation for ItemPopulationContext child for expression ${initialExpression.expression} failed. Details below:` +
              e
          );
        }
      }

      // Populate answers from associated itemPopulationContexts
      const associatedItemPopulationContext = associatedItemPopulationContexts[childItem.linkId];
      if (associatedItemPopulationContext) {
        const newQrItem = await constructResponseItemRecursive({
          qItem: childItem,
          qrItem: {
            linkId: childItem.linkId,
            text: childItem.text
          },
          qContainedResources,
          populationExpressions: {
            initialExpressions,
            itemPopulationContexts: {
              [associatedItemPopulationContext.name]: associatedItemPopulationContext
            }
          },
          fhirPathContext,
          valueSetPromises,
          answerOptions,
          containedValueSets
        });

        if (Array.isArray(newQrItem)) {
          if (newQrItem.length > 0) {
            qrRepeatGroupInstance.item?.push(...newQrItem);
          }
        } else if (newQrItem) {
          qrRepeatGroupInstance.item?.push(newQrItem);
        }
      }
    }

    qrRepeatGroupInstances.push(qrRepeatGroupInstance);
  }

  return qrRepeatGroupInstances;
}
