import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler, QItemType } from '../FormModel';
import IndexLinker from '../IndexLinker';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const qItems = qItem.item;
  const qrGroup = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const qrItems = qrGroup.item;

  function handleQrChange(qrItem: QuestionnaireResponseItem) {
    console.log('Change qr');
  }

  if (qItems && qrItems) {
    const qrItemsByIndex = IndexLinker(qItems, qrItems);
    // console.log(qrItemsByIndex);

    return (
      <div>
        <Container sx={{ border: 0.5, mb: 2, p: 3, borderColor: grey.A400 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {qItem.text}
          </Typography>
          {qItems.map((qItem: QuestionnaireItem, i) => {
            const qrItem = qrItemsByIndex[i];
            if (qItem.type === QItemType.Group) {
              return (
                <QItemGroup
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  onQrItemChange={handleQrChange}></QItemGroup>
              );
            } else {
              return <div key={qItem.linkId}>Non-group</div>;
            }
          })}
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
