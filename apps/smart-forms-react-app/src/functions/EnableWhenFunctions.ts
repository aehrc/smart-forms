import {
  EnableWhenItemProperties,
  EnableWhenItems,
  EnableWhenLinkedItem
} from '../interfaces/Interfaces';
import {
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

/**
 * Create a linkedQuestionsMap that contains linked items of enableWhen items
 * mapped to an array containing all its respective enableWhen items
 * returns a key-value pair of <linkedItemId, [enableWhenItem1, enableWhenItem2, enableWhenItem3]>
 *
 * @author Sean Fong
 */
export function createLinkedQuestionsMap(enableWhenItems: EnableWhenItems) {
  const linkedQuestionsMap: Record<string, string[]> = {};

  for (const linkId in enableWhenItems) {
    enableWhenItems[linkId].linked.forEach((linkedItem) => {
      const linkQId = linkedItem.enableWhen.question;
      if (!linkedQuestionsMap[linkQId]) {
        linkedQuestionsMap[linkQId] = [];
      }

      if (!linkedQuestionsMap[linkQId].includes(linkId)) {
        linkedQuestionsMap[linkQId].push(linkId);
      }
    });
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
    console.log('valueString');
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
  questionnaireResponseForm: QuestionnaireResponseItem,
  linkedQuestionsMap: Record<string, string[]>
): Record<string, QuestionnaireResponseItemAnswer[]> | null {
  if (!questionnaireResponseForm.item) return null;

  const initialValuesMap: Record<string, QuestionnaireResponseItemAnswer[]> = {};
  questionnaireResponseForm.item.forEach((item) => {
    readQuestionnaireResponseItem(item, initialValuesMap, linkedQuestionsMap);
  });
  return initialValuesMap;
}

/**
 * Read initial answer values of each qrItem recursively
 *
 * @author Sean Fong
 */
function readQuestionnaireResponseItem(
  item: QuestionnaireResponseItem,
  initialValues: Record<string, QuestionnaireResponseItemAnswer[]>,
  linkedQuestionsMap: Record<string, string[]>
) {
  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    items.forEach((item) => {
      readQuestionnaireResponseItem(item, initialValues, linkedQuestionsMap);
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
 *
 * @author Sean Fong
 */
export function setInitialAnswers(
  initialAnswers: Record<string, QuestionnaireResponseItemAnswer[]>,
  items: EnableWhenItems,
  linkedQuestionsMap: Record<string, string[]>
): EnableWhenItems {
  let updatedItems = { ...items };

  if (initialAnswers) {
    for (const linkId in initialAnswers) {
      const linkedQuestions = linkedQuestionsMap[linkId];
      const newAnswer = initialAnswers[linkId];

      updatedItems = updateItemAnswer(updatedItems, linkedQuestions, linkId, newAnswer);
    }
  }
  return updatedItems;
}

/**
 * Update each initial answer value into each enableWhenItem's answer attribute
 *
 * @author Sean Fong
 */
export function updateItemAnswer(
  items: EnableWhenItems,
  linkedQuestions: string[],
  linkId: string,
  newAnswer: QuestionnaireResponseItemAnswer[]
): EnableWhenItems {
  linkedQuestions.forEach((question) => {
    items[question].linked.forEach((linkedItem) => {
      if (linkedItem.enableWhen.question === linkId) {
        linkedItem.answer = newAnswer ?? undefined;
      }
    });
  });
  return items;
}

/**
 * Get enableWhen items' linked items and enableBehaviour attribute and save them in an EnableWhenItemProperties object
 *
 * @author Sean Fong
 */
export function getEnableWhenItemProperties(
  qItem: QuestionnaireItem
): EnableWhenItemProperties | null {
  const enableWhen = qItem.enableWhen;
  if (enableWhen) {
    const EnableWhenItemProperties: EnableWhenItemProperties = { linked: [] };
    EnableWhenItemProperties.linked = enableWhen.map((linkedItem): EnableWhenLinkedItem => {
      return { enableWhen: linkedItem };
    });

    if (qItem.enableBehavior) {
      EnableWhenItemProperties.enableBehavior = qItem.enableBehavior;
    }

    return EnableWhenItemProperties;
  }
  return null;
}
