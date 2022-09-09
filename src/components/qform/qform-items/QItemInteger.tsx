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

function QItemInteger(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrInteger = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrInteger['answer'] ? qrInteger['answer'][0].valueInteger : 0;
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const integerValue = parseInt(e.target.value);
    setValue(integerValue);
    qrInteger = { ...qrInteger, answer: [{ valueInteger: integerValue }] };
    onQrItemChange(qrInteger);
  }

  const renderQItemInteger = repeats ? (
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

  return <div>{renderQItemInteger}</div>;
}

export default QItemInteger;
