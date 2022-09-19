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

function QItemDateTime(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrDateTime = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueDateTime = qrDateTime['answer'] ? qrDateTime['answer'][0].valueDate : '';

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    qrDateTime = { ...qrDateTime, answer: [{ valueDateTime: event.target.value }] };
    onQrItemChange(qrDateTime);
  }

  const renderQItemDateTime = repeats ? (
    <Container>
      <TextField
        id={qItem.linkId}
        type="datetime-local"
        value={valueDateTime}
        onChange={handleChange}
      />
    </Container>
  ) : (
    <FormControl>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <TextField
              id={qItem.linkId}
              type="datetime-local"
              value={valueDateTime}
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
