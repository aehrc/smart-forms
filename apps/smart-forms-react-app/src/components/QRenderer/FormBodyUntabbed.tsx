import React from 'react';
import { Box, Card } from '@mui/material';
import QItemGroup from './QFormComponents/QItemGroup';
import { QItemType } from '../../interfaces/Enums';
import { getQrItemsIndex, mapQItemsIndex } from '../../functions/IndexFunctions';
import QItemSwitcher from './QFormComponents/QItemSwitcher';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { updateLinkedItem } from '../../functions/QrItemFunctions';
import QItemRepeatGroup from './QFormComponents/QItemRepeatGroup';
import QItemRepeat from './QFormComponents/QItemRepeat';
import { PropsWithQrItemChangeHandler } from '../../interfaces/Interfaces';
import { isSpecificItemControl } from '../../functions/ItemControlFunctions';
import QItemGroupTable from './QFormComponents/QItemGroupTable';
import { isRepeatItemAndNotCheckbox } from '../../functions/QItemFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function FormBodyUntabbed(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const qItemsIndexMap: Record<string, number> = mapQItemsIndex(qForm);

  function handleQrItemChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, null, qrForm, qItemsIndexMap);
    onQrItemChange(qrForm);
  }

  function handleQrRepeatGroupChange(newQrRepeatGroup: QuestionnaireResponseItem[]) {
    updateLinkedItem(null, newQrRepeatGroup, qrForm, qItemsIndexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems, qItemsIndexMap);

    return (
      <Box>
        <Card elevation={2} sx={{ p: 5, mb: 2 }}>
          {qFormItems.map((qItem: QuestionnaireItem, i) => {
            const qrItemOrItems = qrFormItemsByIndex[i];

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
                        repeats={true}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    </Box>
                  );
                } else {
                  return (
                    <Box key={qItem.linkId} sx={{ my: 3 }}>
                      <QItemRepeatGroup
                        qItem={qItem}
                        qrItems={qrItems}
                        repeats={true}
                        groupCardElevation={3}
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
                          repeats={true}
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
                          groupCardElevation={3}
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

              // if qItem is not a repeating question
              if (qItem.type === QItemType.Group) {
                return (
                  <Box key={qItem.linkId} sx={{ my: 2 }}>
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
            }
          })}
        </Card>
      </Box>
    );
  } else {
    return <>Unable to load form</>;
  }
}

export default FormBodyUntabbed;
