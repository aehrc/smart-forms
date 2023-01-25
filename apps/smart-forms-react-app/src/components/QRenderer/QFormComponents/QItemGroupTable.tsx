import React, { useEffect, useState } from 'react';

import {
  PropsWithQrRepeatGroupChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { createQrItem } from '../../../functions/QrItemFunctions';
import { Add, Delete } from '@mui/icons-material';
import { RepeatDeleteTooltip } from './QItemRepeat.styles';
import { isHidden } from '../../../functions/QItemFunctions';
import QItemGroupTableRow from './QItemGroupTableRow';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';

interface Props extends PropsWithQrRepeatGroupChangeHandler, PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
}

function QItemGroupTable(props: Props) {
  const { qItem, qrItems, onQrRepeatGroupChange } = props;

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

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

  return (
    <>
      <Typography sx={{ mb: 1.5 }}>{qItem.text}</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <caption>
            <Stack direction="row" justifyContent="end">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setTableRows([...tableRows, undefined])}>
                Add Row
              </Button>
            </Stack>
          </caption>
          <TableHead>
            <TableRow>
              {itemLabels.map((itemLabel) => (
                <TableCell key={itemLabel}>{itemLabel}</TableCell>
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
                  <TableCell>
                    <RepeatDeleteTooltip className="repeat-group-delete" title="Delete item">
                      <span>
                        <IconButton size="small" color="error" onClick={() => deleteRow(index)}>
                          <Delete />
                        </IconButton>
                      </span>
                    </RepeatDeleteTooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default QItemGroupTable;
