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
  Quantity,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import cloneDeep from 'lodash.clonedeep';
import type {
  EnableWhenItems,
  EnableWhenRepeatItemProperties,
  EnableWhenSingleItemProperties
} from '../interfaces';

/**
 * Create a linkedQuestionsMap that contains linked items of enableWhen items
 * mapped to an array containing all its respective enableWhen items' linkIds
 * returns a key-value pair of <linkedItemId, [enableWhenItem1LinkId, enableWhenItem2LinkId, enableWhenItem3LinkId]>
 *
 * @author Sean Fong
 */
export function createEnableWhenLinkedQuestions(enableWhenItems: EnableWhenItems) {
  const linkedQuestionsMap: Record<string, string[]> = {};

  const { singleItems, repeatItems } = enableWhenItems;

  for (const items of [singleItems, repeatItems]) {
    for (const linkId in items) {
      items[linkId].linked.forEach((linkedItem) => {
        const linkQId = linkedItem.enableWhen.question;
        if (!linkedQuestionsMap[linkQId]) {
          linkedQuestionsMap[linkQId] = [];
        }

        if (!linkedQuestionsMap[linkQId].includes(linkId)) {
          linkedQuestionsMap[linkQId].push(linkId);
        }
      });
    }
  }

  return linkedQuestionsMap;
}

/**
 * Performs switching for non-group enableWhenItems based on their item types.
 *
 * @author Sean Fong
 */
export function isEnabledAnswerTypeSwitcher(
  enableWhen: QuestionnaireItemEnableWhen,
  answer: QuestionnaireResponseItemAnswer
): boolean {
  if (enableWhen['answerBoolean'] !== undefined && enableWhen.operator === 'exists') {
    return answerOperatorSwitcher(enableWhen.answerBoolean, answer, enableWhen.operator);
  } else if (enableWhen['answerBoolean'] !== undefined && answer.valueBoolean !== undefined) {
    return answerOperatorSwitcher(
      enableWhen.answerBoolean,
      answer.valueBoolean,
      enableWhen.operator
    );
  } else if (enableWhen['answerDecimal'] && answer.valueDecimal) {
    return answerOperatorSwitcher(
      enableWhen.answerDecimal,
      answer.valueDecimal,
      enableWhen.operator
    );
  } else if (enableWhen['answerInteger'] !== undefined && answer.valueInteger !== undefined) {
    return answerOperatorSwitcher(
      enableWhen.answerInteger,
      answer.valueInteger,
      enableWhen.operator
    );
  } else if (enableWhen['answerDate'] && answer.valueDate) {
    return answerOperatorSwitcher(enableWhen.answerDate, answer.valueDate, enableWhen.operator);
  } else if (enableWhen['answerDateTime'] && answer.valueDateTime) {
    return answerOperatorSwitcher(
      enableWhen.answerDateTime,
      answer.valueDateTime,
      enableWhen.operator
    );
  } else if (enableWhen['answerTime'] && answer.valueTime) {
    return answerOperatorSwitcher(enableWhen.answerTime, answer.valueTime, enableWhen.operator);
  } else if (enableWhen['answerString'] && answer.valueString) {
    return answerOperatorSwitcher(enableWhen.answerString, answer.valueString, enableWhen.operator);
  } else if (enableWhen['answerCoding']?.code && answer.valueCoding?.code) {
    return answerOperatorSwitcher(
      enableWhen.answerCoding.code,
      answer.valueCoding.code,
      enableWhen.operator
    );
  } else if (enableWhen['answerQuantity'] && answer.valueQuantity) {
    return answerOperatorSwitcher(
      enableWhen.answerQuantity,
      answer.valueQuantity,
      enableWhen.operator
    );
  }
  return false;
}

/**
 * Performs switching for value and expected comparisons based on given operator
 *
 * @author Sean Fong
 */
