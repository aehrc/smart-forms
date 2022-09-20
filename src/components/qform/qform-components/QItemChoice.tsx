import React from 'react';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute,
  QItemChoiceControl
} from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemChoiceRadio from './QItemChoiceRadio';
import QItemChoiceSelectAnswerOption from './QItemChoiceSelectAnswerOption';
import QItemChoiceCheckbox from './QItemChoiceCheckbox';
import QItemChoiceAutocomplete from './QItemChoiceAutocomplete';
import QItemChoiceSelectAnswerValueSet from './QItemChoiceSelectAnswerValueSet';
import { getChoiceControlType, getChoiceOrientation } from '../functions/ChoiceFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoice(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const orientation = getChoiceOrientation(qItem);

  switch (getChoiceControlType(qItem)) {
    case QItemChoiceControl.Radio:
      return (
        <QItemChoiceRadio
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemChoiceControl.Checkbox:
      return (
        <QItemChoiceCheckbox
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemChoiceControl.Autocomplete:
      return (
        <QItemChoiceAutocomplete
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemChoiceSelectAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return null;
  }
}

export default QItemChoice;
