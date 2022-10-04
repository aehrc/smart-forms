import React from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrInteger = qrItem ? qrItem : createQrItem(qItem);
  const valueInteger = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }
    qrInteger = { ...qrInteger, answer: [{ valueInteger: parseInt(input) }] };
    onQrItemChange(qrInteger);
  }

  const renderQItemInteger = repeats ? (
    <TextField
      id={qItem.linkId}
      value={valueInteger}
      onChange={handleChange}
      sx={{ mb: 0 }}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
    />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <TextField type="number" id={qItem.linkId} value={valueInteger} onChange={handleChange} />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemInteger}</div>;
}

export default QItemInteger;
