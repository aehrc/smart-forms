import React from 'react';
import { Autocomplete, FormControl, Grid, TextField } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r5';
import { getAnswerOptionLabel } from '../../../../functions/OpenChoiceFunctions';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { QItemTypography } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';

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
      autoHighlight
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
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {openOpenChoiceSelectAnswerOption}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemOpenChoiceAutocomplete}</>;
}

export default QItemOpenChoiceSelectAnswerOption;
