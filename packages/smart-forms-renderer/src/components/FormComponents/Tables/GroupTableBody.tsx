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
import { createEmptyQrItem } from '../../../utils/qrItem';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import GroupTableRow from './GroupTableRow';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { reorderRows } from '../../../utils/groupTable';
import TableBody from '@mui/material/TableBody';

interface GroupTableBodyProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithShowMinimalViewAttribute {
  tableQItem: QuestionnaireItem;
  readOnly: boolean;
  tableRows: GroupTableRowModel[];
  selectedIds: string[];
  qItemsIndexMap: Record<string, number>;
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
    isRepeated,
    showMinimalView,
    parentIsReadOnly,
    onRowChange,
    onRemoveRow,
    onSelectRow,
    onReorderRows
  } = props;

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
              const itemIsSelected = selectedIds.indexOf(id) !== -1;
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
                  isRepeated={isRepeated}
                  hoverDisabled={snapshot.isDraggingOver}
                  tableRows={tableRows}
                  itemIsSelected={itemIsSelected}
                  selectedIds={selectedIds}
                  qItemsIndexMap={qItemsIndexMap}
                  showMinimalView={showMinimalView}
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
