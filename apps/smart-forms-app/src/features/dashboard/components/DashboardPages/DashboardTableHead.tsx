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

import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import type { Header, SortDirection } from '@tanstack/react-table';

interface DashboardTableHeadProps<T> {
  headers: Header<T, unknown>[];
}

function DashboardTableHead<T>(props: DashboardTableHeadProps<T>) {
  const { headers } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />
        {headers.map((header) => {
          const label = (header.column.columnDef.header ?? '') as string;
          const sortValue = header.column.getIsSorted() as SortDirection | false;

          return (
            <TableCell key={header.id} sortDirection={sortValue}>
              <TableSortLabel
                active={typeof sortValue === 'string'}
                direction={typeof sortValue === 'string' ? sortValue : undefined}
                onClick={header.column.getToggleSortingHandler()}>
                {label}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

export default DashboardTableHead;
