import React, { useContext, useEffect } from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../functions/QrItemFunctions';
import { CalculatedExpressionsContext } from '../QForm';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDecimal(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const calculatedExpressions = useContext(CalculatedExpressionsContext);

  let qrDecimal = qrItem ? qrItem : createQrItem(qItem);
  const valueDecimal = qrDecimal['answer'] ? qrDecimal['answer'][0].valueDecimal : 0.0;

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      qrDecimal = { ...qrDecimal, answer: [{ valueDecimal: expression.value }] };
      onQrItemChange(qrDecimal);
    }
  }, [calculatedExpressions]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }
    qrDecimal = { ...qrDecimal, answer: [{ valueDecimal: parseFloat(input) }] };
    onQrItemChange(qrDecimal);
  }

  const renderQItemDecimal = repeats ? (
    <TextField
      id={qItem.linkId}
      value={valueDecimal}
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
          <TextField
            id={qItem.linkId}
            value={valueDecimal}
            onChange={handleChange}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemDecimal}</div>;
}

export default QItemDecimal;
