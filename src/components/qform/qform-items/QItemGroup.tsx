import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;
  return (
    <div>
      <Container sx={{ border: 0.5, mb: 2, p: 3, borderColor: grey.A400 }}>
        <Typography variant="h6">{qItem.text}</Typography>
      </Container>
    </div>
  );
}

export default QItemGroup;
