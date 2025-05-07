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

import React, { useMemo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from '../../../utils/mapItem';
import GroupItemSwitcher from '../GroupItem/GroupItemSwitcher';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QrRepeatGroup } from '../../../interfaces/repeatGroup.interface';
import Box from '@mui/material/Box';
import { extendItemPath } from '../../../utils/itemPath';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface SingleNestedItemsProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

function SingleNestedItems(props: SingleNestedItemsProps) {
  const { qItem, qrItem, itemPath, groupCardElevation, parentIsReadOnly, onQrItemChange } = props;

  const qItemsIndexMap: Record<string, number> = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const qItems = qItem.item;
  const qrGroup = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const qrItems = qrGroup.item;

  // Event Handlers
  function handleQrItemChange(newQrItem: QuestionnaireResponseItem, targetItemPath?: ItemPath) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(newQrItem, null, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup, targetItemPath);
  }

  function handleQrRepeatGroupChange(qrRepeatGroup: QrRepeatGroup, targetItemPath?: ItemPath) {
    const updatedQrGroup: QuestionnaireResponseItem = { ...qrGroup };
    updateQrItemsInGroup(null, qrRepeatGroup, updatedQrGroup, qItemsIndexMap);
    onQrItemChange(updatedQrGroup, targetItemPath);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load group, something has gone terribly wrong.</>;
  }

  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  // TODO - Add support for horizontal "row" layout
  return (
    <Box display="flex">
      <Box ml={1.5} />
      <Box flexGrow={1}>
        {qItems.map((qItem: QuestionnaireItem, i) => {
          const qrItemOrItems = qrItemsByIndex[i];

          if (qItem.type === 'display') {
            return null;
          }

          return (
            <GroupItemSwitcher
              key={qItem.linkId}
              qItem={qItem}
              qrItemOrItems={qrItemOrItems}
              itemPath={extendItemPath(itemPath, qItem.linkId)}
              groupCardElevation={groupCardElevation + 1}
              parentIsReadOnly={parentIsReadOnly}
              onQrItemChange={handleQrItemChange}
              onQrRepeatGroupChange={handleQrRepeatGroupChange}
            />
          );
        })}
      </Box>
      <Box mr={2.25}></Box>
    </Box>
  );
}

export default SingleNestedItems;
