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

import { useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { PropsWithQrItemChangeHandler } from '../../../interfaces/Interfaces';
import { TabContext, TabPanel } from '@mui/lab';
import { getQrItemsIndex, mapQItemsIndex } from '../../../functions/IndexFunctions';
import QItemGroup from './QFormComponents/QItemGroup';
import { constructTabsWithProperties, isTab } from '../../../functions/TabFunctions';
import { updateLinkedItem } from '../../../functions/QrItemFunctions';
import FormBodyTabList from './Tabs/FormBodyTabList';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem;
  currentTabIndex: number;
  hasTabContainer: boolean;
}

function FormBodyTabbed(props: Props) {
  const { topLevelQItem, topLevelQRItem, currentTabIndex, hasTabContainer, onQrItemChange } = props;

  const indexMap: Record<string, number> = useMemo(
    () => mapQItemsIndex(topLevelQItem),
    [topLevelQItem]
  );

  const qItems = topLevelQItem.item;
  const qrItems = topLevelQRItem.item;

  const initialTabs = useMemo(
    () => constructTabsWithProperties(qItems, hasTabContainer),
    [hasTabContainer, qItems]
  );
  const [tabs, setTabs] =
    useState<Record<string, { tabIndex: number; isComplete: boolean }>>(initialTabs);

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, null, topLevelQRItem, indexMap);
    onQrItemChange(topLevelQRItem);
  }

  if (qItems && qrItems) {
    const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, indexMap);

    return (
      <Grid container spacing={2}>
        <TabContext value={currentTabIndex.toString()}>
          <Grid item xs={12} md={3.5} lg={3} xl={2.75}>
            <FormBodyTabList
              qFormItems={qItems}
              currentTabIndex={currentTabIndex}
              hasTabContainer={hasTabContainer}
              tabs={tabs}
            />
          </Grid>

          <Grid item xs={12} md={8.5} lg={9} xl={9.25}>
            {qItems.map((qItem, i) => {
              const qrItem = qrItemsByIndex[i];

              if ((isTab(qItem) || hasTabContainer) && !Array.isArray(qrItem)) {
                return (
                  <TabPanel
                    key={qItem.linkId}
                    sx={{ p: 0 }}
                    value={i.toString()}
                    data-test="renderer-tab-panel">
                    <QItemGroup
                      qItem={qItem}
                      qrItem={qrItem}
                      isRepeated={qItem.repeats ?? false}
                      groupCardElevation={1}
                      tabIsMarkedAsComplete={tabs[qItem.linkId].isComplete ?? false}
                      tabs={tabs}
                      currentTabIndex={currentTabIndex}
                      markTabAsComplete={() => {
                        setTabs({
                          ...tabs,
                          [qItem.linkId]: {
                            tabIndex: tabs[qItem.linkId].tabIndex,
                            isComplete: !tabs[qItem.linkId].isComplete
                          }
                        });
                      }}
                      onQrItemChange={handleQrGroupChange}
                    />
                  </TabPanel>
                );
              } else {
                return null;
              }
            })}
          </Grid>
        </TabContext>
      </Grid>
    );
  } else {
    return <>Unable to load form</>;
  }
}

export default FormBodyTabbed;
