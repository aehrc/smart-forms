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

import { memo } from 'react';
import { Box } from '@mui/material';
import { findNumOfVisibleTabs, getNextVisibleTabIndex } from '../../../../utils/tabs.ts';
import type { Tabs } from '../../../../types/tab.interface.ts';
import useQuestionnaireStore from '../../../../../../stores/useQuestionnaireStore.ts';
import NextTabButton from './NextTabButton.tsx';

interface NextTabButtonWrapperProps {
  currentTabIndex?: number;
  tabs?: Tabs;
}

const NextTabButtonWrapper = memo(function NextTabWrapper(props: NextTabButtonWrapperProps) {
  const { currentTabIndex, tabs } = props;

  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);
  const switchTab = useQuestionnaireStore((state) => state.switchTab);

  const tabsNotDefined = currentTabIndex === undefined || tabs === undefined;

  function handleNextTabClick() {
    if (tabsNotDefined) {
      return;
    }

    const nextVisibleTabIndex = getNextVisibleTabIndex({
      tabs,
      currentTabIndex,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
    switchTab(nextVisibleTabIndex);

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  if (tabsNotDefined) {
    return null;
  }

  if (currentTabIndex === Object.keys(tabs).length - 1) {
    return null;
  }

  const buttonIsDisabled =
    findNumOfVisibleTabs(tabs, enableWhenIsActivated, enableWhenItems, enableWhenExpressions) <= 1;

  return (
    <Box display="flex" flexDirection="row-reverse" mt={3}>
      <NextTabButton isDisabled={buttonIsDisabled} onNextTabClick={handleNextTabClick} />
    </Box>
  );
});

export default NextTabButtonWrapper;
