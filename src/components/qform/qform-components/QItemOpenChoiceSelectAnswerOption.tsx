import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../QuestionnaireResponseService';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r5';
import { getAnswerOptionLabel } from '../functions/OpenChoiceFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  let valueSelect: QuestionnaireItemAnswerOption | undefined = undefined;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0];
  }

  function handleChange(event: any, newValue: QuestionnaireItemAnswerOption | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: newValue }] });
      } else {
        const option = newValue;
        if (option['valueCoding']) {
          onQrItemChange({ ...qrOpenChoice, answer: [{ valueCoding: option.valueCoding }] });
        } else if (option['valueString']) {
          onQrItemChange({ ...qrOpenChoice, answer: [{ valueString: option.valueString }] });
        } else if (option['valueInteger']) {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ valueInteger: option.valueInteger }]
          });
        }
      }
      return;
    }
    onQrItemChange(QuestionnaireResponseService.createQrItem(qItem));
  }

  const openChoiceSelectAnswerOption = (
    <Autocomplete
      id={qItem.id}
      freeSolo
      value={valueSelect ?? null}
      options={answerOptions}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} />}
    />
  );

  return <div>{openChoiceSelectAnswerOption}</div>;
}

export default QItemOpenChoiceSelectAnswerOption;
