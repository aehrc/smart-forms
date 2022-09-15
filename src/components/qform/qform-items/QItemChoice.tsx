import React from 'react';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute,
  QItemChoiceControl
} from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemChoiceRadio from './QItemChoiceRadio';
import { getChoiceOrientation, isSpecificItemControl } from './QItemFunctions';
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
  const orientation = getChoiceOrientation(qItem);

  switch (getChoiceControlType(qItem)) {
    case QItemChoiceControl.Radio:
      return (
        <QItemChoiceRadio
          qItem={qItem}
          qrItem={qrItem}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemChoiceControl.Checkbox:
      return (
        <QItemChoiceCheckbox
          qItem={qItem}
          qrItem={qrItem}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
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
    default:
      return null;
  }
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
    } else {
      return QItemChoiceControl.Select;
    }
  }
}

export default QItemChoice;
