import React from 'react';
import { Container, FormControl, Grid, TextField, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDate(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrDate = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueDate = qrDate['answer'] ? qrDate['answer'][0].valueDate : '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    qrDate = { ...qrDate, answer: [{ valueDate: event.target.value }] };
    onQrItemChange(qrDate);
  }

  const renderQItemDate = repeats ? (
    <Container>
      <TextField id={qItem.linkId} type="date" value={valueDate} onChange={handleChange} />
    </Container>
  ) : (
    <FormControl>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <TextField id={qItem.linkId} type="date" value={valueDate} onChange={handleChange} />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemDate}</div>;
}

export default QItemDate;
