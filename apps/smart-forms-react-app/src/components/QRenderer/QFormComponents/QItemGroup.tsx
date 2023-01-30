/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { Card, Divider } from '@mui/material';
import { QItemType } from '../../../interfaces/Enums';
import QItemSwitcher from './QItemSwitcher';
import { getQrItemsIndex, mapQItemsIndex } from '../../../functions/IndexFunctions';
import QItemRepeatGroup from './QItemRepeatGroup';
import QItemRepeat from './QItemRepeat';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrGroup, updateLinkedItem } from '../../../functions/QrItemFunctions';
import {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler,
  QrRepeatGroup
} from '../../../interfaces/Interfaces';
import { isHidden, isRepeatItemAndNotCheckbox } from '../../../functions/QItemFunctions';
import { QGroupHeadingTypography } from '../../StyledComponents/Typographys.styles';
import { isSpecificItemControl } from '../../../functions/ItemControlFunctions';
import QItemGroupTable from './QItemGroupTable';
import QItemLabel from './QItemParts/QItemLabel';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';
import { QGroupContainerBox } from '../../StyledComponents/Boxes.styles';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function QItemGroup(props: Props) {
  const { qItem, qrItem, isRepeated, groupCardElevation, onQrItemChange } = props;

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

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
      <Card elevation={groupCardElevation} sx={{ p: 3, pt: 2.5, mb: isRepeated ? 0 : 3.5 }}>
        {isRepeated ? null : (
          <>
            <QGroupHeadingTypography variant="h6">
              <QItemLabel qItem={qItem} />
            </QGroupHeadingTypography>
            <Divider sx={{ mt: 1, mb: 1.5 }} light />
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
                  <QGroupContainerBox key={qItem.linkId}>
                    <QItemGroupTable
                      qItem={qItem}
                      qrItems={qrItems}
                      groupCardElevation={groupCardElevation + 1}
                      onQrRepeatGroupChange={handleQrRepeatGroupChange}
                    />
                  </QGroupContainerBox>
                );
              } else {
                return (
                  <QGroupContainerBox key={qItem.linkId}>
                    <QItemRepeatGroup
                      qItem={qItem}
                      qrItems={qrItems}
                      isRepeated={true}
                      groupCardElevation={groupCardElevation + 1}
                      onQrRepeatGroupChange={handleQrRepeatGroupChange}
                    />
                  </QGroupContainerBox>
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
                    <QGroupContainerBox key={qItem.linkId}>
                      <QItemGroupTable
                        qItem={qItem}
                        qrItems={[]}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    </QGroupContainerBox>
                  );
                } else {
                  return (
                    <QGroupContainerBox key={qItem.linkId}>
                      <QItemRepeatGroup
                        qItem={qItem}
                        qrItems={[]}
                        isRepeated={true}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    </QGroupContainerBox>
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
                <QGroupContainerBox key={qItem.linkId}>
                  <QItemGroup
                    qItem={qItem}
                    qrItem={qrItem}
                    isRepeated={false}
                    groupCardElevation={groupCardElevation + 1}
                    onQrItemChange={handleQrItemChange}></QItemGroup>
                </QGroupContainerBox>
              );
            } else {
              return (
                <QItemSwitcher
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  isRepeated={false}
                  isTabled={false}
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
