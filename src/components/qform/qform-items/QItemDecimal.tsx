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

function QItemDecimal(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrDecimal = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueDecimal = qrDecimal['answer'] ? qrDecimal['answer'][0].valueDecimal : 0.0;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    qrDecimal = { ...qrDecimal, answer: [{ valueDecimal: parseFloat(event.target.value) }] };
    onQrItemChange(qrDecimal);
  }

  const renderQItemDecimal = repeats ? (
    <TextField
      type="number"
      id={qItem.linkId}
      value={valueDecimal}
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
          <TextField type="number" id={qItem.linkId} value={valueDecimal} onChange={handleChange} />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemDecimal}</div>;
}

export default QItemDecimal;
