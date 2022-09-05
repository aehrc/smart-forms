import React from 'react';
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler, QItemChoiceControl } from '../FormModel';
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem
} from '../../questionnaireResponse/QuestionnaireResponseModel';
import QItemChoiceSelect from './QItemChoiceSelect';
import QItemChoiceRadio from './QItemChoiceRadio';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  if (qItem['answerOption']) {
    switch (getChoiceControlType(qItem.answerOption)) {
      case QItemChoiceControl.Radio:
        return <QItemChoiceRadio qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
      case QItemChoiceControl.Select:
        return <QItemChoiceSelect qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    }
  }
  return null;
}

function getChoiceControlType(answerOptions: AnswerOption[]) {
  const dropdownOptionsCount = 5;
  return answerOptions.length > 0 && answerOptions.length < dropdownOptionsCount
    ? QItemChoiceControl.Radio
    : QItemChoiceControl.Select;
}

export function findInAnswerOptions(
  answerOptions: AnswerOption[],
  selected: string
): QuestionnaireResponseAnswer | undefined {
  for (const option of answerOptions) {
    if (option['valueCoding']) {
      if (selected === option.valueCoding?.code) {
        return option.valueCoding;
      }
    }
  }
}

export default QItemChoice;
