import React from 'react';
import { QItemChoiceControl } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemChoiceRadioAnswerOption from './QItemChoiceRadioAnswerOption';
import QItemChoiceSelectAnswerOption from './QItemChoiceSelectAnswerOption';
import QItemChoiceCheckboxAnswerOption from './QItemChoiceCheckboxAnswerOption';
import QItemChoiceAutocomplete from './QItemChoiceAutocomplete';
import QItemChoiceSelectAnswerValueSet from './QItemChoiceSelectAnswerValueSet';
import { getChoiceControlType, getChoiceOrientation } from '../../../../functions/ChoiceFunctions';
import QItemChoiceRadioAnswerValueSet from './QItemChoiceRadioAnswerValueSet';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import QItemChoiceCheckboxAnswerValueSet from './QItemChoiceCheckboxAnswerValueSet';

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
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceRadioAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceRadioAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      }
    case QItemChoiceControl.Checkbox:
      if (qItem.answerValueSet) {
        return (
          <QItemChoiceCheckboxAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      } else {
        return (
          <QItemChoiceCheckboxAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
            orientation={orientation}
          />
        );
      }
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
