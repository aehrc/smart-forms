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

import { Box, TablePagination } from '@mui/material';
import type { Table } from '@tanstack/react-table';
import type { ReactNode } from 'react';

interface DashboardTablePaginationProps<T> {
  table: Table<T>;
  children: ReactNode;
}

function DashboardTablePagination<T>(props: DashboardTablePaginationProps<T>) {
  const { table, children } = props;

  const { pageSize, pageIndex } = table.getState().pagination;
  const totalNumberOfItems = table.getRowCount();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {children}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, { label: 'All', value: totalNumberOfItems }]}
        component="div"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        data-test="dashboard-table-pagination"
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(event) => {
          const size = parseInt(event.target.value, 10);
          table.setPageSize(size);
        }}
      />
    </Box>
  );
}

export default DashboardTablePagination;
