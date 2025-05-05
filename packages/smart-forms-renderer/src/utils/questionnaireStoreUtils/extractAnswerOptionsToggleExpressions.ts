import type { Extension } from 'fhir/r4';
import type { RestrictedAnswerOption } from '../../interfaces/answerOptionsToggleExpression.interface';

export function optionIsAnswerOptionsToggleExpressionOption(
  optionExtension: Extension
): optionExtension is Extension & RestrictedAnswerOption {
  return (
    optionExtension.valueCoding !== undefined ||
    optionExtension.valueString !== undefined ||
    optionExtension.valueInteger !== undefined
  );
}
