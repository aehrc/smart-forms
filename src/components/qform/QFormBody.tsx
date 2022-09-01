import React from 'react';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import IndexLinker from './IndexLinker';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';
import QItemGroup from './qform-items/QItemGroup';
import { PropsWithQrItemChangeHandler, QItemType } from './FormModel';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(qrItem, qrForm);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

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
                  onQrItemChange={handleQrGroupChange}></QItemGroup>
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
