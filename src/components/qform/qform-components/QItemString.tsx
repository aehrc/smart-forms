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

function QItemString(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrString = qrItem ? qrItem : createQrItem(qItem);
  const valueString = qrString['answer'] ? qrString['answer'][0].valueString : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    qrString = { ...qrString, answer: [{ valueString: e.target.value }] };
    onQrItemChange(qrString);
  }

  const stringInput = (
    <TextField
      id={qItem.linkId}
      value={valueString}
      onChange={handleChange}
      sx={{ mb: repeats ? 0 : 4 }} // mb:4 is MUI default value
      label={getTextDisplayPrompt(qItem)}
    />
  );

  const renderQItemString = repeats ? (
    <div>{stringInput}</div>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {stringInput}
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemString}</div>;
}

export default QItemString;
