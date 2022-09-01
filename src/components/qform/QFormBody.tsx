import React from 'react';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import IndexLinker from './IndexLinker';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';
import QItemGroup from './qform-items/QItemGroup';
import { QItemType } from './FormModel';

interface Props {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm } = props;

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  function handleQrChange(qrItem: QuestionnaireResponseItem) {
    console.log('Change qr');
  }

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = IndexLinker(qFormItems, qrFormItems);

    return (
      <div>
        <Container>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {qForm.text}
          </Typography>
          {qFormItems.map((qItem: QuestionnaireItem, i) => {
            const qrItem = qrFormItemsByIndex[i];
            if (qItem.type === QItemType.Group) {
              return (
                <QItemGroup
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  onQrItemChange={handleQrChange}></QItemGroup>
              );
            } else {
              return null;
            }
          })}
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
