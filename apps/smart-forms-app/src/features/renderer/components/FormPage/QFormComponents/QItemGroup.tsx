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

import { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Divider, IconButton, Tooltip } from '@mui/material';
import QItemSwitcher from './QItemSwitcher.tsx';
import { getQrItemsIndex, mapQItemsIndex } from '../../../utils';
import QItemRepeatGroup from './QItemRepeatGroup.tsx';
import QItemRepeat from './QItemRepeat.tsx';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createQrGroup, updateLinkedItem } from '../../../utils/qrItem.ts';
import { isHidden, isRepeatItemAndNotCheckbox } from '../../../utils/qItem.ts';
import { isSpecificItemControl } from '../../../utils/itemControl.ts';
import QItemGroupTable from './Tables/QItemGroupTable.tsx';
import QItemLabel from './QItemParts/QItemLabel.tsx';
import { EnableWhenContext } from '../../../../enableWhen/contexts/EnableWhenContext.tsx';
import { QGroupContainerBox } from '../../../../../components/Box/Box.styles.tsx';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { findNumOfVisibleTabs, getNextVisibleTabIndex } from '../../../utils/tabs.ts';
import Iconify from '../../../../../components/Iconify/Iconify.tsx';
import { EnableWhenExpressionContext } from '../../../../enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../types/renderProps.interface.ts';
import type { QrRepeatGroup } from '../../../types/repeatGroup.interface.ts';
import { CurrentTabIndexContext } from '../../../contexts/CurrentTabIndexContext.ts';
import { QGroupHeadingTypography } from './Typography.styles.ts';

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
    onQrItemChange
  } = props;

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenExpressionContext = useContext(EnableWhenExpressionContext);

  const { setCurrentTabIndex } = useContext(CurrentTabIndexContext);

  const qItems = qItem.item;
  const groupFromProps = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const qrItems = groupFromProps.item;

  const [group, setGroup] = useState(groupFromProps);

  useEffect(
    () => {
      const groupStateIsSame = JSON.stringify(group) === JSON.stringify(groupFromProps);
      if (!groupStateIsSame) {
        setGroup(groupFromProps);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qrItem]
  );

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  if (isHidden(qItem, enableWhenContext, enableWhenExpressionContext)) return null;

  // Event Handlers
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
      <QGroupContainerBox
        key={qItem.linkId}
        cardElevation={groupCardElevation}
        isRepeated={isRepeated}
        data-test="q-item-group-box">
        <Card
          elevation={groupCardElevation}
          sx={{ p: 3, pt: 2.5, px: groupCardElevation === 1 ? 3.25 : 3, mb: isRepeated ? 0 : 3.5 }}>
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
                    <Box flexGrow={1} />
                    <Tooltip title={!tabIsMarkedAsComplete ? 'Complete tab' : 'Mark as incomplete'}>
                      <IconButton onClick={markTabAsComplete}>
                        <CheckCircleIcon color={tabIsMarkedAsComplete ? 'success' : 'inherit'} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : null}
              </Box>
              {qItem.text ? <Divider sx={{ mt: 1, mb: 1.5 }} light /> : null}
            </>
          )}
          {qItems.map((qItem: QuestionnaireItem, i) => {
            const qrItemOrItems = qrItemsByIndex[i];

            if (isHidden(qItem, enableWhenContext, enableWhenExpressionContext)) return null;

            // Process qrItemOrItems as an qrItem array
            if (Array.isArray(qrItemOrItems)) {
              const qrItems = qrItemOrItems;

              // qItem should always be either a repeatGroup or a groupTable item
              if (qItem.repeats && qItem.type === 'group') {
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
                if (qItem.type === 'group') {
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
              } else if (qItem.type === 'group') {
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
                    onQrItemChange={handleQrItemChange}
                  />
                );
              }
            }
          })}
          {/* Next tab button at the end of each tab group */}
          {currentTabIndex !== undefined && tabs ? (
            <Box display="flex" flexDirection="row-reverse" sx={{ mt: 3 }}>
              {currentTabIndex !== Object.keys(tabs).length - 1 ? (
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<Iconify icon="material-symbols:arrow-forward" />}
                  disabled={findNumOfVisibleTabs(tabs, enableWhenContext.items) < 2}
                  sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark'
                    }
                  }}
                  onClick={() => {
                    if (currentTabIndex !== undefined && tabs) {
                      const nextVisibleTabIndex = getNextVisibleTabIndex(
                        tabs,
                        currentTabIndex,
                        enableWhenContext.items
                      );

                      // Scroll to top of page
                      window.scrollTo(0, 0);

                      setCurrentTabIndex(nextVisibleTabIndex);
                    }
                  }}>
                  Next tab
                </Button>
              ) : null}
            </Box>
          ) : null}
        </Card>
      </QGroupContainerBox>
    );
  } else {
    return <div>Unable to load group</div>;
  }
}

export default QItemGroup;
