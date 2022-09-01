import React from 'react';
import { Typography, Container } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { PropsWithQrItemChangeHandler, QItemType } from '../FormModel';
import IndexLinker from '../IndexLinker';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import QItemSwitcher from './QItemSwitcher';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const qItems = qItem.item;
  const qrGroup = qrItem ? qrItem : QuestionnaireResponseService.createQrGroup(qItem);
  const qrItems = qrGroup.item;

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(newQrItem, qrGroup);
    onQrItemChange(qrGroup);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex = IndexLinker(qItems, qrItems);

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
                  onQrItemChange={handleQrItemChange}></QItemGroup>
              );
            } else {
              return (
                <QItemSwitcher
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  onQrItemChange={handleQrItemChange}></QItemSwitcher>
              );
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
