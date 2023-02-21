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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Card, Collapse, Divider, IconButton, Tooltip } from '@mui/material';
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
import { QGroupContainerBox } from '../../StyledComponents/Boxes.styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { RoundButton } from '../../StyledComponents/Buttons.styles';
import { findNumOfVisibleTabs, getNextVisibleTabIndex } from '../../../functions/TabFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
  tabIsMarkedAsComplete?: boolean;
  tabs?: Record<string, { tabIndex: number; isComplete: boolean }>;
  currentTabIndex?: number;
  markTabAsComplete?: () => unknown;
  goToNextTab?: (nextTabIndex: number) => unknown;
}

function QItemGroup(props: Props) {
  const {
    qItem,
    qrItem,
    isRepeated,
    groupCardElevation,
    tabIsMarkedAsComplete,
    tabs,
    currentTabIndex,
    markTabAsComplete,
    goToNextTab,
    onQrItemChange
  } = props;

  const enableWhenContext = useContext(EnableWhenContext);

  let renderComponent = true;

  const qItems = qItem.item;
  const groupFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrItems = groupFromProps.item;

  const [group, setGroup] = useState(groupFromProps);

  useEffect(() => {
    const groupStateIsSame = JSON.stringify(group) === JSON.stringify(groupFromProps);
    if (!groupStateIsSame) {
      setGroup(groupFromProps);
    }
  }, [qrItem]);

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  if (isHidden(qItem, enableWhenContext)) {
    renderComponent = false;
  }

  function handleQrItemChange(newQrItem: QuestionnaireResponseItem) {
    const qrGroup: QuestionnaireResponseItem = { ...group };
    updateLinkedItem(newQrItem, null, qrGroup, qItemsIndexMap);
    onQrItemChange(qrGroup);
  }

  function handleQrRepeatGroupChange(qrRepeatGroup: QrRepeatGroup) {
    const qrGroup: QuestionnaireResponseItem = { ...group };
    updateLinkedItem(null, qrRepeatGroup, qrGroup, qItemsIndexMap);
    onQrItemChange(qrGroup);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[])[] =
      getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

    return (
      <Collapse in={renderComponent} timeout={300}>
        <QGroupContainerBox
          key={qItem.linkId}
          cardElevation={groupCardElevation}
          isRepeated={isRepeated}
          data-test="q-item-group-box">
          <Card elevation={groupCardElevation} sx={{ p: 3, pt: 2.5, mb: isRepeated ? 0 : 3.5 }}>
            {isRepeated ? null : (
              <>
                <Box display="flex" alignItems="center">
                  <QGroupHeadingTypography
                    variant="h6"
                    isTabHeading={tabIsMarkedAsComplete !== undefined}>
                    <QItemLabel qItem={qItem} />
                  </QGroupHeadingTypography>

                  {tabIsMarkedAsComplete !== undefined && markTabAsComplete ? (
                    <>
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip
                        title={!tabIsMarkedAsComplete ? 'Complete tab' : 'Mark as incomplete'}>
                        <IconButton onClick={markTabAsComplete}>
                          <CheckCircleIcon color={tabIsMarkedAsComplete ? 'success' : 'inherit'} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : null}
                </Box>
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
                      <QItemGroupTable
                        key={qItem.linkId}
                        qItem={qItem}
                        qrItems={qrItems}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    );
                  } else {
                    return (
                      <QItemRepeatGroup
                        key={qItem.linkId}
                        qItem={qItem}
                        qrItems={qrItems}
                        isRepeated={true}
                        groupCardElevation={groupCardElevation + 1}
                        onQrRepeatGroupChange={handleQrRepeatGroupChange}
                      />
                    );
                  }
                } else {
                  // It is an issue if qItem entered this decision is neither
                  console.warn('Some items are not rendered');
                  return null;
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
                        <QItemGroupTable
                          key={qItem.linkId}
                          qItem={qItem}
                          qrItems={[]}
                          groupCardElevation={groupCardElevation + 1}
                          onQrRepeatGroupChange={handleQrRepeatGroupChange}
                        />
                      );
                    } else {
                      return (
                        <QItemRepeatGroup
                          key={qItem.linkId}
                          qItem={qItem}
                          qrItems={[]}
                          isRepeated={true}
                          groupCardElevation={groupCardElevation + 1}
                          onQrRepeatGroupChange={handleQrRepeatGroupChange}
                        />
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
                } else if (qItem.type === QItemType.Group) {
                  // if qItem is not a repeating question or is a checkbox
                  return (
                    <QItemGroup
                      key={qItem.linkId}
                      qItem={qItem}
                      qrItem={qrItem}
                      isRepeated={false}
                      groupCardElevation={groupCardElevation + 1}
                      onQrItemChange={handleQrItemChange}></QItemGroup>
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
            {/* Next tab button at the end of each tab group */}
            {currentTabIndex !== undefined && tabs && goToNextTab ? (
              <Box display="flex" flexDirection="row-reverse" sx={{ mt: 3 }}>
                {currentTabIndex !== Object.keys(tabs).length - 1 ? (
                  <RoundButton
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    disabled={findNumOfVisibleTabs(tabs, enableWhenContext.items) < 2}
                    onClick={() => {
                      if (currentTabIndex !== undefined && tabs) {
                        const nextVisibleTabIndex = getNextVisibleTabIndex(
                          tabs,
                          currentTabIndex,
                          enableWhenContext.items
                        );
                        goToNextTab(nextVisibleTabIndex);
                      }
                    }}>
                    Next tab
                  </RoundButton>
                ) : null}
              </Box>
            ) : null}
          </Card>
        </QGroupContainerBox>
      </Collapse>
    );
  } else {
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
