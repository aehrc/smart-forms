import React from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../functions/QrItemFunctions';
import { getTextDisplayPrompt } from '../functions/QItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemText(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrText = qrItem ? qrItem : createQrItem(qItem);
  const valueText = qrText['answer'] ? qrText['answer'][0].valueString : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    qrText = { ...qrText, answer: [{ valueString: e.target.value }] };
    onQrItemChange(qrText);
  }

  const textInput = (
    <TextField
      id={qItem.linkId}
      value={valueText}
      onChange={handleChange}
      sx={{ mb: repeats ? 0 : 4 }} // mb:4 is MUI default value
      label={getTextDisplayPrompt(qItem)}
      fullWidth
      multiline
    />
  );

  const renderQItemText = repeats ? (
    <>{textInput}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {textInput}
        </Grid>
      </Grid>
    </FormControl>
  );

  return <>{renderQItemText}</>;
}

export default QItemText;
