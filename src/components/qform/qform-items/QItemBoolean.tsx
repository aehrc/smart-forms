import React, { useEffect, useState } from 'react';
import { Checkbox, Container, FormControl, Grid, Typography } from '@mui/material';
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

function QItemBoolean(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrBoolean = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrBoolean['answer'] ? qrBoolean['answer'][0].valueBoolean : false;
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.checked);
    qrBoolean = { ...qrBoolean, answer: [{ valueBoolean: e.target.checked }] };
    onQrItemChange(qrBoolean);
  }

  const renderQItemBoolean = repeats ? (
    <Container>
      <Checkbox id={qItem.linkId} checked={value} onChange={handleChange} />
    </Container>
  ) : (
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

  return <div>{renderQItemBoolean}</div>;
}

export default QItemBoolean;
