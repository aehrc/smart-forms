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
  PropsWithRepeatsAttribute,
  QrRepeatGroup
} from '../../../interfaces/Interfaces';
import { isHidden, isRepeatItemAndNotCheckbox } from '../../../functions/QItemFunctions';
import { QGroupHeadingTypography } from '../../StyledComponents/Typographys.styles';
import { isSpecificItemControl } from '../../../functions/ItemControlFunctions';
import QItemGroupTable from './QItemGroupTable';
import QItemLabel from './QItemParts/QItemLabel';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, repeats, groupCardElevation, onQrItemChange } = props;

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

  const qItemsIndexMap = mapQItemsIndex(qItem);

  const qItems = qItem.item;
  const groupFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrItems = groupFromProps.item;

  const [group, setGroup] = useState(groupFromProps);

  useEffect(() => {
    setGroup(groupFromProps);
  }, [qrItem]);

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const qrGroup: QuestionnaireResponseItem = { ...group };
    updateLinkedItem(newQrItem, null, qrGroup, qItemsIndexMap);
    setGroup(qrGroup);
    onQrItemChange(qrGroup);
  }

  function handleQrRepeatGroupChange(qrRepeatGroup: QrRepeatGroup) {
    const qrGroup: QuestionnaireResponseItem = { ...group };
    updateLinkedItem(null, qrRepeatGroup, qrGroup, qItemsIndexMap);
    setGroup(qrGroup);
    onQrItemChange(qrGroup);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[])[] =
      getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

    return (
      <Card elevation={groupCardElevation} sx={{ p: 3, mb: repeats ? 0 : 3.5 }}>
        {repeats ? null : (
          <>
            <QGroupHeadingTypography variant="h6">
              <QItemLabel qItem={qItem} />
            </QGroupHeadingTypography>
            <Divider sx={{ my: 1 }} light />
          </>
        )}
        {qItems.map((qItem: QuestionnaireItem, i) => {
          const qrItemOrItems = qrItemsByIndex[i];

          // Process qrItemOrItems as an qrItem array
          if (Array.isArray(qrItemOrItems)) {
            const qrItems = qrItemOrItems;

            // qItem should always be either a repeatGroup or a groupTable item
            if (qItem.repeats && qItem.type === QItemType.Group) {
              if (isSpecificItemControl(qItem, 'gtable')) {
                return (
                  <Box key={qItem.linkId} sx={{ my: 2 }}>
                    <QItemGroupTable
                      qItem={qItem}
                      qrItems={qrItems}
                      groupCardElevation={groupCardElevation + 1}
                      onQrRepeatGroupChange={handleQrRepeatGroupChange}
                    />
                  </Box>
                );
              } else {
                return (
                  <Box key={qItem.linkId} sx={{ my: 2 }}>
                    <QItemRepeatGroup
                      qItem={qItem}
                      qrItems={qrItems}
                      repeats={true}
                      groupCardElevation={groupCardElevation + 1}
                      onQrRepeatGroupChange={handleQrRepeatGroupChange}
                    />
                  </Box>
                );
              }
            } else {
              // It is an issue if qItem entered this decision is neither
              console.warn('Some items are not rendered');
            }
          } else {
            // Process qrItemOrItems as a single qrItem
            // if qItem is a repeating question
            const qrItem = qrItemOrItems;

            if (isRepeatItemAndNotCheckbox(qItem)) {
              if (qItem.type === QItemType.Group) {
                // If qItem is RepeatGroup or a groupTable item in this decision branch,
                // their qrItem should always be undefined
                if (isSpecificItemControl(qItem, 'gtable')) {
                  return (
                    <Box key={qItem.linkId} sx={{ my: 2 }}>
                      <QItemGroupTable
                        qItem={qItem}
                        qrItems={[]}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    </Box>
                  );
                } else {
                  return (
                    <Box key={qItem.linkId} sx={{ my: 2 }}>
                      <QItemRepeatGroup
                        qItem={qItem}
                        qrItems={[]}
                        repeats={true}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    </Box>
                  );
                }
              } else {
                return (
                  <QItemRepeat
                    key={i}
                    qItem={qItem}
                    qrItem={qrItem}
                    onQrItemChange={handleQrItemChange}
                  />
                );
              }
            }

            // if qItem is not a repeating question or is a checkbox
            if (qItem.type === QItemType.Group) {
              return (
                <Box key={qItem.linkId} sx={{ my: 2 }}>
                  <QItemGroup
                    qItem={qItem}
                    qrItem={qrItem}
                    repeats={false}
                    groupCardElevation={groupCardElevation + 1}
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
          }
        })}
      </Card>
    );
  } else {
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
