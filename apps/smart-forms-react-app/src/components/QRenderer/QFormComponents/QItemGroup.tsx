import React, { useEffect, useState } from 'react';
import { Box, Card, Divider } from '@mui/material';
import { QItemType } from '../../../interfaces/Enums';
import QItemSwitcher from './QItemSwitcher';
import { getQrItemsIndex, mapQItemsIndex } from '../../../functions/IndexFunctions';
import QItemRepeatGroup from './QItemRepeatGroup';
import QItemRepeat from './QItemRepeat';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrGroup, updateLinkedItem } from '../../../functions/QrItemFunctions';
import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../interfaces/Interfaces';
import { hideQItem } from '../../../functions/QItemFunctions';
import { QGroupHeadingTypography } from '../../StyledComponents/Typographys.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, repeats, groupCardElevation, onQrItemChange } = props;

  if (hideQItem(qItem)) return null;

  const qItemsIndexMap = mapQItemsIndex(qItem);

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
      <Card elevation={groupCardElevation} sx={{ py: 3, px: 3.5, mb: 3.5 }}>
        {repeats ? null : (
          <>
            <QGroupHeadingTypography variant="h6">{qItem.text}</QGroupHeadingTypography>
            <Divider sx={{ mt: 1, mb: 1.5 }} light />
          </>
        )}
        {qItems.map((qItem: QuestionnaireItem, i) => {
          const qrItem = qrItemsByIndex[i];
          if (qItem['repeats']) {
            if (qItem.repeats) {
              if (qItem.type === QItemType.Group) {
                return (
                  <Box key={qItem.linkId} sx={{ my: 2 }}>
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
              <Box key={qItem.linkId} sx={{ my: 2 }}>
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
