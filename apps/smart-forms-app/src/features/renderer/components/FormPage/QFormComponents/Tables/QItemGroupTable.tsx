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

import { useMemo, useState } from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import {
  Button,
  Divider,
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
import AddIcon from '@mui/icons-material/Add';
import QItemGroupTableRow from './QItemGroupTableRow.tsx';
import { HeaderTableCell } from './Table.styles.tsx';
import LabelText from '../QItemParts/LabelText.tsx';
import { QGroupContainerBox } from '../../../../../../components/Box/Box.styles.tsx';
import { mapQItemsIndex } from '../../../../utils';
import type { PropsWithQrRepeatGroupChangeHandler } from '../../../../types/renderProps.interface.ts';
import useInitialiseGroupTable from '../../../../hooks/useInitialiseGroupTable.ts';
import { nanoid } from 'nanoid';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import DeleteRowButton from './DeleteRowButton.tsx';

interface Props extends PropsWithQrRepeatGroupChangeHandler {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function QItemGroupTable(props: Props) {
  const { qItem, qrItems, groupCardElevation, onQrRepeatGroupChange } = props;

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
      qrItems: updatedTableRows.flatMap((singleRow) => (singleRow.qrItem ? [singleRow.qrItem] : []))
    });
  }

  function handleDeleteRow(index: number) {
    const updatedTableRows = [...tableRows];

    updatedTableRows.splice(index, 1);

    setTableRows(updatedTableRows);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedTableRows.flatMap((singleRow) => (singleRow.qrItem ? [singleRow.qrItem] : []))
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

  return (
    <QGroupContainerBox cardElevation={groupCardElevation} isRepeated={false} py={3}>
      <Typography fontSize={13} variant="h6">
        <LabelText qItem={qItem} />
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
                onClick={handleAddRow}>
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
            {tableRows.map(({ nanoId, qrItem: nullableQrItem }, index) => {
              const answeredQrItem = createEmptyQrItem(qItem);
              if (nullableQrItem) {
                answeredQrItem.item = nullableQrItem.item;
              }

              console.log('----');
              console.log(qItem);
              console.log(answeredQrItem);
              console.log('----');

              return (
                <TableRow key={nanoId}>
                  <QItemGroupTableRow
                    qItem={qItem}
                    qrItem={answeredQrItem}
                    qItemsIndexMap={qItemsIndexMap}
                    onQrItemChange={(newQrGroup) => handleRowChange(newQrGroup, index)}
                  />
                  <DeleteRowButton
                    nullableQrItem={nullableQrItem}
                    numOfRows={tableRows.length}
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

export default QItemGroupTable;