function answerOperatorSwitcher(
  expected: boolean | string | number | Quantity,
  value: boolean | string | number | Quantity | QuestionnaireResponseItemAnswer,
  operator: QuestionnaireItemEnableWhen['operator']
): boolean {
  // FIXME runs even when the linked textbox is not changed
  switch (operator) {
    case 'exists':
      // check if value is an object and contains any answerValues
      return typeof value === 'object' && Object.keys(value).length !== 0;
    case '=':
      return value === expected;
    case '!=':
      return value !== expected;
    case '<':
      return value < expected;
    case '<=':
      return value <= expected;
    case '>':
      return value > expected;
    case '>=':
      return value >= expected;
    default:
      return false;
  }
}

/**
 * Read initial answer values in questionnaireResponse
 * return a map of initial values with key-value pair <linkedItemId, initial value>
 *
 * @author Sean Fong
 */
export function readInitialAnswers(
  questionnaireResponse: QuestionnaireResponse,
  linkedQuestionsMap: Record<string, string[]>
): Record<string, QuestionnaireResponseItemAnswer[]> {
  if (!questionnaireResponse.item) return {};

  const initialValuesMap: Record<string, QuestionnaireResponseItemAnswer[]> = {};
  questionnaireResponse.item.forEach((item) => {
    readQuestionnaireResponseItemRecursive(item, initialValuesMap, linkedQuestionsMap);
  });
  return initialValuesMap;
}

/**
 * Read initial answer values of each qrItem recursively
 *
 * @author Sean Fong
 */
function readQuestionnaireResponseItemRecursive(
  item: QuestionnaireResponseItem,
  initialValues: Record<string, QuestionnaireResponseItemAnswer[]>,
  linkedQuestionsMap: Record<string, string[]>
) {
  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    items.forEach((item) => {
      readQuestionnaireResponseItemRecursive(item, initialValues, linkedQuestionsMap);
    });
    return;
  }

  // Read initial answer value of single qrItem
  if (linkedQuestionsMap[item.linkId] && item.answer) {
    initialValues[item.linkId] = item.answer;
  }

  return;
}

/**
 * Set initial answer values into enableWhenItems' answer attributes
 * Update enabled status of each enableWhenItem simultaneously
 *
 * @author Sean Fong
 */
export function setInitialAnswers(
  initialAnswers: Record<string, QuestionnaireResponseItemAnswer[]>,
  items: EnableWhenItems,
  linkedQuestionsMap: Record<string, string[]>
): EnableWhenItems {
  let updatedItems = cloneDeep(items);

  if (initialAnswers) {
    for (const linkId in initialAnswers) {
      const linkedQuestions = linkedQuestionsMap[linkId];
      const newAnswer = initialAnswers[linkId];

      updatedItems = updateEnableWhenItemAnswer(
        updatedItems,
        linkedQuestions,
        linkId,
        newAnswer,
        null
      );
    }
  }
  return updatedItems;
}

/**
 * Update answer of the target linkId in every related enableWhenItem's linked items
 * Then update the enabled status of every related enableWhenItem
 *
 * @author Sean Fong
 */
export function updateEnableWhenItemAnswer(
  items: EnableWhenItems,
  linkedQuestions: string[],
  linkId: string,
  newAnswer: QuestionnaireResponseItemAnswer[] | undefined,
  parentRepeatGroupIndex: number | null
): EnableWhenItems {
  const { singleItems, repeatItems } = items;

  for (const linkedQuestion of linkedQuestions) {
    // Linked question is in single items
    if (singleItems[linkedQuestion]) {
      // Update modified linked answer
      singleItems[linkedQuestion].linked.forEach((linkedItem) => {
        if (linkedItem.enableWhen.question === linkId) {
          linkedItem.answer = newAnswer ?? undefined;
        }
      });

      // Update enabled status of modified enableWhenItem
      singleItems[linkedQuestion].isEnabled = checkItemIsEnabledSingle(singleItems[linkedQuestion]);
      continue;
    }

    // Linked question is in repeat items
    if (repeatItems[linkedQuestion] && parentRepeatGroupIndex !== null) {
      // Update modified linked answer
      repeatItems[linkedQuestion].linked.forEach((linkedItem) => {
        if (linkedItem.enableWhen.question === linkId) {
          if (newAnswer) {
            linkedItem.answers[parentRepeatGroupIndex] = newAnswer[0] ?? undefined;
          } else {
            delete linkedItem.answers[parentRepeatGroupIndex];
          }
        }
      });

      // Update enabled status of modified enableWhenItem
      repeatItems[linkedQuestion].enabledIndexes[parentRepeatGroupIndex] = checkItemIsEnabledRepeat(
        repeatItems[linkedQuestion],
        parentRepeatGroupIndex
      );
    }
  }

  return items;
}

