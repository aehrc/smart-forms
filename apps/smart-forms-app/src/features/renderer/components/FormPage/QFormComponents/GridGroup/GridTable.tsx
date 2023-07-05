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

import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { HeaderTableCell } from '../Tables/Table.styles.tsx';
import GridRow from './GridRow.tsx';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex } from '../../../../utils';
import type { PropsWithQrItemChangeHandler } from '../../../../types/renderProps.interface.ts';

interface GridTableProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItems: QuestionnaireItem[];
  qrItems: QuestionnaireResponseItem[];
  qItemsIndexMap: Record<string, number>;
  columnLabels: string[];
}

function GridTable(props: GridTableProps) {
  const { qItems, qrItems, qItemsIndexMap, columnLabels, onQrItemChange } = props;

  const qrItemsByIndex: (QuestionnaireResponseItem | QuestionnaireResponseItem[])[] =
    getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  const numOfColumns = columnLabels.length;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <HeaderTableCell />
          {columnLabels.map((label) => (
            <HeaderTableCell key={label}>{label}</HeaderTableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {qItems.map((qItem, index) => {
          const qrItem = qrItemsByIndex[index];

          if (Array.isArray(qrItem)) {
            return null;
          }

          return (
            <TableRow key={qItem.linkId}>
              <GridRow
                qItem={qItem}
                qrItem={qrItem}
                columnLabels={columnLabels}
                numOfColumns={numOfColumns}
                onQrItemChange={onQrItemChange}
              />
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default GridTable;
