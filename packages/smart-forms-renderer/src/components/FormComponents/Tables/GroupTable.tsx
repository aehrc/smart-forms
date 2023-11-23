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

import React, { useMemo, useState } from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import GroupTableRow from './GroupTableRow';
import { HeaderTableCell } from './Table.styles';
import { QGroupContainerBox } from '../../Box.styles';
import { mapQItemsIndex } from '../../../utils/mapItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrRepeatGroupChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import useInitialiseGroupTable from '../../../hooks/useInitialiseGroupTable';
import { nanoid } from 'nanoid';
import { createEmptyQrItem } from '../../../utils/qrItem';
import RemoveRowButton from './RemoveRowButton';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import cloneDeep from 'lodash.clonedeep';
import AddRowButton from './AddRowButton';
import useReadOnly from '../../../hooks/useReadOnly';

interface GroupTableProps
  extends PropsWithQrRepeatGroupChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function GroupTable(props: GroupTableProps) {
  const {
    qItem,
    qrItems,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    onQrRepeatGroupChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const initialisedGroupTables = useInitialiseGroupTable(qrItems);

  const [tableRows, setTableRows] = useState(initialisedGroupTables);

  // Generate item labels as table headers
  const qItems = qItem.item;
  const itemLabels: string[] = useMemo(
    () => qItems?.map((item) => item.text ?? '') ?? [],
    [qItems]
  );

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(qItem), [qItem]);

  // Check if there are columns within the group table
  if (!qItems || qItems.length === 0) {
    return null;
  }

  // Event Handlers
  function handleRowChange(newQrRow: QuestionnaireResponseItem, index: number) {
    const updatedTableRows = [...tableRows];

    if (newQrRow.item) {
      updatedTableRows[index].qrItem = {
        linkId: newQrRow.linkId,
        text: newQrRow.text,
        item: newQrRow.item
      };
    }

    setTableRows(updatedTableRows);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedTableRows.flatMap((singleRow) =>
        singleRow.qrItem ? [cloneDeep(singleRow.qrItem)] : []
      )
    });
  }

  function handleDeleteRow(index: number) {
    const updatedTableRows = [...tableRows];

    updatedTableRows.splice(index, 1);

    setTableRows(updatedTableRows);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedTableRows.flatMap((singleRow) =>
        singleRow.qrItem ? [cloneDeep(singleRow.qrItem)] : []
      )
    });
  }

  function handleAddRow() {
    setTableRows([
      ...tableRows,
      {
        nanoId: nanoid(),
        qrItem: null
      }
    ]);
  }

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
              {tableRows.map(({ nanoId, qrItem: nullableQrItem }, index) => {
                const answeredQrItem = createEmptyQrItem(qItem);
                if (nullableQrItem) {
                  answeredQrItem.item = nullableQrItem.item;
                }

                return (
                  <TableRow key={nanoId}>
                    <GroupTableRow
                      qItem={qItem}
                      qrItem={answeredQrItem}
                      qItemsIndexMap={qItemsIndexMap}
                      parentIsReadOnly={parentIsReadOnly}
                      onQrItemChange={(newQrGroup) => handleRowChange(newQrGroup, index)}
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </QGroupContainerBox>
    );
  }

  return (
    <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={false} py={3}>
      {groupCardElevation !== 1 ? (
        <>
          <Typography
            fontSize={13}
            variant="h6"
            color={readOnly ? 'text.secondary' : 'text.primary'}>
            <LabelWrapper qItem={qItem} readOnly={readOnly} />
          </Typography>
          <Divider sx={{ my: 1 }} light />
        </>
      ) : null}
      <TableContainer component={Paper} elevation={groupCardElevation}>
        <Table>
          <caption>
            <AddRowButton repeatGroups={tableRows} readOnly={readOnly} onAddItem={handleAddRow} />
          </caption>
          <TableHead>
            <TableRow>
              {itemLabels.map((itemLabel) => (
                <HeaderTableCell key={itemLabel}>{itemLabel}</HeaderTableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map(({ nanoId, qrItem: nullableQrItem }, index) => {
              const answeredQrItem = createEmptyQrItem(qItem);
              if (nullableQrItem) {
                answeredQrItem.item = nullableQrItem.item;
              }

              return (
                <TableRow key={nanoId}>
                  <GroupTableRow
                    qItem={qItem}
                    qrItem={answeredQrItem}
                    qItemsIndexMap={qItemsIndexMap}
                    parentIsReadOnly={parentIsReadOnly}
                    onQrItemChange={(newQrGroup) => handleRowChange(newQrGroup, index)}
                  />
                  <RemoveRowButton
                    nullableQrItem={nullableQrItem}
                    numOfRows={tableRows.length}
                    readOnly={readOnly}
                    onDeleteItem={() => handleDeleteRow(index)}
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </QGroupContainerBox>
  );
}

export default GroupTable;
