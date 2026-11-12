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
import { createEmptyQrItem } from '../../../utils/qrItem';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import type { PropsWithParentIsReadOnlyAttribute } from '../../../interfaces/renderProps.interface';
import GroupTableRow from './GroupTableRow';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { getQrGroupTableRowIndexes, reorderRows } from '../../../utils/groupTable';
import TableBody from '@mui/material/TableBody';

interface GroupTableBodyProps extends PropsWithParentIsReadOnlyAttribute {
  tableQItem: QuestionnaireItem;
  readOnly: boolean;
  tableRows: GroupTableRowModel[];
  selectedIds: string[];
  qItemsIndexMap: Record<string, number>;
  visibleItemLabels: string[];
  calculatedColumnWidths: { width: string; isFixed: boolean }[];
  showExtraGTableInteractions: boolean;
  onRowChange: (newQrRow: QuestionnaireResponseItem, index: number) => void;
  onRemoveRow: (index: number) => void;
  onSelectRow: (rowId: string) => void;
  onReorderRows: (newTableRows: GroupTableRowModel[]) => void;
}

function GroupTableBody(props: GroupTableBodyProps) {
  const {
    tableQItem,
    readOnly,
    tableRows,
    selectedIds,
    qItemsIndexMap,
    visibleItemLabels,
    calculatedColumnWidths,
    showExtraGTableInteractions,

    parentIsReadOnly,
    onRowChange,
    onRemoveRow,
    onSelectRow,
    onReorderRows
  } = props;

  // Each row's index within the QuestionnaireResponse, computed once for the whole table rather than
  // re-derived per row, so rendering n rows stays linear.
  const qrRowIndexes = useMemo(
    () => getQrGroupTableRowIndexes(tableRows, selectedIds),
    [tableRows, selectedIds]
  );
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const reorderedRows = reorderRows(tableRows, result.source.index, result.destination.index);

    onReorderRows(reorderedRows);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="gtable_rows" direction="vertical">
        {(droppableProvided, snapshot) => (
          <TableBody ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
            {tableRows.map(({ id, qrItem: nullableQrItem }, index) => {
              const itemIsSelected = selectedIdSet.has(id);
              const answeredQrItem = createEmptyQrItem(tableQItem, undefined);
              if (nullableQrItem) {
                answeredQrItem.item = nullableQrItem.item;
              }

              return (
                <GroupTableRow
                  key={id}
                  index={index}
                  rowId={id}
                  tableQItem={tableQItem}
                  answeredQrItem={answeredQrItem}
                  nullableQrItem={nullableQrItem}
                  readOnly={readOnly}
                  hoverDisabled={snapshot.isDraggingOver}
                  tableRows={tableRows}
                  itemIsSelected={itemIsSelected}
                  qrRowIndex={qrRowIndexes[index]}
                  qItemsIndexMap={qItemsIndexMap}
                  visibleItemLabels={visibleItemLabels}
                  calculatedColumnWidths={calculatedColumnWidths}
                  showExtraGTableInteractions={showExtraGTableInteractions}
                  parentIsReadOnly={parentIsReadOnly}
                  onRowChange={onRowChange}
                  onRemoveRow={onRemoveRow}
                  onSelectRow={onSelectRow}
                />
              );
            })}
            {droppableProvided.placeholder}
          </TableBody>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default GroupTableBody;
