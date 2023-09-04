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

import React, { memo, useMemo } from 'react';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import { getShortText } from '../../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import FormBodySingleTab from './FormBodySingleTab';
import type { Tabs } from '../../interfaces/tab.interface';
import useQuestionnaireStore from '../../stores/useQuestionnaireStore';
import { getContextDisplays, isTabHidden } from '../../utils/tabs';

interface FormBodyTabListProps {
  topLevelItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Tabs;
  completedTabsCollapsed: boolean;
}

const FormBodyTabList = memo(function FormBodyTabList(props: FormBodyTabListProps) {
  const { topLevelItems, currentTabIndex, tabs, completedTabsCollapsed } = props;

  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  const allContextDisplayItems = useMemo(
    () => topLevelItems.map((topLevelItem) => getContextDisplays(topLevelItem)),
    [topLevelItems]
  );

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
        const tabLabel = getShortText(qItem) ?? qItem.text ?? '';

        return (
          <Collapse key={qItem.linkId} timeout={100}>
            <FormBodySingleTab
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
