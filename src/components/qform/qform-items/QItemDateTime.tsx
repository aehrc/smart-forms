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

function QItemDateTime(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrDateTime = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrDateTime['answer'] ? qrDateTime['answer'][0].valueDate : '';
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    qrDateTime = { ...qrDateTime, answer: [{ valueDateTime: e.target.value }] };
    onQrItemChange(qrDateTime);
  }

  const renderQItemDateTime = repeats ? (
    <Container>
      <TextField id={qItem.linkId} type="datetime-local" value={value} onChange={handleChange} />
    </Container>
  ) : (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <TextField
              id={qItem.linkId}
              type="datetime-local"
              value={value}
              onChange={handleChange}
            />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemDateTime}</div>;
}

export default QItemDateTime;
