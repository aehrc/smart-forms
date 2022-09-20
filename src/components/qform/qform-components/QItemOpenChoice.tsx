import React from 'react';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute,
  QItemOpenChoiceControl
} from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemOpenChoiceSelectAnswerOption from './QItemOpenChoiceSelectAnswerOption';
import QItemOpenChoiceSelectAnswerValueSet from './QItemOpenChoiceSelectAnswerValueSet';
import QItemOpenChoiceAutocomplete from './QItemOpenChoiceAutocomplete';
import { getOpenChoiceControlType } from '../functions/OpenChoiceFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoice(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  switch (getOpenChoiceControlType(qItem)) {
    case QItemOpenChoiceControl.Autocomplete:
      return (
        <QItemOpenChoiceAutocomplete
          qItem={qItem}
          qrItem={qrItem}
          repeats={repeats}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemOpenChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemOpenChoiceSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            repeats={repeats}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemOpenChoiceSelectAnswerOption
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

export default QItemOpenChoice;
