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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { PropsWithQrItemChangeHandler } from '../../../../types/renderProps.interface.ts';
import { createQrGroup, updateLinkedItem } from '../../../../utils/qrItem.ts';
import { GridAnswerTableCell, GridTextTableCell } from '../Tables/Table.styles.tsx';
import SingleItem from '../SingleItem/SingleItem.tsx';
import { getQrItemsIndex, mapQItemsIndex } from '../../../../utils';
import { Typography } from '@mui/material';
import { useMemo } from 'react';

interface GridRowProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  columnLabels: string[];
  numOfColumns: number;
}

function GridRow(props: GridRowProps) {
  const { qItem, qrItem, columnLabels, numOfColumns, onQrItemChange } = props;

  const rowQItems = qItem.item;
  const row = qrItem && qrItem.item ? qrItem : createQrGroup(qItem);
  const rowQrItems = row.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  if (!rowQItems || !rowQrItems) {
    return null;
  }

  function handleQrRowItemChange(newQrRowItem: QuestionnaireResponseItem) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateLinkedItem(newQrRowItem, null, qrRow, qItemsIndexMap);
    onQrItemChange(qrRow);
  }

  const qrItemsByIndex = getQrItemsIndex(rowQItems, rowQrItems, qItemsIndexMap);

  return (
    <>
      <GridTextTableCell>
        <Typography fontWeight="bold">{qItem.text}</Typography>
      </GridTextTableCell>
      {rowQItems.map((cellQItem, index) => {
        const cellQrItem = qrItemsByIndex[index];

        // Don't render cell if column label does not match - "sparse-ness" of grid
        if (columnLabels[index] !== cellQItem.text) {
          return null;
        }

        if (Array.isArray(cellQrItem)) {
          return null;
        }

        return (
          <GridAnswerTableCell key={index} numOfColumns={numOfColumns}>
            <SingleItem
              qItem={cellQItem}
              qrItem={cellQrItem}
              isRepeated={true}
              isTabled={true}
              onQrItemChange={handleQrRowItemChange}
            />
          </GridAnswerTableCell>
        );
      })}
    </>
  );
}

export default GridRow;
