import { useQuestionnaireStore } from '../stores';
import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';

function useAnswerOptionsToggleExpressions(
  qItem: QuestionnaireItem,
  options: QuestionnaireItemAnswerOption[]
): Map<string, boolean> | null {
  const answerOptionsToggleExpressions = useQuestionnaireStore.use.answerOptionsToggleExpressions();
  const itemAnswerOptionsToggleExpressions = answerOptionsToggleExpressions[qItem.linkId];

  // Item has no answerOptionsToggleExpressions, return null early
  if (!itemAnswerOptionsToggleExpressions) {
    return null;
  }

  // Create a Map to store toggleOptions for fast lookup
  const answerOptionsToggleExpressionsMap = new Map<string, boolean>();

  // Populate the map for all toggleOptions
  for (const itemAnswerOptionsToggleExpression of itemAnswerOptionsToggleExpressions) {
    const { options: toggleOptions, isEnabled } = itemAnswerOptionsToggleExpression;

    for (const toggleOption of toggleOptions) {
      const key = generateOptionKey(toggleOption);
      const optionIsEnabled = !(isEnabled === false || isEnabled === undefined);
      answerOptionsToggleExpressionsMap.set(key, optionIsEnabled);
    }
  }

  return answerOptionsToggleExpressionsMap;
}

export function generateOptionKey(option: QuestionnaireItemAnswerOption): string {
  if (option.valueCoding) {
    const systemKey = option.valueCoding.system ?? ' ';
    const codeKey = option.valueCoding.code ?? ' ';
    const displayKey = option.valueCoding.display ?? ' ';

    return `coding:${systemKey}-${codeKey}-${displayKey}`;
  }

  if (option.valueString !== undefined) {
    return `string:${option.valueString}`;
  }

  if (option.valueInteger !== undefined) {
    return `integer:${option.valueInteger}`;
  }

  return ''; // In case no valid value is found
}

export default useAnswerOptionsToggleExpressions;
