import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute, QItemType } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import QItemSwitcher from './QItemSwitcher';
import { getQrItemsIndex, mapQItemsIndex } from '../IndexFunctions';
import QItemRepeatGroup from '../qform-advanced-rendering/QItemRepeatGroup';
import QItemRepeat from '../qform-advanced-rendering/QItemRepeat';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const qItemsIndexMap: Record<string, number> = mapQItemsIndex(qItem);

  const qItems = qItem.item;
  const groupFromProps =
    qrItem && qrItem.item ? qrItem : QuestionnaireResponseService.createQrGroup(qItem);
  const qrItems = groupFromProps.item;

  const [group, setGroup] = useState(groupFromProps);

  useEffect(() => {
    setGroup(groupFromProps);
  }, [qrItem]);

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const qrGroup = group;
    QuestionnaireResponseService.updateLinkedItem(newQrItem, qrGroup, qItemsIndexMap);
    setGroup(qrGroup);
    onQrItemChange(qrGroup);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex = getQrItemsIndex(qItems, qrItems);

    return (
      <div>
        <Container sx={{ border: 0.5, mb: 2, p: 3, borderColor: grey.A400 }}>
          {repeats ? null : (
            <Typography variant="h6" sx={{ mb: 1 }}>
              {qItem.text}
            </Typography>
          )}
          {qItems.map((qItem: QuestionnaireItem, i) => {
            const qrItem = qrItemsByIndex[i];
            if (qItem['repeats']) {
              if (qItem.repeats) {
                if (qItem.type === QItemType.Group) {
                  return (
                    <QItemRepeatGroup
                      key={qItem.linkId}
                      qItem={qItem}
                      qrItem={qrItem}
                      repeats={true}
                      onQrItemChange={handleQrItemChange}></QItemRepeatGroup>
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
                <QItemGroup
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={false}
                  onQrItemChange={handleQrItemChange}></QItemGroup>
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
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
