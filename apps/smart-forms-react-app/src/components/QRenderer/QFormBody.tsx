import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import QItemGroup from './QFormComponents/QItemGroup';
import { QItemType } from '../../interfaces/Enums';
import { getQrItemsIndex, mapQItemsIndex } from '../../functions/IndexFunctions';
import QItemSwitcher from './QFormComponents/QItemSwitcher';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { updateLinkedItem } from '../../functions/QrItemFunctions';
import QItemRepeatGroup from './QFormComponents/QItemRepeatGroup';
import QItemRepeat from './QFormComponents/QItemRepeat';
import { PropsWithQrItemChangeHandler } from '../../interfaces/Interfaces';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const indexMap: Record<string, number> = mapQItemsIndex(qForm);

  function handleQrItemChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <Card elevation={2} sx={{ p: 5, py: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {qForm.text}
        </Typography>
        {qFormItems.map((qItem: QuestionnaireItem, i) => {
          const qrItem = qrFormItemsByIndex[i];
          if (qItem['repeats']) {
            if (qItem.repeats) {
              if (qItem.type === QItemType.Group) {
                return (
                  <Box key={qItem.linkId} sx={{ my: 3 }}>
                    <QItemRepeatGroup
                      qItem={qItem}
                      qrItem={qrItem}
                      repeats={true}
                      groupCardElevation={3}
                      onQrItemChange={handleQrItemChange}></QItemRepeatGroup>
                  </Box>
                );
              } else {
                return (
                  <QItemRepeat
                    key={i}
                    qItem={qItem}
                    qrItem={qrItem}
                    onQrItemChange={handleQrItemChange}></QItemRepeat>
                );
              }
            }
          }

          // if qItem is not a repeating question
          if (qItem.type === QItemType.Group) {
            return (
              <Box key={qItem.linkId} sx={{ my: 4 }}>
                <QItemGroup
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={false}
                  groupCardElevation={3}
                  onQrItemChange={handleQrItemChange}></QItemGroup>
              </Box>
            );
          } else {
            return (
              <QItemSwitcher
                key={qItem.linkId}
                qItem={qItem}
                qrItem={qrItem}
                repeats={false}
                onQrItemChange={handleQrItemChange}></QItemSwitcher>
            );
          }
        })}
      </Card>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
