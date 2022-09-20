import React from 'react';
import { Checkbox, FormControl, FormControlLabel, Grid, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemBoolean(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrBoolean = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueBoolean = qrBoolean['answer'] ? qrBoolean['answer'][0].valueBoolean : false;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    qrBoolean = { ...qrBoolean, answer: [{ valueBoolean: event.target.checked }] };
    onQrItemChange(qrBoolean);
  }

  const renderQItemBoolean = repeats ? (
    <FormControlLabel
      control={<Checkbox checked={valueBoolean} onChange={handleChange} sx={{ mb: 0 }} />}
      label=""
    />
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <FormControlLabel
            control={<Checkbox checked={valueBoolean} onChange={handleChange} />}
            label=""
          />
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemBoolean}</div>;
}

export default QItemBoolean;
