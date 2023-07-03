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

import type { Tabs } from '../features/renderer/types/tab.interface.ts';
import type {
  EnableWhenExpression,
  EnableWhenItems
} from '../features/enableWhen/types/enableWhen.interface.ts';

export function getFirstVisibleTab(
  tabs: Tabs,
  enableWhenItems: EnableWhenItems,
  enableWhenExpressions: Record<string, EnableWhenExpression>
) {
  return Object.entries(tabs)
    .sort(([, tabA], [, tabB]) => tabA.tabIndex - tabB.tabIndex)
    .findIndex(([tabLinkId, tab]) => {
      if (tab.isHidden) {
        return false;
      }

      if (enableWhenItems[tabLinkId]) {
        return enableWhenItems[tabLinkId].isEnabled;
      }

      if (enableWhenExpressions[tabLinkId]) {
        return enableWhenExpressions[tabLinkId].isEnabled;
      }

      return true;
    });
}
