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

import type { QuestionnaireItem } from 'fhir/r4';

/**
 * Resolve duplicate linkIds in a Questionnaire item recursively
 *
 * @param qItem - A group/non-group Questionnaire item
 * @param linkIds - A set of linkIds recorded so far
 * @param duplicateLinkIds - A key-value pair of duplicate linkIds and their respective resolved linkIds
 *
 * @author Sean Fong
 */
export function resolveDuplicateLinkIds(
  qItem: QuestionnaireItem,
  linkIds: Set<string>,
  duplicateLinkIds: Record<string, string>
): QuestionnaireItem | null {
  const items = qItem.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    const resolvedItems: QuestionnaireItem[] = [];
    items.forEach((item) => {
      const resolvedItem = resolveDuplicateLinkIds(item, linkIds, duplicateLinkIds);
      if (resolvedItem) {
        resolvedItems.push(resolvedItem);
        linkIds.add(resolvedItem.linkId);
      } else {
        // Item is not changed, therefore the original item is used
        resolvedItems.push(item);
        linkIds.add(item.linkId);
      }
    });
    qItem.item = resolvedItems;

    if (linkIds.has(qItem.linkId)) {
      const prependedLinkId = assignLinkIdPrefix(qItem.linkId, linkIds);
      duplicateLinkIds[qItem.linkId] = prependedLinkId;
      qItem.linkId = prependedLinkId;
    }
    return qItem;
  }

  // Add linkIdPrefix to linkId if it's a duplicate
  if (linkIds.has(qItem.linkId)) {
    const prependedLinkId = assignLinkIdPrefix(qItem.linkId, linkIds);
    duplicateLinkIds[qItem.linkId] = prependedLinkId;
    qItem.linkId = prependedLinkId;

    return qItem;
  }

  return null;
}

const LINK_ID_PREFIX = 'linkIdPrefix';

/**
 * Prepend a linkId prefix to linkId if it's a duplicate
 *
 * @param itemLinkId - A duplicate linkId to be resolved
 * @param linkIds - A set of linkIds recorded so far
 * @return The resolved duplicate linkId
 *
 * @author Sean Fong
 */
function assignLinkIdPrefix(itemLinkId: string, linkIds: Set<string>): string {
  let prefixedLinkId = LINK_ID_PREFIX + '-' + itemLinkId;

  // Increment prefixCount on linkIdPrefix until it is not a duplicate
  let prefixCount = 0;
  while (linkIds.has(prefixedLinkId)) {
    prefixCount++;
    prefixedLinkId = LINK_ID_PREFIX + '-' + prefixCount.toString() + '-' + itemLinkId;
  }
  return prefixedLinkId;
}
