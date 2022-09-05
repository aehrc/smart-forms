import React, { useEffect, useState } from 'react';
import { Checkbox, Container, FormControl, Grid, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemBoolean(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  let qrBoolean = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrBoolean['answer'] ? qrBoolean['answer'][0].valueBoolean : false;
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.checked);
    qrBoolean = { ...qrBoolean, text: qItem.text, answer: [{ valueBoolean: e.target.checked }] };
    onQrItemChange(qrBoolean);
  }

  return (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <Checkbox id={qItem.linkId} checked={value} onChange={handleChange} />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemBoolean;
