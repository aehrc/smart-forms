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

import React from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute
} from '../../../interfaces/renderProps.interface';
import type { TableRowProps } from '@mui/material/TableRow';
import TableRow from '@mui/material/TableRow';
import SelectRowButton from './SelectRowButton';
import GroupTableRowCells from './GroupTableRowCells';
import RemoveRowButton from './RemoveRowButton';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import DragIndicator from '@mui/icons-material/DragIndicator';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import { Draggable } from 'react-beautiful-dnd';
import { StyledGroupTableRow } from './Table.styles';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface GroupTableRowProps
  extends PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute,
    TableRowProps {
  rowId: string;
  index: number;
  tableQItem: QuestionnaireItem;
  answeredQrItem: QuestionnaireResponseItem;
  nullableQrItem: QuestionnaireResponseItem | null;
  readOnly: boolean;
  hoverDisabled: boolean;
  tableRows: GroupTableRowModel[];
  itemIsSelected: boolean;
  selectedIds: string[];
  qItemsIndexMap: Record<string, number>;
  visibleItemLabels: string[];
  showExtraGTableInteractions: boolean;
  onRowChange: (
    newQrRow: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) => void;
  onRemoveRow: (index: number) => void;
  onSelectRow: (nanoId: string) => void;
}

function GroupTableRow(props: GroupTableRowProps) {
  const {
    rowId,
    index,
    tableQItem,
    answeredQrItem,
    nullableQrItem,
    readOnly,
    hoverDisabled,
    tableRows,
    itemIsSelected,
    qItemsIndexMap,
    visibleItemLabels,
    showExtraGTableInteractions,
    itemPath,
    onRowChange,
    onRemoveRow,
    onSelectRow
  } = props;

  if (showExtraGTableInteractions) {
    return (
      <Draggable draggableId={rowId} index={index}>
        {(draggableProvided, snapshot) => (
          <StyledGroupTableRow
            itemIsDragged={snapshot.isDragging}
            itemIsSelected={itemIsSelected}
            hoverDisabled={hoverDisabled}
            hover={!hoverDisabled}
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}>
            <>
              <TableCell padding="none">
                <Box
                  aria-label="Drag row"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  {...(readOnly ? {} : draggableProvided.dragHandleProps)}>
                  <DragIndicator
                    fontSize="small"
                    sx={{ color: readOnly ? 'text.disabled' : 'inherit' }}
                  />
                </Box>
              </TableCell>
              <SelectRowButton
                qItem={tableQItem}
                isChecked={itemIsSelected}
                readOnly={readOnly}
                onSelectItem={() => onSelectRow(rowId)}
              />
            </>
            <GroupTableRowCells
              qItem={tableQItem}
              qrItem={answeredQrItem}
              qItemsIndexMap={qItemsIndexMap}
              visibleItemLabels={visibleItemLabels}
              itemPath={itemPath}
              parentIsReadOnly={readOnly}
              onQrItemChange={(newQrGroup) => onRowChange(newQrGroup, index)}
            />
            <RemoveRowButton
              nullableQrItem={nullableQrItem}
              numOfRows={tableRows.length}
              readOnly={readOnly}
              onRemoveItem={() => onRemoveRow(index)}
            />
          </StyledGroupTableRow>
        )}
      </Draggable>
    );
  }

  return (
    <TableRow>
      <TableCell padding="checkbox" />
      <GroupTableRowCells
        qItem={tableQItem}
        qrItem={answeredQrItem}
        qItemsIndexMap={qItemsIndexMap}
        visibleItemLabels={visibleItemLabels}
        itemPath={itemPath}
        parentIsReadOnly={readOnly}
        onQrItemChange={(newQrGroup) => onRowChange(newQrGroup, index)}
      />
      <TableCell padding="checkbox" />
    </TableRow>
  );
}

export default GroupTableRow;
