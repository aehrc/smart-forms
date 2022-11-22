import {
  Coding,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { CheckBoxOptionType, QItemOpenChoiceControl } from '../interfaces/Enums';
import { isSpecificItemControl } from './ItemControlFunctions';
import { findInAnswerOptions, findInAnswerValueSetCodings } from './ChoiceFunctions';

/**
 * Get openChoice control type from qItem
 * defaults to select if no control code is provided
 *
 * @author Sean Fong
 */
export function getOpenChoiceControlType(qItem: QuestionnaireItem) {
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemOpenChoiceControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return QItemOpenChoiceControl.Checkbox;
  } else {
    return QItemOpenChoiceControl.Select;
  }
}

/**
 * Get string label from given answerOption
 *
 * @author Sean Fong
 */
export function getAnswerOptionLabel(option: QuestionnaireItemAnswerOption | string): string {
  if (typeof option === 'string') {
    return option;
  }

  if (option['valueCoding']) {
    return `${option.valueCoding.display}`;
  } else if (option['valueString']) {
    return option.valueString;
  } else if (option['valueInteger']) {
    return option.valueInteger.toString();
  } else {
    return '';
  }
}

/**
 * Update open-choice checkbox group answers based on checkbox changes
 *
 * @author Sean Fong
 */
export function updateQrOpenChoiceCheckboxAnswers(
  changedValue: string,
  answers: QuestionnaireResponseItemAnswer[],
  answerOptions: QuestionnaireItemAnswerOption[] | Coding[],
  qrChoiceCheckbox: QuestionnaireResponseItem,
  checkboxOptionType: CheckBoxOptionType
): QuestionnaireResponseItem | null {
  // search for answer item of changedValue from list of answer options
  let newAnswer =
    checkboxOptionType === CheckBoxOptionType.AnswerOption
      ? findInAnswerOptions(answerOptions, changedValue)
      : findInAnswerValueSetCodings(answerOptions, changedValue);

  if (!newAnswer) {
    newAnswer = { valueString: changedValue };
  }

  return { ...qrChoiceCheckbox, answer: [newAnswer] };
}
