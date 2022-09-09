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

function QItemQuantity(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  let qrQuantity = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  let answerValue = 0.0;
  let answerUnit = '';

  if (qrQuantity['answer']) {
    const answer = qrQuantity['answer'][0];
    answerValue = answer.valueQuantity ? answer.valueQuantity.value : 0.0;
    answerUnit = answer.valueQuantity ? answer.valueQuantity.unit : '';
  }

  const [value, setValue] = useState(answerValue);
  const [unit, setUnit] = useState(answerUnit);

  useEffect(() => {
    setValue(answerValue);
  }, [answerValue]);

  useEffect(() => {
    setUnit(answerUnit);
  }, [answerUnit]);

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(parseFloat(e.target.value));
    updateQrItem();
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUnit(e.target.value);
    updateQrItem();
  }

  function updateQrItem() {
    qrQuantity = {
      ...qrQuantity,
      answer: [{ valueQuantity: { value: value, unit: unit } }]
    };
    onQrItemChange(qrQuantity);
  }

  const QItemQuantityFields = (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Container>
          <TextField type="number" id={qItem.linkId} value={value} onChange={handleValueChange} />
        </Container>
      </Grid>

      <Grid item xs={8}>
        <Container>
          <TextField id={qItem.linkId + '_unit'} value={unit} onChange={handleUnitChange} />
        </Container>
      </Grid>
    </Grid>
  );

  if (repeats) {
    return <div>{QItemQuantityFields}</div>;
  } else {
    return (
      <FormControl fullWidth sx={{ m: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {QItemQuantityFields}
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

export default QItemQuantity;
