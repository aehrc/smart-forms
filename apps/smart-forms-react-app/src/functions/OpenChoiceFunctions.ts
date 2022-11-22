import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r5';
import { QItemOpenChoiceControl } from '../interfaces/Enums';
import { isSpecificItemControl } from './ItemControlFunctions';

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
