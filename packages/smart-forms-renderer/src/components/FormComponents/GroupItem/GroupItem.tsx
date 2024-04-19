/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import React, { useMemo } from 'react';
import { getQrItemsIndex, mapQItemsIndex } from '../../../utils/mapItem';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import { QGroupContainerBox } from '../../Box.styles';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QrRepeatGroup } from '../../../interfaces/repeatGroup.interface';
import useHidden from '../../../hooks/useHidden';
import type { Tabs } from '../../../interfaces/tab.interface';
import GroupHeading from './GroupHeading';
import { GroupCard } from './GroupItem.styles';
import TabButtonsWrapper from './TabButtonsWrapper';
import GroupItemSwitcher from './GroupItemSwitcher';
import useReadOnly from '../../../hooks/useReadOnly';

interface GroupItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Tabs;
  currentTabIndex?: number;
}

function GroupItem(props: GroupItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    groupCardElevation,
    tabIsMarkedAsComplete,
    tabs,
    currentTabIndex,
    parentIsReadOnly,
    parentIsRepeatGroup,
    parentRepeatGroupIndex,
    onQrItemChange
  } = props;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const itemIsHidden = useHidden(qItem, parentRepeatGroupIndex);
  if (itemIsHidden) {
    return null;
  }

  const qItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const qrItems = qrGroup.item;

  // Event Handlers
  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  function handleQrRepeatGroupChange(qrRepeatGroup: QrRepeatGroup) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(null, qrRepeatGroup, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load group, something has gone terribly wrong.</>;
  }

  // If an item has multiple answers, it is a repeat group
  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={isRepeated}
      data-test="q-item-group-box">
      <GroupCard elevation={groupCardElevation} isRepeated={isRepeated}>
        <GroupHeading
          qItem={qItem}
          readOnly={readOnly}
          tabIsMarkedAsComplete={tabIsMarkedAsComplete}
          isRepeated={isRepeated}
        />
        {qItems.map((qItem: QuestionnaireItem, i) => {
          const qrItemOrItems = qrItemsByIndex[i];

          return (
            <GroupItemSwitcher
              key={qItem.linkId}
              qItem={qItem}
              qrItemOrItems={qrItemOrItems}
              groupCardElevation={groupCardElevation}
              parentIsReadOnly={readOnly}
              parentIsRepeatGroup={parentIsRepeatGroup}
              parentRepeatGroupIndex={parentRepeatGroupIndex}
              onQrItemChange={handleQrItemChange}
              onQrRepeatGroupChange={handleQrRepeatGroupChange}
            />
          );
        })}

        {/* Next tab button at the end of each tab group */}
        <TabButtonsWrapper currentTabIndex={currentTabIndex} tabs={tabs} />
      </GroupCard>
    </QGroupContainerBox>
  );
}

export default GroupItem;
