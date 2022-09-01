import React from 'react';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import IndexLinker from './IndexLinker';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';

interface Props {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm } = props;

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = IndexLinker(qFormItems, qrFormItems);

    return (
      <div>
        <Container>
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            {qForm.text}
          </Typography>
          {qFormItems.map((item: QuestionnaireItem, i) => {
            return <div key={item.linkId}></div>;
          })}
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
