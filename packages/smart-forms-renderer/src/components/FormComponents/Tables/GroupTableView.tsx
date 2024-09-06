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
import { QGroupContainerBox } from '../../Box.styles';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { HeaderTableCell } from './Table.styles';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import Divider from '@mui/material/Divider';
import AddRowButton from './AddRowButton';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { GroupTableRowModel } from '../../../interfaces/groupTable.interface';
import GroupTableBody from './GroupTableBody';
import Checkbox from '@mui/material/Checkbox';
import { useQuestionnaireStore } from '../../../stores';

interface GroupTableViewProps
  extends PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qItemsIndexMap: Record<string, number>;
  groupCardElevation: number;
  readOnly: boolean;
  tableRows: GroupTableRowModel[];
  selectedIds: string[];
  itemLabels: string[];
  onAddRow: () => void;
  onRowChange: (newQrRow: QuestionnaireResponseItem, index: number) => void;
  onRemoveRow: (index: number) => void;
  onSelectRow: (nanoId: string) => void;
  onSelectAll: () => void;
  onReorderRows: (newTableRows: GroupTableRowModel[]) => void;
}

function GroupTableView(props: GroupTableViewProps) {
  const {
    qItem,
    qItemsIndexMap,
    groupCardElevation,
    isRepeated,
    readOnly,
    tableRows,
    selectedIds,
    itemLabels,
    showMinimalView,
    parentIsReadOnly,
    onAddRow,
    onRowChange,
    onRemoveRow,
    onSelectRow,
    onSelectAll,
    onReorderRows
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  if (showMinimalView) {
    return (
      <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={false} py={1}>
        <TableContainer component={Paper} elevation={groupCardElevation}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {itemLabels.map((itemLabel) => (
                  <HeaderTableCell key={itemLabel} size="medium">
                    {itemLabel}
                  </HeaderTableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <GroupTableBody
                tableQItem={qItem}
                readOnly={readOnly}
                tableRows={tableRows}
                selectedIds={selectedIds}
                qItemsIndexMap={qItemsIndexMap}
                isRepeated={isRepeated}
                showMinimalView={showMinimalView}
                parentIsReadOnly={parentIsReadOnly}
                onRowChange={onRowChange}
                onRemoveRow={onRemoveRow}
                onSelectRow={onSelectRow}
                onReorderRows={onReorderRows}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </QGroupContainerBox>
    );
  }

  return (
    <QGroupContainerBox
      cardElevation={groupCardElevation}
      isRepeated={false}
      py={3}
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <>
        <Typography fontSize={13} variant="h6" color={readOnly ? 'text.secondary' : 'text.primary'}>
          <LabelWrapper qItem={qItem} readOnly={readOnly} />
        </Typography>
        <Divider sx={{ my: 1 }} light />
      </>
      <TableContainer component={Paper} elevation={groupCardElevation}>
        <Table>
          {isRepeated ? (
            <caption>
              <AddRowButton repeatGroups={tableRows} readOnly={readOnly} onAddItem={onAddRow} />
            </caption>
          ) : null}
          <TableHead>
            <TableRow>
              <HeaderTableCell padding="none" />
              {isRepeated ? (
                <HeaderTableCell padding="none">
                  <Checkbox
                    color="primary"
                    size="small"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < tableRows.length}
                    checked={tableRows.length > 0 && selectedIds.length === tableRows.length}
                    disabled={readOnly}
                    onChange={onSelectAll}
                  />
                </HeaderTableCell>
              ) : null}
              {itemLabels.map((itemLabel) => (
                <HeaderTableCell key={itemLabel}>{itemLabel}</HeaderTableCell>
              ))}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>
          <GroupTableBody
            tableQItem={qItem}
            readOnly={readOnly}
            tableRows={tableRows}
            selectedIds={selectedIds}
            qItemsIndexMap={qItemsIndexMap}
            isRepeated={isRepeated}
            showMinimalView={showMinimalView}
            parentIsReadOnly={parentIsReadOnly}
            onRowChange={onRowChange}
            onRemoveRow={onRemoveRow}
            onSelectRow={onSelectRow}
            onReorderRows={onReorderRows}
          />
        </Table>
      </TableContainer>
    </QGroupContainerBox>
  );
}

export default GroupTableView;
