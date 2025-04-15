import { useQuestionnaireStore } from '../stores';
import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';

function useAnswerOptionsToggleExpressions(
  qItem: QuestionnaireItem,
  options: QuestionnaireItemAnswerOption[]
): boolean[] {
  const answerOptionsToggleExpressions = useQuestionnaireStore.use.answerOptionsToggleExpressions();

  const answerOptionsEnabled = new Array(options.length).fill(true);
  const itemAnswerOptionsToggleExpressions = answerOptionsToggleExpressions[qItem.linkId];
  if (itemAnswerOptionsToggleExpressions) {
    for (const answerOptionsToggleExpression of itemAnswerOptionsToggleExpressions) {
      const { options: toggleOptions, valueExpression, isEnabled } = answerOptionsToggleExpression;

      options.forEach((option, index) => {
        const matches = toggleOptions.some((toggleOption) =>
          areAnswerOptionValuesEqual(option, toggleOption)
        );

        if (matches && (isEnabled === false || isEnabled === undefined)) {
          answerOptionsEnabled[index] = false;
        }
      });
    }
  }

  return answerOptionsEnabled;
}

function areAnswerOptionValuesEqual(a: any, b: any): boolean {
  if (a.valueCoding && b.valueCoding) {
    // Use structuredClone for deep equality (temporary, will optimize later)
    return (
      JSON.stringify(structuredClone(a.valueCoding)) ===
      JSON.stringify(structuredClone(b.valueCoding))
    );
  }

  if (a.valueString !== undefined && b.valueString !== undefined) {
    return a.valueString === b.valueString;
  }

  if (a.valueInteger !== undefined && b.valueInteger !== undefined) {
    return a.valueInteger === b.valueInteger;
  }

  return false;
}

export default useAnswerOptionsToggleExpressions;
