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

import { useMemo } from 'react';
import { getQrItemsIndex, mapQItemsIndex } from '../../../../utils';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createQrGroup, updateQrGroup } from '../../../../utils/qrItem.ts';
import { QGroupContainerBox } from '../../../../../../components/Box/Box.styles.tsx';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import type { QrRepeatGroup } from '../../../../types/repeatGroup.interface.ts';
import useHidden from '../../../../hooks/useHidden.ts';
import type { Tabs } from '../../../../types/tab.interface.ts';
import GroupHeading from './GroupHeading.tsx';
import { GroupCard } from './GroupItem.styles.ts';
import NextTabButtonWrapper from './NextTabButtonWrapper.tsx';
import GroupItemSwitcher from './GroupItemSwitcher.tsx';

interface GroupItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Tabs;
  currentTabIndex?: number;
  goToNextTab?: (nextTabIndex: number) => unknown;
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
    onQrItemChange
  } = props;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  const qItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrItems = qrGroup.item;

  // Event Handlers
  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  function handleQrRepeatGroupChange(qrRepeatGroup: QrRepeatGroup) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrGroup(null, qrRepeatGroup, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load group, something has gone terribly wrong.</>;
  }

  // If an item has multiple answers, it is a repeat group
  const qrItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[])[] =
    getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={isRepeated}
      data-test="q-item-group-box">
      <GroupCard elevation={groupCardElevation} isRepeated={isRepeated}>
        <GroupHeading
          qItem={qItem}
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
              onQrItemChange={handleQrItemChange}
              onQrRepeatGroupChange={handleQrRepeatGroupChange}
            />
          );
        })}

        {/* Next tab button at the end of each tab group */}
        <NextTabButtonWrapper currentTabIndex={currentTabIndex} tabs={tabs} />
      </GroupCard>
    </QGroupContainerBox>
  );
}

export default GroupItem;
