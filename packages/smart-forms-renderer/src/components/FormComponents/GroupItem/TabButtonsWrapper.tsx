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

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import type { Tabs } from '../../../interfaces/tab.interface';
import { useQuestionnaireStore } from '../../../stores';
import NextTabButton from './NextTabButton';
import PreviousTabButton from './PreviousTabButton';
import useNextAndPreviousVisibleTabs from '../../../hooks/useNextAndPreviousVisibleTabs';

interface TabButtonsWrapperProps {
  currentTabIndex?: number;
  tabs?: Tabs;
}

const TabButtonsWrapper = memo(function TabButtonsWrapper(props: TabButtonsWrapperProps) {
  const { currentTabIndex, tabs } = props;

  const switchTab = useQuestionnaireStore.use.switchTab();

  const { previousTabIndex, nextTabIndex, numOfVisibleTabs } = useNextAndPreviousVisibleTabs(
    currentTabIndex,
    tabs
  );

  const tabsNotDefined = currentTabIndex === undefined || tabs === undefined;

  // Event handlers
  function handlePreviousTabButtonClick() {
    if (previousTabIndex === null) {
      return;
    }

    switchTab(previousTabIndex);

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  function handleNextTabButtonClick() {
    if (nextTabIndex === null) {
      return;
    }

    switchTab(nextTabIndex);

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  if (tabsNotDefined) {
    return null;
  }

  const previousTabButtonHidden = previousTabIndex === null;
  const nextTabButtonHidden = nextTabIndex === null;

  // This is more of a fallback check to prevent the user from navigating to an invisble tab if buttons are visble for some reason
  const tabButtonsDisabled = numOfVisibleTabs <= 1;

  return (
    <Box display="flex" mt={3}>
      {previousTabButtonHidden ? null : (
        <PreviousTabButton
          isDisabled={tabButtonsDisabled}
          onPreviousTabClick={handlePreviousTabButtonClick}
        />
      )}
      <Box flexGrow={1} />
      {nextTabButtonHidden ? null : (
        <NextTabButton isDisabled={tabButtonsDisabled} onNextTabClick={handleNextTabButtonClick} />
      )}
    </Box>
  );
});

export default TabButtonsWrapper;
