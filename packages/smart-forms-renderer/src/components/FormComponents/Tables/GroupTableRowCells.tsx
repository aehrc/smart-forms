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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import { getQrItemsIndex } from '../../../utils/mapItem';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { extendItemPath } from '../../../utils/itemPath';
import type { ItemPath } from '../../../interfaces/itemPath.interface';
import { SingleItem } from '../SingleItem';
import { StandardTableCell } from './Table.styles';
import Box from '@mui/material/Box';

interface GroupTableRowCellsProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  qItemsIndexMap: Record<string, number>;
  visibleItemLabels: string[];
}

function GroupTableRowCells(props: GroupTableRowCellsProps) {
  const {
    qItem,
    qrItem,
    qItemsIndexMap,
    visibleItemLabels,
    itemPath,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const rowItems = qItem.item;
  const row = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const rowQrItems = row.item;

  if (!rowItems || !rowQrItems) {
    return null;
  }

  function handleQrRowItemChange(
    newQrRowItem: QuestionnaireResponseItem,
    targetItemPath?: ItemPath
  ) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateQrItemsInGroup(newQrRowItem, null, qrRow, qItemsIndexMap);
    onQrItemChange(qrRow, targetItemPath);
  }

  const qrItemsByIndex = getQrItemsIndex(rowItems, rowQrItems, qItemsIndexMap);

  return (
    <>
      {rowItems.map((rowItem, index) => {
        const qrItem = qrItemsByIndex[index];

        // Something went wrong here
        if (Array.isArray(qrItem)) {
          return null;
        }

        // If the cell is not visible, skip rendering it
        if (!visibleItemLabels.includes(rowItem.text ?? '')) {
          return null;
        }

        return (
          <StandardTableCell key={index} numOfColumns={visibleItemLabels.length}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <SingleItem
                key={rowItem.linkId}
                qItem={rowItem}
                qrItem={qrItem ?? null}
                itemPath={extendItemPath(itemPath, rowItem.linkId)}
                isRepeated={true}
                isTabled={true}
                groupCardElevation={1}
                showMinimalView={true}
                parentIsReadOnly={parentIsReadOnly}
                onQrItemChange={handleQrRowItemChange}
              />
            </Box>
          </StandardTableCell>
        );
      })}
    </>
  );
}

export default GroupTableRowCells;
