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

import type { TableAttributes } from '../../../renderer/types/table.interface.ts';
import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

interface DashboardTableHeadProps<T> {
  order: 'asc' | 'desc';
  orderBy: string;
  headLabel: TableAttributes[];
  onSort: (event: MouseEvent, property: keyof T) => void;
}

function DashboardTableHead<T>(props: DashboardTableHeadProps<T>) {
  const { order, orderBy, headLabel, onSort } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={(event) => onSort(event as unknown as MouseEvent, headCell.id as keyof T)}>
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default DashboardTableHead;
