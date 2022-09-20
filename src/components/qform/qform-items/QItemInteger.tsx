import React from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrInteger = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueInteger = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const integerValue = parseInt(e.target.value);
    qrInteger = { ...qrInteger, answer: [{ valueInteger: integerValue }] };
    onQrItemChange(qrInteger);
  }

  const renderQItemInteger = repeats ? (
    <TextField
      type="number"
      id={qItem.linkId}
      value={valueInteger}
      onChange={handleChange}
      sx={{ mb: 0 }}
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
