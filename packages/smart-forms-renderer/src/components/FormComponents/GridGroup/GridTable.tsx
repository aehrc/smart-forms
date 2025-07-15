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

import React, { useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { HeaderTableCell } from '../Tables/Table.styles';
import GridRow from './GridRow';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex } from '../../../utils/mapItem';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithParentStylesAttribute
} from '../../../interfaces/renderProps.interface';
import { extendItemPath } from '../../../utils/itemPath';
import { default as parseStyleToJs } from 'style-to-js';

interface GridTableProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentStylesAttribute {
  qItems: QuestionnaireItem[];
  qrItems: QuestionnaireResponseItem[];
  qItemsIndexMap: Record<string, number>;
  columnHeaders: {
    label: string;
    styleString: string | null;
  }[];
}

function GridTable(props: GridTableProps) {
  const {
    qItems,
    qrItems,
    qItemsIndexMap,
    columnHeaders,
    itemPath,
    parentIsReadOnly,
    parentStyles,
    onQrItemChange
  } = props;

  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, qItemsIndexMap);

  const columnHeaderLabels = useMemo(
    () => columnHeaders.map(({ label }) => label),
    [columnHeaders]
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <HeaderTableCell />
          {/* Render column headers (with combined styles) */}
          {columnHeaders.map(({ label, styleString }) => {
            // Add default textAlign center style to all grid headers
            const defaultStyle: React.CSSProperties = {
              textAlign: 'center'
            };

            const itemStyles = styleString ? parseStyleToJs(styleString) : {};
            const combinedStyle = {
              ...defaultStyle,
              ...parentStyles,
              ...itemStyles
            };

            return (
              <HeaderTableCell key={label} size="medium" style={combinedStyle}>
                {label}
              </HeaderTableCell>
            );
          })}
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
                qrItem={qrItem ?? null}
                columnHeaderLabels={columnHeaderLabels}
                itemPath={extendItemPath(itemPath, qItem.linkId)}
                parentIsReadOnly={parentIsReadOnly}
                parentStyles={parentStyles}
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
