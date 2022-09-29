import { EnableWhenItems } from '../../Interfaces';
import {
  Quantity,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

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

export function isEnabledAnswerTypeSwitcher(
  enableWhen: QuestionnaireItemEnableWhen,
  answer: QuestionnaireResponseItemAnswer
): boolean {
  if (enableWhen['answerBoolean'] && answer.valueBoolean) {
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
  } else if (enableWhen['answerInteger'] && answer.valueInteger) {
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

function answerOperatorSwitcher(
  expected: boolean | string | number | Quantity,
  value: boolean | string | number | Quantity,
  operator: QuestionnaireItemEnableWhen['operator']
): boolean {
  // FIXME runs even when the linked textbox is not changed
  switch (operator) {
    case 'exists':
      return true;
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

function readQuestionnaireResponseItem(
  item: QuestionnaireResponseItem,
  initialValues: Record<string, QuestionnaireResponseItemAnswer[]>,
  linkedQuestionsMap: Record<string, string[]>
) {
  const items = item.item;
  if (items && items.length > 0) {
    items.forEach((item) => {
      readQuestionnaireResponseItem(item, initialValues, linkedQuestionsMap);
    });
    return;
  }

  if (linkedQuestionsMap[item.linkId] && item.answer) {
    initialValues[item.linkId] = item.answer;
  }

  return;
}

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
