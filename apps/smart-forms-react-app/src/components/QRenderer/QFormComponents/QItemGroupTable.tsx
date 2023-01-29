import React, { useContext, useEffect, useState } from 'react';

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
import { createQrItem } from '../../../functions/QrItemFunctions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { isHidden } from '../../../functions/QItemFunctions';
import QItemGroupTableRow from './QItemGroupTableRow';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';
import { DeleteButtonTableCell, HeaderTableCell } from '../../StyledComponents/Table.styles';
import QItemLabel from './QItemParts/QItemLabel';

interface Props extends PropsWithQrRepeatGroupChangeHandler {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function QItemGroupTable(props: Props) {
  const { qItem, qrItems, groupCardElevation, onQrRepeatGroupChange } = props;

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  const cleanQrItem = createQrItem(qItem);
  const qrGroupTableRows: (QuestionnaireResponseItem | undefined)[] =
    qrItems.length > 0 ? qrItems : [undefined];

  const [tableRows, setTableRows] = useState(qrGroupTableRows);

  useEffect(() => {
    setTableRows(qrGroupTableRows);
  }, [qrItems]);

  // Check if there are columns within the group table
  if (!qItem.item || qItem.item.length === 0) return null;

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

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

  // Generate item labels as table headers
  const itemLabels: string[] = qItem.item.map((item) => (item.text ? item.text : ''));

  // TODO instead of using formcontrol, use a box instead of all
  // TODO pass a table param to all and just fill whole thing
  return (
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
                ? { ...cleanQrItem, item: row.item }
                : { ...cleanQrItem };
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
  );
}

export default QItemGroupTable;
