import React, { useEffect, useState } from 'react';
import { Box, Card, Divider, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute, QItemType } from '../FormModel';
import QItemSwitcher from './QItemSwitcher';
import { getQrItemsIndex, mapQItemsIndex } from '../functions/IndexFunctions';
import QItemRepeatGroup from './QItemRepeatGroup';
import QItemRepeat from './QItemRepeat';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { isHidden } from '../functions/QItemFunctions';
import { createQrGroup, updateLinkedItem } from '../functions/QrItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, repeats, groupCardElevation, onQrItemChange } = props;
  const qItemsIndexMap = mapQItemsIndex(qItem);

  if (isHidden(qItem)) return null;

  const qItems = qItem.item;
  const groupFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrItems = groupFromProps.item;

  const [group, setGroup] = useState(groupFromProps);

  useEffect(() => {
    setGroup(groupFromProps);
  }, [qrItem]);

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const qrGroup = { ...group };
    updateLinkedItem(newQrItem, qrGroup, qItemsIndexMap);
    setGroup(qrGroup);
    onQrItemChange(qrGroup);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex = getQrItemsIndex(qItems, qrItems);

    return (
      <Card elevation={groupCardElevation} sx={{ p: 5, py: 4 }}>
        {repeats ? null : (
          <div>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {qItem.text}
            </Typography>
            <Divider sx={{ mt: 2, mb: 4 }} light />
          </div>
        )}
        {qItems.map((qItem: QuestionnaireItem, i) => {
          const qrItem = qrItemsByIndex[i];
          if (qItem['repeats']) {
            if (qItem.repeats) {
              if (qItem.type === QItemType.Group) {
                return (
                  <Box key={qItem.linkId} sx={{ my: 3 }}>
                    <QItemRepeatGroup
                      qItem={qItem}
                      qrItem={qrItem}
                      repeats={true}
                      groupCardElevation={groupCardElevation + 2}
                      onQrItemChange={handleQrItemChange}></QItemRepeatGroup>
                  </Box>
                );
              } else {
                return (
                  <QItemRepeat
                    key={qItem.linkId}
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
                  groupCardElevation={groupCardElevation + 2}
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
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
