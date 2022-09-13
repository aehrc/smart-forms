import React, { useEffect, useState } from 'react';
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

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
      <FormControlLabel control={<Checkbox checked={value} onChange={handleChange} />} label="" />
    </Container>
  ) : (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <FormControlLabel
              control={<Checkbox checked={value} onChange={handleChange} />}
              label=""
            />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );

  return <div>{renderQItemBoolean}</div>;
}

export default QItemBoolean;
