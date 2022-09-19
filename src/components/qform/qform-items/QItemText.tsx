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

function QItemText(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrText = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueText = qrText['answer'] ? qrText['answer'][0].valueString : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    qrText = { ...qrText, answer: [{ valueString: e.target.value }] };
    onQrItemChange(qrText);
  }

  const renderQItemText = repeats ? (
    <Container>
      <TextField id={qItem.linkId} value={valueText} onChange={handleChange} fullWidth multiline />
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
              value={valueText}
              onChange={handleChange}
              fullWidth
              multiline
            />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemText}</div>;
}

export default QItemText;
