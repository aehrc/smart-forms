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

import React, { memo } from 'react';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import { getShortText } from '../../utils/extensions';
import type { QuestionnaireItem } from 'fhir/r4';
import FormBodySingleTab from './FormBodySingleTab';
import type { Tabs } from '../../interfaces/tab.interface';
import { useQuestionnaireStore } from '../../stores';
import { isTabHidden } from '../../utils/tabs';
import { getItemTextToDisplay } from '../../utils/itemTextToDisplay';

interface FormBodyTabListProps {
  topLevelItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Tabs;
  completedTabsCollapsed: boolean;
  allContextDisplayItems: QuestionnaireItem[][];
}

const FormBodyTabList = memo(function FormBodyTabList(props: FormBodyTabListProps) {
  const { topLevelItems, currentTabIndex, tabs, completedTabsCollapsed, allContextDisplayItems } =
    props;

  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  return (
    <TransitionGroup>
      {topLevelItems.map((qItem, i) => {
        const contextDisplayItems = allContextDisplayItems[i];
        const isTab = !!tabs[qItem.linkId];

        if (
          isTabHidden({
            qItem,
            contextDisplayItems,
            isTab,
            enableWhenIsActivated,
            enableWhenItems,
            enableWhenExpressions,
            completedTabsCollapsed
          })
        ) {
          return null;
        }

        const tabIsSelected = currentTabIndex.toString() === i.toString();
        const tabLabel = getShortText(qItem) ?? getItemTextToDisplay(qItem) ?? '';

        return (
          <Collapse
            key={qItem.linkId}
            timeout={100}
            data-linkid={qItem.linkId}
            data-label={qItem.text}>
            <FormBodySingleTab
              qItem={qItem}
              contextDisplayItems={contextDisplayItems}
              selected={tabIsSelected}
              tabLabel={tabLabel}
              listIndex={i}
            />
          </Collapse>
        );
      })}
    </TransitionGroup>
  );
});

export default FormBodyTabList;
