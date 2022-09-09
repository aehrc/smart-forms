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

function QItemText(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrText = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answerValue = qrText['answer'] ? qrText['answer'][0].valueString : '';
  const [value, setValue] = useState(answerValue);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    qrText = { ...qrText, answer: [{ valueString: e.target.value }] };
    onQrItemChange(qrText);
  }

  const renderQItemText = repeats ? (
    <Container>
      <TextField
        id={qItem.linkId}
        value={value}
        onChange={handleChange}
        rows={10}
        fullWidth
        multiline
      />
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
              value={value}
              onChange={handleChange}
              rows={10}
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
