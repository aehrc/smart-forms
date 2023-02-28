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

import React, { useEffect, useMemo, useState } from 'react';

import { PropsWithQrRepeatGroupChangeHandler } from '../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import { createEmptyQrItem } from '../../../functions/QrItemFunctions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import QItemGroupTableRow from './QItemGroupTableRow';
import { DeleteButtonTableCell, HeaderTableCell } from '../../StyledComponents/Table.styles';
import QItemLabel from './QItemParts/QItemLabel';
import { QGroupContainerBox } from '../../StyledComponents/Boxes.styles';

interface Props extends PropsWithQrRepeatGroupChangeHandler {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function QItemGroupTable(props: Props) {
  const { qItem, qrItems, groupCardElevation, onQrRepeatGroupChange } = props;

  const emptyQrItem = createEmptyQrItem(qItem);
  const qrGroupTableRows: (QuestionnaireResponseItem | undefined)[] =
    qrItems.length > 0 ? qrItems : [undefined];

  const [tableRows, setTableRows] = useState(qrGroupTableRows);

  useEffect(() => {
    setTableRows(qrGroupTableRows);
  }, [qrItems]);

  // Generate item labels as table headers
  const itemLabels: string[] = useMemo(
    () => qItem.item?.map((item) => (item.text ? item.text : '')) ?? [],
    [qItem.item]
  );

  // Check if there are columns within the group table
  if (!qItem.item || qItem.item.length === 0) return null;

  // Event Handlers
  function handleRowsChange(newQrRow: QuestionnaireResponseItem, index: number) {
    const newQrRowItems = newQrRow.item;
    const rowsTemp = [...tableRows];

    if (newQrRow.item) {
      rowsTemp[index] = {
        linkId: newQrRow.linkId,
        text: newQrRow.text,
        item: newQrRowItems
      };
    }
    updateRows(rowsTemp);
  }

  function deleteRow(index: number) {
    const rowsTemp = [...tableRows];
    if (rowsTemp.length === 1) {
      rowsTemp[0] = undefined;
    } else {
      rowsTemp.splice(index, 1);
    }
    updateRows(rowsTemp);
  }

  function updateRows(updatedRows: (QuestionnaireResponseItem | undefined)[]) {
    setTableRows([...updatedRows]);

    const rowsWithValues = updatedRows.flatMap((singleRow) => (singleRow ? [singleRow] : []));
    onQrRepeatGroupChange({ linkId: qItem.linkId, qrItems: rowsWithValues });
  }

  return (
    <QGroupContainerBox key={qItem.linkId} cardElevation={groupCardElevation} isRepeated={false}>
      <Box sx={{ my: 3.5 }}>
        <Typography fontSize={13} variant="h6">
          <QItemLabel qItem={qItem} />
        </Typography>
        <Divider sx={{ my: 1 }} light />
        <TableContainer component={Paper} elevation={groupCardElevation}>
          <Table>
            <caption>
              <Stack direction="row" justifyContent="end">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setTableRows([...tableRows, undefined])}>
                  Add Row
                </Button>
              </Stack>
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
              {tableRows.map((row, index) => {
                const singleQrRow: QuestionnaireResponseItem = row
                  ? { ...emptyQrItem, item: row.item }
                  : { ...emptyQrItem };
                return (
                  <TableRow key={index}>
                    <QItemGroupTableRow
                      qItem={qItem}
                      qrItem={singleQrRow}
                      onQrItemChange={(newQrGroup) => handleRowsChange(newQrGroup, index)}
                    />
                    <DeleteButtonTableCell>
                      <Tooltip title="Delete item">
                        <span>
                          <IconButton size="small" color="error" onClick={() => deleteRow(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </DeleteButtonTableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </QGroupContainerBox>
  );
}

export default QItemGroupTable;
