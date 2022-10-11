import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r5';
import { isSpecificItemControl } from './QItemFunctions';
import { QItemOpenChoiceControl } from '../interfaces/Enums';

export function getOpenChoiceControlType(qItem: QuestionnaireItem) {
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemOpenChoiceControl.Autocomplete;
  } else {
    return QItemOpenChoiceControl.Select;
  }
}

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