/**
 * Check if a single enableWhenItem is enabled based on the answer of its linked items
 *
 * @author Sean Fong
 */
export function checkItemIsEnabledSingle(
  enableWhenItemProperties: EnableWhenSingleItemProperties
): boolean {
  const checkedIsEnabledItems: boolean[] = [];

  enableWhenItemProperties.linked.forEach((linkedItem) => {
    if (linkedItem.answer && linkedItem.answer.length > 0) {
      for (const answer of linkedItem.answer) {
        const isEnabledForThisLinkedItem = isEnabledAnswerTypeSwitcher(
          linkedItem.enableWhen,
          answer
        );

        // In a repeat item, if at least one answer satisfies the condition, the item is enabled
        if (isEnabledForThisLinkedItem) {
          checkedIsEnabledItems.push(isEnabledAnswerTypeSwitcher(linkedItem.enableWhen, answer));
          break;
        }
      }
    }
  });

  if (checkedIsEnabledItems.length === 0) {
    return false;
  }

  return enableWhenItemProperties.enableBehavior === 'any'
    ? checkedIsEnabledItems.some((isEnabled) => isEnabled)
    : checkedIsEnabledItems.every((isEnabled) => isEnabled);
}

/**
 * Check if a repeat enableWhenItem is enabled based on the answer of its linked items
 *
 * @author Sean Fong
 */
export function checkItemIsEnabledRepeat(
  enableWhenItemProperties: EnableWhenRepeatItemProperties,
  parentRepeatGroupIndex: number
): boolean {
  const checkedIsEnabledItems: boolean[] = [];

  enableWhenItemProperties.linked.forEach((linkedItem) => {
    const linkedAnswer = linkedItem.answers[parentRepeatGroupIndex];
    if (linkedAnswer) {
      const isEnabledForThisLinkedItem = isEnabledAnswerTypeSwitcher(
        linkedItem.enableWhen,
        linkedAnswer
      );

      if (isEnabledForThisLinkedItem) {
        checkedIsEnabledItems.push(
          isEnabledAnswerTypeSwitcher(linkedItem.enableWhen, linkedAnswer)
        );
      }
    }
  });

  if (checkedIsEnabledItems.length === 0) {
    return false;
  }

  return enableWhenItemProperties.enableBehavior === 'any'
    ? checkedIsEnabledItems.some((isEnabled) => isEnabled)
    : checkedIsEnabledItems.every((isEnabled) => isEnabled);
}

export function assignPopulatedAnswersToEnableWhen(
  items: EnableWhenItems,
  questionnaireResponse: QuestionnaireResponse
): { initialisedItems: EnableWhenItems; linkedQuestions: Record<string, string[]> } {
  const linkedQuestions = createEnableWhenLinkedQuestions(items);
  const initialAnswers = readInitialAnswers(questionnaireResponse, linkedQuestions);

  const initialisedItems =
    Object.keys(initialAnswers).length > 0
      ? setInitialAnswers(initialAnswers, items, linkedQuestions)
      : items;

  return { initialisedItems, linkedQuestions };
}
