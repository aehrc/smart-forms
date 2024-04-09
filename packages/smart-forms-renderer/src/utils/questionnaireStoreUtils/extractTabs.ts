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

import { constructTabsWithProperties, isTabContainer } from '../tabs';
import type { Questionnaire } from 'fhir/r4';
import type { Tabs } from '../../interfaces/tab.interface';

export function extractTabs(questionnaire: Questionnaire): Tabs {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  let totalTabs = {};
  for (const topLevelItem of questionnaire.item) {
    const items = topLevelItem.item;
    const topLevelItemIsTabContainer = isTabContainer(topLevelItem);

    const tabs = constructTabsWithProperties(items, topLevelItemIsTabContainer);
    totalTabs = { ...totalTabs, ...tabs };
  }

  return totalTabs;
}
