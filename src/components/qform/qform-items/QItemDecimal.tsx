import React, { useEffect, useState } from 'react';
import { Container, FormControl, Grid, TextField, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDecimal(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrDecimal = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrDecimal['answer'] ? qrDecimal['answer'][0].valueDecimal : 0.0;
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const decimalValue = parseFloat(e.target.value);
    setValue(decimalValue);
    qrDecimal = { ...qrDecimal, answer: [{ valueDecimal: decimalValue }] };
    onQrItemChange(qrDecimal);
  }

  const renderQItemDecimal = repeats ? (
    <Container>
      <TextField type="number" id={qItem.linkId} value={value} onChange={handleChange} />
    </Container>
  ) : (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <TextField type="number" id={qItem.linkId} value={value} onChange={handleChange} />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemDecimal}</div>;
}

export default QItemDecimal;
