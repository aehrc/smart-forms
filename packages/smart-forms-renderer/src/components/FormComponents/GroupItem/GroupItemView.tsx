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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { QGroupContainerBox } from '../../Box.styles';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithQrRepeatGroupChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { Tabs } from '../../../interfaces/tab.interface';
import type { Pages } from '../../../interfaces/page.interface';
import GroupHeading from './GroupHeading';
import { GroupCard } from './GroupItem.styles';
import TabButtonsWrapper from './TabButtonsWrapper';
import GroupItemSwitcher from './GroupItemSwitcher';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import { getGroupCollapsible } from '../../../utils/qItem';
import useReadOnly from '../../../hooks/useReadOnly';
import { GroupAccordion } from './GroupAccordion.styles';
import PageButtonsWrapper from './PageButtonWrapper';

interface GroupItemViewProps
  extends PropsWithQrItemChangeHandler,
    PropsWithQrRepeatGroupChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
  qItem: QuestionnaireItem;
  childQItems: QuestionnaireItem[];
  qrItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined)[];
  groupCardElevation: number;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Tabs;
  currentTabIndex?: number;
  pageIsMarkedAsComplete?: boolean;
  pages?: Pages;
  currentPageIndex?: number;
}

function GroupItemView(props: GroupItemViewProps) {
  const {
    qItem,
    childQItems,
    qrItemsByIndex,
    isRepeated,
    groupCardElevation,
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
    onQrRepeatGroupChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Render collapsible group item
  // If group item is a repeating instance, do not render group item as collapsible
  const groupCollapsibleValue = getGroupCollapsible(qItem);
  if (groupCollapsibleValue && !isRepeated) {
    const isDefaultOpen = groupCollapsibleValue === 'default-open';
    return (
      <GroupAccordion
        disableGutters
        defaultExpanded={isDefaultOpen}
        elevation={groupCardElevation}
        isRepeated={isRepeated}
        slotProps={{
          transition: { unmountOnExit: true, timeout: 250 }
        }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: '28px' }}>
          <GroupHeading
            qItem={qItem}
            readOnly={readOnly}
            tabIsMarkedAsComplete={tabIsMarkedAsComplete}
            pageIsMarkedAsComplete={pageIsMarkedAsComplete}
            isRepeated={isRepeated}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {qItem.text ? <Divider sx={{ mb: 1.5 }} light /> : null}
          <>
            {childQItems.map((qItem: QuestionnaireItem, i) => {
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
                  onQrItemChange={onQrItemChange}
                  onQrRepeatGroupChange={onQrRepeatGroupChange}
                />
              );
            })}

            {/* Next tab button at the end of each tab group */}
            <TabButtonsWrapper currentTabIndex={currentTabIndex} tabs={tabs} />
            <PageButtonsWrapper currentPageIndex={currentPageIndex} pages={pages} />
          </>
        </AccordionDetails>
      </GroupAccordion>
    );
  }

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
          pageIsMarkedAsComplete={pageIsMarkedAsComplete}
          isRepeated={isRepeated}
        />
        {childQItems.map((qItem: QuestionnaireItem, i) => {
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
              onQrItemChange={onQrItemChange}
              onQrRepeatGroupChange={onQrRepeatGroupChange}
            />
          );
        })}

        {/* Next tab button at the end of each tab group */}
        <TabButtonsWrapper currentTabIndex={currentTabIndex} tabs={tabs} />
        <PageButtonsWrapper currentPageIndex={currentPageIndex} pages={pages} />
      </GroupCard>
    </QGroupContainerBox>
  );
}

export default GroupItemView;
