import React from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemQuantity(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrQuantity = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  let valueQuantity: number | undefined = 0.0;
  let unitQuantity: string | undefined = '';

  if (qrQuantity['answer']) {
    const answer = qrQuantity['answer'][0];
    valueQuantity = answer.valueQuantity ? answer.valueQuantity.value : 0.0;
    unitQuantity = answer.valueQuantity ? answer.valueQuantity.unit : '';
  }

  const QItemQuantityFields = (
    <Grid container columnSpacing={1}>
      <Grid item xs={6}>
        <TextField
          type="number"
          id={qItem.linkId}
          value={valueQuantity}
          onChange={(event) =>
            onQrItemChange({
              ...qrQuantity,
              answer: [
                { valueQuantity: { value: parseFloat(event.target.value), unit: unitQuantity } }
              ]
            })
          }
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          id={qItem.linkId + '_unit'}
          value={unitQuantity}
          onChange={(event) =>
            onQrItemChange({
              ...qrQuantity,
              answer: [{ valueQuantity: { value: valueQuantity, unit: event.target.value } }]
            })
          }
        />
      </Grid>
    </Grid>
  );

  if (repeats) {
    return <div>{QItemQuantityFields}</div>;
  } else {
    return (
      <FormControl>
        <Grid container columnSpacing={6}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {QItemQuantityFields}
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

export default QItemQuantity;
