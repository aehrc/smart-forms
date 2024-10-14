/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import type {
  EnableWhenItems,
  EnableWhenRepeatItemProperties,
  EnableWhenSingleItemProperties
} from '../interfaces/enableWhen.interface';

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
  if (typeof enableWhen.answerBoolean === 'boolean' && enableWhen.operator === 'exists') {
    return answerOperatorSwitcher(enableWhen.answerBoolean, answer, enableWhen.operator);
  }

  if (typeof enableWhen.answerBoolean === 'boolean' && typeof answer.valueBoolean === 'boolean') {
    return answerOperatorSwitcher(
      enableWhen.answerBoolean,
      answer.valueBoolean,
      enableWhen.operator
    );
  }

  if (typeof enableWhen.answerDecimal === 'number' && typeof answer.valueDecimal === 'number') {
    return answerOperatorSwitcher(
      enableWhen.answerDecimal,
      answer.valueDecimal,
      enableWhen.operator
    );
  }

  if (typeof enableWhen.answerInteger === 'number' && typeof answer.valueInteger === 'number') {
    return answerOperatorSwitcher(
      enableWhen.answerInteger,
      answer.valueInteger,
      enableWhen.operator
    );
  }

  if (typeof enableWhen.answerDate === 'string' && typeof answer.valueDate === 'string') {
    return answerOperatorSwitcher(enableWhen.answerDate, answer.valueDate, enableWhen.operator);
  }

  if (typeof enableWhen.answerDateTime === 'string' && typeof answer.valueDateTime === 'string') {
    return answerOperatorSwitcher(
      enableWhen.answerDateTime,
      answer.valueDateTime,
      enableWhen.operator
    );
  }

  if (typeof enableWhen.answerTime === 'string' && typeof answer.valueTime === 'string') {
    return answerOperatorSwitcher(enableWhen.answerTime, answer.valueTime, enableWhen.operator);
  }

  if (typeof enableWhen.answerString === 'string' && typeof answer.valueString === 'string') {
    return answerOperatorSwitcher(enableWhen.answerString, answer.valueString, enableWhen.operator);
  }

  if (
    typeof enableWhen.answerCoding?.code === 'string' &&
    typeof answer.valueCoding?.code === 'string'
  ) {
    return answerOperatorSwitcher(
      enableWhen.answerCoding.code,
      answer.valueCoding.code,
      enableWhen.operator
    );
  }

  if (enableWhen.answerQuantity && answer.valueQuantity) {
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
  switch (operator) {
    case 'exists': {
      const answerExists = typeof value === 'object' && Object.keys(value).length !== 0;
      return answerExists === expected;
    }
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

export function mutateRepeatEnableWhenItemInstances(
  items: EnableWhenItems,
  parentRepeatGroupLinkId: string,
  parentRepeatGroupIndex: number,
  actionType: 'add' | 'remove'
): EnableWhenItems {
  const { repeatItems } = items;

  for (const linkId in repeatItems) {
    for (const linkedItem of repeatItems[linkId].linked) {
      if (linkedItem.parentLinkId !== parentRepeatGroupLinkId) {
        continue;
      }

      if (actionType === 'add') {
        linkedItem.answers.splice(parentRepeatGroupIndex, 0);
        repeatItems[linkId].enabledIndexes[parentRepeatGroupIndex] = checkItemIsEnabledRepeat(
          repeatItems[linkId],
          parentRepeatGroupIndex
        );
      } else if (actionType === 'remove') {
        linkedItem.answers.splice(parentRepeatGroupIndex, 1);
        repeatItems[linkId].enabledIndexes.splice(parentRepeatGroupIndex, 1);
      }
    }
  }

  return items;
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
  let updatedItems = structuredClone(items);

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

  // Check if linked item satisfies enableWhen condition
  for (const linkedItem of enableWhenItemProperties.linked) {
    let isEnabledForThisLinkedItem = false;

    // Linked item has answers
    if (linkedItem.answer && linkedItem.answer.length > 0) {
      // Check if linked answer within item satisfies enableWhen condition
      // Exit early once a linked answer is found to satisfy the condition
      for (const answer of linkedItem.answer) {
        const isEnabledForThisLinkedAnswer = isEnabledAnswerTypeSwitcher(
          linkedItem.enableWhen,
          answer
        );

        if (isEnabledForThisLinkedAnswer) {
          isEnabledForThisLinkedItem = true;
          break;
        }
      }

      // Push result of the linked item to the checkedIsEnabledItems array
      checkedIsEnabledItems.push(isEnabledForThisLinkedItem);

      continue;
    }

    // Linked item doesn't have any answers, but we still have to check for unanswered booleans
    const checkedNonExistentAnswer = evaluateNonExistentAnswers(linkedItem.enableWhen);
    checkedIsEnabledItems.push(checkedNonExistentAnswer);
  }

  if (checkedIsEnabledItems.length === 0) {
    return false;
  }

  return evaluateEnableBehaviour(checkedIsEnabledItems, enableWhenItemProperties.enableBehavior);
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

  for (const linkedItem of enableWhenItemProperties.linked) {
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
      continue;
    }

    // Linked item doesn't have any answers, but we still have to check for unanswered booleans
    if (evaluateNonExistentAnswers(linkedItem.enableWhen)) {
      checkedIsEnabledItems.push(true);
    }
  }

  if (checkedIsEnabledItems.length === 0) {
    return false;
  }

  return evaluateEnableBehaviour(checkedIsEnabledItems, enableWhenItemProperties.enableBehavior);
}

export function assignPopulatedAnswersToEnableWhen(
  items: EnableWhenItems,
  questionnaireResponse: QuestionnaireResponse
): { initialisedItems: EnableWhenItems; linkedQuestions: Record<string, string[]> } {
  const linkedQuestions = createEnableWhenLinkedQuestions(items);
  const initialAnswers = readInitialAnswers(questionnaireResponse, linkedQuestions);
  items = initialiseUnansweredBooleans(items);

  const initialisedItems =
    Object.keys(initialAnswers).length > 0
      ? setInitialAnswers(initialAnswers, items, linkedQuestions)
      : items;

  return { initialisedItems, linkedQuestions };
}

function initialiseUnansweredBooleans(items: EnableWhenItems): EnableWhenItems {
  const { singleItems, repeatItems } = items;

  // Initialise unanswered booleans for enableWhen single items
  for (const linkId in singleItems) {
    const checkedIsEnabledItems = singleItems[linkId].linked.map((linkedItem) =>
      evaluateNonExistentAnswers(linkedItem.enableWhen)
    );

    singleItems[linkId].isEnabled = evaluateEnableBehaviour(
      checkedIsEnabledItems,
      singleItems[linkId].enableBehavior
    );
  }

  // Initialise unanswered booleans for enableWhen repeat items
  for (const linkId in repeatItems) {
    const checkedIsEnabledItems = repeatItems[linkId].linked.map((linkedItem) =>
      evaluateNonExistentAnswers(linkedItem.enableWhen)
    );

    const isEnabled = evaluateEnableBehaviour(
      checkedIsEnabledItems,
      repeatItems[linkId].enableBehavior
    );
    repeatItems[linkId].enabledIndexes = repeatItems[linkId].enabledIndexes.map(() => isEnabled);
  }

  return items;
}

// Internal functions
function evaluateNonExistentAnswers(enableWhen: QuestionnaireItemEnableWhen) {
  const unansweredBoolean =
    typeof enableWhen.answerBoolean === 'boolean' && enableWhen.operator === '!=';
  const unExistingAnswer = enableWhen.answerBoolean === false && enableWhen.operator === 'exists';
  return unansweredBoolean || unExistingAnswer;
}

function evaluateEnableBehaviour(
  isEnabledArr: boolean[],
  enableBehavior: 'all' | 'any' | undefined
) {
  return enableBehavior === 'any'
    ? isEnabledArr.some((isEnabled) => isEnabled)
    : isEnabledArr.every((isEnabled) => isEnabled);
}
