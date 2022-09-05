import React from 'react';
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler, QItemChoiceControl } from '../FormModel';
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem
} from '../../questionnaireResponse/QuestionnaireResponseModel';
import QItemChoiceSelect from './QItemChoiceSelect';
import QItemChoiceRadio from './QItemChoiceRadio';
import { isSpecificItemControl } from './QItemFunctions';
import QItemChoiceAutocomplete from './QItemChoiceAutocomplete';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  switch (getChoiceControlType(qItem)) {
    case QItemChoiceControl.Radio:
      return <QItemChoiceRadio qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    case QItemChoiceControl.Select:
      return <QItemChoiceSelect qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    case QItemChoiceControl.Autocomplete:
      return (
        <QItemChoiceAutocomplete qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />
      );
  }
  return null;
}

function getChoiceControlType(qItem: QuestionnaireItem) {
  const dropdownOptionsCount = 5;
  if (isSpecificItemControl(qItem, QItemChoiceControl.Autocomplete)) {
    return QItemChoiceControl.Autocomplete;
  } else {
    if (qItem.answerOption) {
      return qItem.answerOption.length > 0 && qItem.answerOption.length < dropdownOptionsCount
        ? QItemChoiceControl.Radio
        : QItemChoiceControl.Select;
    }
  }
}

export function findInAnswerOptions(
  answerOptions: AnswerOption[],
  selected: string
): QuestionnaireResponseAnswer | undefined {
  for (const option of answerOptions) {
    if (option['valueCoding']) {
      if (selected === option.valueCoding.code) {
        return option;
      }
    } else if (option['valueString']) {
      if (selected === option.valueString) {
        return option;
      }
    } else if (option['valueInteger']) {
      if (selected === option.valueInteger.toString()) {
        return option;
      }
    }
  }
}

export default QItemChoice;
