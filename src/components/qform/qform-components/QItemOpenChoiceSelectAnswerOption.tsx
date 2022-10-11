import React from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r5';
import { getAnswerOptionLabel } from '../functions/OpenChoiceFunctions';
import { createQrItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemOpenChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ? qrItem : createQrItem(qItem);

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
    onQrItemChange(createQrItem(qItem));
  }

  const openOpenChoiceSelectAnswerOption = (
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
  const renderQItemOpenChoiceAutocomplete = repeats ? (
    <>{openOpenChoiceSelectAnswerOption}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {openOpenChoiceSelectAnswerOption}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceSelectAnswerOption;
