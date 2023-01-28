import React from 'react';
import { QItemOpenChoiceControl } from '../../../../interfaces/Enums';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import QItemOpenChoiceSelectAnswerOption from './QItemOpenChoiceSelectAnswerOption';
import QItemOpenChoiceSelectAnswerValueSet from './QItemOpenChoiceSelectAnswerValueSet';
import QItemOpenChoiceAutocomplete from './QItemOpenChoiceAutocomplete';
import { getOpenChoiceControlType } from '../../../../functions/OpenChoiceFunctions';
import {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { getChoiceOrientation } from '../../../../functions/ChoiceFunctions';
import QItemOpenChoiceCheckboxAnswerOption from './QItemOpenChoiceCheckboxAnswerOption';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoice(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const orientation = getChoiceOrientation(qItem);

  switch (getOpenChoiceControlType(qItem)) {
    case QItemOpenChoiceControl.Checkbox:
      return (
        <QItemOpenChoiceCheckboxAnswerOption
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={qItem['repeats'] ?? false}
          onQrItemChange={onQrItemChange}
          orientation={orientation}
        />
      );
    case QItemOpenChoiceControl.Autocomplete:
      return (
        <QItemOpenChoiceAutocomplete
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          onQrItemChange={onQrItemChange}
        />
      );
    case QItemOpenChoiceControl.Select:
      if (qItem.answerValueSet) {
        return (
          <QItemOpenChoiceSelectAnswerValueSet
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      } else {
        return (
          <QItemOpenChoiceSelectAnswerOption
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            onQrItemChange={onQrItemChange}
          />
        );
      }
    default:
      return null;
  }
}

export default QItemOpenChoice;
