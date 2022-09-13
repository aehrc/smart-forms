import React from 'react';
import { AnswerOption, QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute,
  QItemChoiceControl
} from '../FormModel';
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem
} from '../../questionnaireResponse/QuestionnaireResponseModel';
import QItemChoiceRadio from './QItemChoiceRadio';
import { isSpecificItemControl } from './QItemFunctions';
import QItemSelectAnswerValueSet from './QItemChoiceSelectAnswerValueSet';
import QItemChoiceSelectAnswerOption from './QItemChoiceSelectAnswerOption';
import QItemChoiceCheckbox from './QItemChoiceCheckbox';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  switch (getChoiceControlType(qItem)) {
    case QItemChoiceControl.Radio:
      return <QItemChoiceRadio qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    case QItemChoiceControl.Checkbox:
      return <QItemChoiceCheckbox qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
    case QItemChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemChoiceSelectAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    case QItemChoiceControl.Autocomplete:
      // TODO choice autocomplete placeholder
      return null;
  }
  return null;
}

function getChoiceControlType(qItem: QuestionnaireItem) {
  const dropdownOptionsCount = 5;
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemChoiceControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return QItemChoiceControl.Checkbox;
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
