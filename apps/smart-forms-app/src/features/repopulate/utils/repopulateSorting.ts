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

import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';

export function getRepopulatedItemTuplesByHeadings(
  repopulatedItems: Record<string, ItemToRepopulate>
): {
  linkIds: string[];
  itemsToRepopulateTuplesByHeadings: [string, ItemToRepopulate[]][];
} {
  if (!repopulatedItems) {
    return {
      linkIds: [],
      itemsToRepopulateTuplesByHeadings: []
    };
  }

  const repopulatedItemTuplesByHeadings: Record<string, [string, ItemToRepopulate]> = {};
  for (const [linkId, itemToRepopulate] of Object.entries(repopulatedItems)) {
    const heading = itemToRepopulate.heading;
    if (heading) {
      repopulatedItemTuplesByHeadings[heading] = [linkId, itemToRepopulate];
    }

    repopulatedItemTuplesByHeadings[''] = [linkId, itemToRepopulate];
  }

  const itemsToRepopulateByHeadings = Object.entries(repopulatedItems).reduce(
    (acc: [string, ItemToRepopulate[]][], [, itemToRepopulate]) => {
      const heading = itemToRepopulate.heading ?? '';
      const existingGroup = acc.find(([groupHeading]) => groupHeading === heading);

      if (existingGroup) {
        existingGroup[1].push(itemToRepopulate);
      } else {
        acc.push([heading, [itemToRepopulate]]);
      }

      return acc;
    },
    []
  );

  return {
    linkIds: Object.keys(repopulatedItems),
    itemsToRepopulateTuplesByHeadings: itemsToRepopulateByHeadings
  };
}

export function filterCheckedItemsToRepopulate(
  itemsToRepopulate: Record<string, ItemToRepopulate>,
  checkedLinkIds: string[]
): Record<string, ItemToRepopulate> {
  return Object.keys(itemsToRepopulate)
    .filter((linkId) => checkedLinkIds.includes(linkId))
    .reduce((acc: Record<string, ItemToRepopulate>, linkId) => {
      acc[linkId] = itemsToRepopulate[linkId];
      return acc;
    }, {});
}
