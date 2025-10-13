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
import { Grid } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../utils/qrItem';
import FormBodyTabListWrapper from '../Tabs/FormBodyTabListWrapper';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../interfaces/renderProps.interface';
import { useQuestionnaireStore, useRendererConfigStore } from '../../stores';
import type { GridProps } from '@mui/material/Grid';

interface FormBodyTabbedProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem | null;
}

function FormBodyTabbed(props: FormBodyTabbedProps) {
  const { topLevelQItem, topLevelQRItem, parentIsReadOnly, onQrItemChange } = props;

  const tabs = useQuestionnaireStore.use.tabs();
  const currentTab = useQuestionnaireStore.use.currentTabIndex();

  const tabListWidthOrResponsive = useRendererConfigStore.use.tabListWidthOrResponsive();

  const indexMap: Record<string, number> = useMemo(
    () => mapQItemsIndex(topLevelQItem),
    [topLevelQItem]
  );

  const nonNullTopLevelQRItem = topLevelQRItem ?? createEmptyQrGroup(topLevelQItem);

  const qItems = topLevelQItem.item;
  const qrItems = nonNullTopLevelQRItem.item;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateQrItemsInGroup(qrItem, null, nonNullTopLevelQRItem, indexMap);
    onQrItemChange(nonNullTopLevelQRItem);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load form</>;
  }

  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, indexMap);

  // If tabListWidthOrBreakpoints is a number, it is a fixed width of the tab list - set a fixed width and prevent shrinking
  // If tabListWidthOrBreakpoints is an object, it is a MUI Breakpoints object
  const tabListWrapperProps: GridProps =
    typeof tabListWidthOrResponsive === 'number'
      ? { sx: { width: tabListWidthOrResponsive, flexShrink: 0 } }
      : { size: { ...tabListWidthOrResponsive.tabListBreakpoints } };

  const qItemTabPanelProps: GridProps =
    typeof tabListWidthOrResponsive === 'number'
      ? { sx: { flexGrow: 1 } }
      : { size: { ...tabListWidthOrResponsive.tabContentBreakpoints } };

  return (
    <Grid container spacing={1.5} sx={{ flexWrap: 'nowrap' }}>
      <TabContext value={currentTab.toString()}>
        <Grid {...tabListWrapperProps}>
          <FormBodyTabListWrapper topLevelItems={qItems} currentTabIndex={currentTab} tabs={tabs} />
        </Grid>

        <Grid {...qItemTabPanelProps}>
          {qItems.map((qItem, i) => {
            const qrItem = qrItemsByIndex[i];

            const isNotRepeatGroup = !Array.isArray(qrItem);
            const isTab = !!tabs[qItem.linkId];

            if (!isTab || !isNotRepeatGroup) {
              // Something has gone horribly wrong
              return null;
            }

            const isRepeated = qItem.repeats ?? false;
            const tabIsMarkedAsComplete = tabs[qItem.linkId].isComplete ?? false;

            return (
              <TabPanel
                aria-labelledby={`tab-${i}`}
                key={qItem.linkId}
                sx={{ p: 0 }}
                value={i.toString()}
                id={`tabpanel-${i}`}
                data-test="renderer-tab-panel">
                <GroupItem
                  qItem={qItem}
                  qrItem={qrItem ?? null}
                  isRepeated={isRepeated}
                  groupCardElevation={1}
                  tabIsMarkedAsComplete={tabIsMarkedAsComplete}
                  tabs={tabs}
                  currentTabIndex={currentTab}
                  parentIsReadOnly={parentIsReadOnly}
                  onQrItemChange={handleQrGroupChange}
                />
              </TabPanel>
            );
          })}
        </Grid>
      </TabContext>
    </Grid>
  );
}

export default FormBodyTabbed;
