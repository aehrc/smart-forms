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

import { useMemo } from 'react';
import { getContextDisplays } from '../utils/tabs';
import type { QuestionnaireItem } from 'fhir/r4';

function useContextDisplayItems(topLevelItems: QuestionnaireItem[]) {
  return useMemo(() => {
    let completedDisplayItemExists = false;

    const allContextDisplayItems = topLevelItems.map((topLevelItem) =>
      getContextDisplays(topLevelItem)
    );

    completedDisplayItemExists = allContextDisplayItems.some((contextDisplayItems) => {
      return contextDisplayItems.some(
        (contextDisplayItem) => contextDisplayItem.text === 'Complete'
      );
    });

    return { allContextDisplayItems, completedDisplayItemExists };
  }, [topLevelItems]);
}

export default useContextDisplayItems;
