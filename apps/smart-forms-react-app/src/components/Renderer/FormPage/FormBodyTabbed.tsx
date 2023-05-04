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

import React, { useMemo, useState } from 'react';
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
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
  currentTabIndex: number;
  hasTabContainer: boolean;
}

function FormBodyTabbed(props: Props) {
  const { qForm, qrForm, currentTabIndex, hasTabContainer, onQrItemChange } = props;

  const indexMap: Record<string, number> = useMemo(() => mapQItemsIndex(qForm), [qForm]);

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  const initialTabs = useMemo(
    () => constructTabsWithProperties(qFormItems, hasTabContainer),
    [hasTabContainer, qFormItems]
  );
  const [tabs, setTabs] =
    useState<Record<string, { tabIndex: number; isComplete: boolean }>>(initialTabs);

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, null, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems, indexMap);

    return (
      <Grid container spacing={2}>
        <TabContext value={currentTabIndex.toString()}>
          <Grid item xs={12} md={3.5} lg={3} xl={2.75}>
            <FormBodyTabList
              qFormItems={qFormItems}
              currentTabIndex={currentTabIndex}
              hasTabContainer={hasTabContainer}
              tabs={tabs}
            />
          </Grid>

          <Grid item xs={12} md={8.5} lg={9} xl={9.25}>
            {qFormItems.map((qItem, i) => {
              const qrItem = qrFormItemsByIndex[i];

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
