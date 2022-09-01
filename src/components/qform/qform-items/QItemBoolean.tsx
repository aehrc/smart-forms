import React from 'react';
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

  const qrBoolean = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);

  return (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <Checkbox id={qItem.linkId} />
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemBoolean;
