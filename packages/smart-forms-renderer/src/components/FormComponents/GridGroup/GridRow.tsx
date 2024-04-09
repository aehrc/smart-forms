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
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../../utils/qrItem';
import { GridAnswerTableCell, GridTextTableCell } from '../Tables/Table.styles';
import SingleItem from '../SingleItem/SingleItem';
import { getQrItemsIndex, mapQItemsIndex } from '../../../utils/mapItem';
import Typography from '@mui/material/Typography';
import useHidden from '../../../hooks/useHidden';

interface GridRowProps extends PropsWithQrItemChangeHandler, PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  columnLabels: string[];
  numOfColumns: number;
}

function GridRow(props: GridRowProps) {
  const { qItem, qrItem, columnLabels, numOfColumns, parentIsReadOnly, onQrItemChange } = props;

  const rowQItems = qItem.item;
  const row = qrItem && qrItem.item ? qrItem : createEmptyQrGroup(qItem);
  const rowQrItems = row.item;

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  if (!rowQItems || !rowQrItems) {
    return null;
  }

  function handleQrRowItemChange(newQrRowItem: QuestionnaireResponseItem) {
    const qrRow: QuestionnaireResponseItem = { ...row };
    updateQrItemsInGroup(newQrRowItem, null, qrRow, qItemsIndexMap);
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
              qrItem={cellQrItem ?? null}
              isRepeated={true}
              isTabled={true}
              groupCardElevation={1}
              showMinimalView={true}
              parentIsReadOnly={parentIsReadOnly}
              onQrItemChange={handleQrRowItemChange}
            />
          </GridAnswerTableCell>
        );
      })}
    </>
  );
}

export default GridRow;
