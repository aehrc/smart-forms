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

import React, { memo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { PrimarySelectableList } from '../Lists.styles';
import type { QuestionnaireItem } from 'fhir/r4';
import type { Tabs } from '../../interfaces/tab.interface';
import Divider from '@mui/material/Divider';
import FormBodyTabList from './FormBodyTabList';
import ShowCompletedTabsSection from './ShowCompletedTabsSection';
import useContextDisplayItems from '../../hooks/useContextDisplayItems';

interface FormBodyTabListWrapperProps {
  topLevelItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Tabs;
}

const FormBodyTabListWrapper = memo(function FormBodyTabListWrapper(
  props: FormBodyTabListWrapperProps
) {
  const { topLevelItems, currentTabIndex, tabs } = props;

  const [completedTabsExpanded, setCompletedTabsExpanded] = useState(true);

  const { allContextDisplayItems, completedDisplayItemExists } =
    useContextDisplayItems(topLevelItems);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList
          dense
          disablePadding
          sx={{ mb: 0.5, mt: completedDisplayItemExists ? 0 : 0.5 }}
          data-test="renderer-tab-list">
          {completedDisplayItemExists ? (
            <>
              <ShowCompletedTabsSection
                completedTabsExpanded={completedTabsExpanded}
                setCompletedTabsExpanded={setCompletedTabsExpanded}
              />
              <Divider sx={{ mx: 1 }} light />
            </>
          ) : null}
          <FormBodyTabList
            topLevelItems={topLevelItems}
            currentTabIndex={currentTabIndex}
            tabs={tabs}
            completedTabsCollapsed={!completedTabsExpanded}
            allContextDisplayItems={allContextDisplayItems}
          />
        </PrimarySelectableList>
      </Box>
    </Card>
  );
});

export default FormBodyTabListWrapper;
