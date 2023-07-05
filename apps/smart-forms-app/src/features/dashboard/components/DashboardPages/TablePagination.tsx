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

import { Box, Fade, TablePagination as MuiTablePagination, Typography } from '@mui/material';

interface TablePaginationProps {
  isFetching: boolean;
  numOfItems: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}

function TablePagination(props: TablePaginationProps) {
  const { isFetching, numOfItems, page, rowsPerPage, setPage, setRowsPerPage } = props;

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Fade in={isFetching}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ p: 2 }}>
          Updating...
        </Typography>
      </Fade>
      <MuiTablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={numOfItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value));
          setPage(0);
        }}
      />
    </Box>
  );
}

export default TablePagination;
