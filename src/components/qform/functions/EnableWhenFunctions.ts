import { EnableWhenItems } from '../../Interfaces';
import { Quantity, QuestionnaireItemEnableWhen, QuestionnaireResponseItemAnswer } from 'fhir/r5';

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
  answer: QuestionnaireResponseItemAnswer[]
): boolean {
  if (enableWhen['answerBoolean'] && answer[0].valueBoolean) {
    return answerOperatorSwitcher(
      enableWhen.answerBoolean,
      answer[0].valueBoolean,
      enableWhen.operator
    );
  } else if (enableWhen['answerDecimal'] && answer[0].valueDecimal) {
    return answerOperatorSwitcher(
      enableWhen.answerDecimal,
      answer[0].valueDecimal,
      enableWhen.operator
    );
  } else if (enableWhen['answerInteger'] && answer[0].valueInteger) {
    return answerOperatorSwitcher(
      enableWhen.answerInteger,
      answer[0].valueInteger,
      enableWhen.operator
    );
  } else if (enableWhen['answerDate'] && answer[0].valueDate) {
    return answerOperatorSwitcher(enableWhen.answerDate, answer[0].valueDate, enableWhen.operator);
  } else if (enableWhen['answerDateTime'] && answer[0].valueDateTime) {
    return answerOperatorSwitcher(
      enableWhen.answerDateTime,
      answer[0].valueDateTime,
      enableWhen.operator
    );
  } else if (enableWhen['answerTime'] && answer[0].valueTime) {
    return answerOperatorSwitcher(enableWhen.answerTime, answer[0].valueTime, enableWhen.operator);
  } else if (enableWhen['answerString'] && answer[0].valueString) {
    return answerOperatorSwitcher(
      enableWhen.answerString,
      answer[0].valueString,
      enableWhen.operator
    );
  } else if (enableWhen['answerCoding']?.code && answer[0].valueCoding?.code) {
    return answerOperatorSwitcher(
      enableWhen.answerCoding.code,
      answer[0].valueCoding.code,
      enableWhen.operator
    );
  } else if (enableWhen['answerQuantity'] && answer[0].valueQuantity) {
    return answerOperatorSwitcher(
      enableWhen.answerQuantity,
      answer[0].valueQuantity,
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
