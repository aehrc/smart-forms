/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QrRepeatGroup } from '../../../interfaces/repeatGroup.interface';
import useHidden from '../../../hooks/useHidden';
import type { Tabs } from '../../../interfaces/tab.interface';
import type { Pages } from '../../../interfaces/page.interface';
import GroupItemView from './GroupItemView';
import { QGroupContainerBox } from '../../Box.styles';
import { GroupCard } from './GroupItem.styles';
import PageButtonsWrapper from './PageButtonWrapper';

interface GroupItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
  disableCardView?: boolean;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Tabs;
  currentTabIndex?: number;
  pageIsMarkedAsComplete?: boolean;
  pages?: Pages;
  currentPageIndex?: number;
}

function GroupItem(props: GroupItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    groupCardElevation,
    disableCardView,
    tabIsMarkedAsComplete,
    tabs,
    currentTabIndex,
    pageIsMarkedAsComplete,
    pages,
    currentPageIndex,
    parentIsReadOnly,
    parentIsRepeatGroup,
    parentRepeatGroupIndex,
    onQrItemChange,
    parentStyles
  } = props;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

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
    // If there are pages passed through, render this invalid group as a card to at least allow the user to see the error
    if (pages) {
      return (
        <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={isRepeated}>
          <GroupCard elevation={groupCardElevation} isRepeated={isRepeated}>
            <>
              Group Item: Unable to load group, something has gone terribly wrong. If you are seeing
              this error message, see{' '}
              <a
                href="https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html#questionnaire-item-control-page"
                target="_blank"
                rel="noreferrer">
                https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html#questionnaire-item-control-page
              </a>{' '}
              for a standards-based way to use pages.
            </>
          </GroupCard>
          <PageButtonsWrapper currentPageIndex={currentPageIndex} pages={pages} />
        </QGroupContainerBox>
      );
    }

    // Otherwise, render the regular error message
    return <>Group Item: Unable to load group, something has gone terribly wrong.</>;
  }

  // If an item has multiple answers, it is a repeat group
  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  return (
    <GroupItemView
      qItem={qItem}
      childQItems={qItems}
      qrItemsByIndex={qrItemsByIndex}
      isRepeated={isRepeated}
      groupCardElevation={groupCardElevation}
      disableCardView={disableCardView}
      tabIsMarkedAsComplete={tabIsMarkedAsComplete}
      tabs={tabs}
      currentTabIndex={currentTabIndex}
      pageIsMarkedAsComplete={pageIsMarkedAsComplete}
      pages={pages}
      currentPageIndex={currentPageIndex}
      parentIsReadOnly={parentIsReadOnly}
      parentIsRepeatGroup={parentIsRepeatGroup}
      parentRepeatGroupIndex={parentRepeatGroupIndex}
      parentStyles={parentStyles}
      onQrItemChange={handleQrItemChange}
      onQrRepeatGroupChange={handleQrRepeatGroupChange}
    />
  );
}

export default GroupItem;
