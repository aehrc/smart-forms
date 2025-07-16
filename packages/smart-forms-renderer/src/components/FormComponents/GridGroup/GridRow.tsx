/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import { GridAnswerTableCell, GridTextTableCell } from '../Tables/Table.styles';
import SingleItem from '../SingleItem/SingleItem';
import { getQrItemsIndex, mapQItemsIndex } from '../../../utils/mapItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useHidden from '../../../hooks/useHidden';
import { extendItemPath } from '../../../utils/itemPath';
import type { ItemPath } from '../../../interfaces/itemPath.interface';
import { getItemTextToDisplay } from '../../../utils/itemText';

interface GridRowProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  columnHeaderLabels: string[];
}

function GridRow(props: GridRowProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    columnHeaderLabels,
    parentIsReadOnly,
    parentStyles,
    onQrItemChange
  } = props;

  const rowQItems = qItem.item;
  const row = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const rowQrItems = row.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  if (!rowQItems || !rowQrItems || rowQItems.length === 0) {
    return null;
  }

  // Add textAlign center style to all grid cells and pass it as parentStyles to the next item
  const gridCellStyles = { ...parentStyles, textAlign: 'center' };

  function handleQrRowItemChange(
    newQrRowItem: QuestionnaireResponseItem,
    targetItemPath?: ItemPath
  ) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateQrItemsInGroup(newQrRowItem, null, qrRow, qItemsIndexMap);
    onQrItemChange(qrRow, targetItemPath);
  }

  const qrItemsByIndex = getQrItemsIndex(rowQItems, rowQrItems, qItemsIndexMap);

  const numOfColumns = columnHeaderLabels.length;

  // Get item.text as display label
  const itemTextToDisplay = getItemTextToDisplay(qItem);

  return (
    <>
      <GridTextTableCell>
        <Typography component="span" fontWeight="bold">
          {itemTextToDisplay}
        </Typography>
      </GridTextTableCell>
      {columnHeaderLabels.map((label, colIndex) => {
        // Find the QuestionnaireItem in this row that matches the current column label
        const matchingCellQItemIndex = rowQItems.findIndex((item) => item.text === label);

        // Render empty cell for sparsity
        if (matchingCellQItemIndex === -1) {
          return <GridAnswerTableCell key={colIndex} numOfColumns={numOfColumns} />;
        }

        const cellQItem = rowQItems[matchingCellQItemIndex];
        const cellQrItem = qrItemsByIndex[matchingCellQItemIndex];

        if (Array.isArray(cellQrItem)) {
          return null;
        }

        return (
          <GridAnswerTableCell key={colIndex} numOfColumns={numOfColumns}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <SingleItem
                qItem={cellQItem}
                qrItem={cellQrItem ?? null}
                itemPath={extendItemPath(itemPath, cellQItem.linkId)}
                isRepeated={true}
                isTabled={true}
                groupCardElevation={1}
                parentIsReadOnly={parentIsReadOnly}
                parentStyles={gridCellStyles}
                onQrItemChange={handleQrRowItemChange}
              />
            </Box>
          </GridAnswerTableCell>
        );
      })}
    </>
  );
}

export default GridRow;
