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
import { useParseXhtml } from '../../../hooks/useParseXhtml';

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
  disableCardView?: boolean;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Tabs;
  currentTabIndex?: number;
  pageIsMarkedAsComplete?: boolean;
  pages?: Pages;
  currentPageIndex?: number;
  parentStyles?: Record<string, string>;
}

function GroupItemView(props: GroupItemViewProps) {
  const {
    qItem,
    childQItems,
    qrItemsByIndex,
    isRepeated = false,
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
    onQrRepeatGroupChange,
    parentStyles
  } = props;

  // If XHTML has styles, pass them to the GroupItemView so it cna be applied down the tree
  const xhtmlStyles = useParseXhtml(qItem)?.styles;

  // Combine parent styles with this group's styles
  const combinedStyles = React.useMemo(() => {
    if (!parentStyles && !xhtmlStyles) return undefined;
    if (parentStyles && !xhtmlStyles) return parentStyles;
    if (!parentStyles && xhtmlStyles) return xhtmlStyles;

    // Merge parent styles with extracted styles (extracted styles take precedence)
    return { ...parentStyles, ...xhtmlStyles };
  }, [parentStyles, xhtmlStyles]);

  const readOnly = useReadOnly(qItem, parentIsReadOnly, parentRepeatGroupIndex);

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
        }}
        style={combinedStyles || undefined}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: '28px' }}>
          <GroupHeading
            qItem={qItem}
            readOnly={readOnly}
            groupCardElevation={groupCardElevation}
            tabIsMarkedAsComplete={tabIsMarkedAsComplete}
            pageIsMarkedAsComplete={pageIsMarkedAsComplete}
            parentStyles={combinedStyles}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {qItem.text ? <Divider sx={{ mb: 1.5, opacity: 0.6 }} /> : null}
          <>
            {childQItems.map((qItem: QuestionnaireItem, i) => {
              const qrItemOrItems = qrItemsByIndex[i];

              return (
                <GroupItemSwitcher
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItemOrItems={qrItemOrItems}
                  groupCardElevation={groupCardElevation + 1}
                  parentIsReadOnly={readOnly}
                  parentIsRepeatGroup={parentIsRepeatGroup}
                  parentRepeatGroupIndex={parentRepeatGroupIndex}
                  onQrItemChange={onQrItemChange}
                  onQrRepeatGroupChange={onQrRepeatGroupChange}
                  parentStyles={combinedStyles}
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

  // Disable card view - currently only available via disablePageCardView API
  if (disableCardView) {
    return (
      <QGroupContainerBox
        cardElevation={groupCardElevation}
        isRepeated={isRepeated}
        data-test="q-item-group-box"
        style={combinedStyles || undefined}>
        {isRepeated ? null : (
          <>
            <GroupHeading
              qItem={qItem}
              readOnly={readOnly}
              tabIsMarkedAsComplete={tabIsMarkedAsComplete}
              pageIsMarkedAsComplete={pageIsMarkedAsComplete}
              groupCardElevation={groupCardElevation}
              parentStyles={combinedStyles}
            />
            {qItem.text ? <Divider sx={{ mt: 1, mb: 1.5, opacity: 0.6 }} /> : null}
          </>
        )}
        {childQItems.map((qItem: QuestionnaireItem, i) => {
          const qrItemOrItems = qrItemsByIndex[i];

          return (
            <GroupItemSwitcher
              key={qItem.linkId}
              qItem={qItem}
              qrItemOrItems={qrItemOrItems}
              groupCardElevation={groupCardElevation + 1}
              parentIsReadOnly={readOnly}
              parentIsRepeatGroup={parentIsRepeatGroup}
              parentRepeatGroupIndex={parentRepeatGroupIndex}
              onQrItemChange={onQrItemChange}
              onQrRepeatGroupChange={onQrRepeatGroupChange}
              parentStyles={combinedStyles}
            />
          );
        })}
        {/* Next tab button at the end of each tab group */}
        <TabButtonsWrapper currentTabIndex={currentTabIndex} tabs={tabs} />
        <PageButtonsWrapper currentPageIndex={currentPageIndex} pages={pages} />
      </QGroupContainerBox>
    );
  }

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={isRepeated}
      data-test="q-item-group-box">
      <GroupCard
        elevation={groupCardElevation}
        isRepeated={isRepeated}
        style={combinedStyles || undefined}>
        {isRepeated ? null : (
          <>
            <GroupHeading
              qItem={qItem}
              readOnly={readOnly}
              tabIsMarkedAsComplete={tabIsMarkedAsComplete}
              pageIsMarkedAsComplete={pageIsMarkedAsComplete}
              groupCardElevation={groupCardElevation}
              parentStyles={combinedStyles}
            />
            {qItem.text ? <Divider sx={{ mt: 1, mb: 1.5, opacity: 0.6 }} /> : null}
          </>
        )}
        {childQItems.map((qItem: QuestionnaireItem, i) => {
          const qrItemOrItems = qrItemsByIndex[i];

          return (
            <GroupItemSwitcher
              key={qItem.linkId}
              qItem={qItem}
              qrItemOrItems={qrItemOrItems}
              groupCardElevation={groupCardElevation + 1}
              parentIsReadOnly={readOnly}
              parentIsRepeatGroup={parentIsRepeatGroup}
              parentRepeatGroupIndex={parentRepeatGroupIndex}
              onQrItemChange={onQrItemChange}
              onQrRepeatGroupChange={onQrRepeatGroupChange}
              parentStyles={combinedStyles}
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
