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

import { useContext } from 'react';
import { Fade, Table as MuiTable, TableBody, TableContainer, Typography } from '@mui/material';
import Scrollbar from '../../../../../components/Scrollbar/Scrollbar.tsx';
import QuestionnaireListToolbar from './TableComponents/QuestionnaireListToolbar.tsx';
import QuestionnaireListFeedback from './TableComponents/QuestionnaireListFeedback.tsx';
import { SelectedQuestionnaireContext } from '../../../contexts/SelectedQuestionnaireContext.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import DashboardTableHead from '../DashboardTableHead.tsx';
import type { QuestionnaireListItem } from '../../../types/list.interface.ts';
import type { Table } from '@tanstack/react-table';
import QuestionnaireTableRow from './TableComponents/QuestionnaireTableRow.tsx';

interface QuestionnaireTableProps {
  table: Table<QuestionnaireListItem>;
  searchInput: string;
  debouncedInput: string;
  fetchStatus: 'error' | 'success' | 'loading';
  isInitialLoading: boolean;
  isFetching: boolean;
  fetchError: unknown;
  onSearch: (input: string) => void;
  onRowClick: (id: string) => void;
}

function QuestionnaireTable(props: QuestionnaireTableProps) {
  const {
    table,
    searchInput,
    debouncedInput,
    fetchStatus,
    isInitialLoading,
    isFetching,
    fetchError,
    onSearch,
    onRowClick
  } = props;

  const { selectedQuestionnaire, setSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );

  const headers = table.getHeaderGroups()[0].headers;

  const isEmpty =
    table.getRowModel().rows.length === 0 && !!debouncedInput && fetchStatus !== 'loading';

  return (
    <>
      <QuestionnaireListToolbar
        selected={selectedQuestionnaire?.listItem}
        searchInput={searchInput}
        onClearSelection={() => setSelectedQuestionnaire(null)}
        onSearch={onSearch}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 600 }}>
          <MuiTable>
            <DashboardTableHead headers={headers} />
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const rowData = row.original;
                const isSelected = selectedQuestionnaire?.listItem.id === rowData.id;

                return (
                  <QuestionnaireTableRow
                    key={rowData.id}
                    row={rowData}
                    isSelected={isSelected}
                    onRowClick={() => onRowClick(rowData.id)}
                  />
                );
              })}
            </TableBody>

            {isEmpty || fetchStatus === 'error' || isInitialLoading ? (
              <QuestionnaireListFeedback
                isEmpty={isEmpty}
                isInitialLoading={isInitialLoading}
                status={fetchStatus}
                searchInput={searchInput}
                error={fetchError}
              />
            ) : null}
          </MuiTable>
        </TableContainer>
      </Scrollbar>

      <DashboardTablePagination table={table}>
        <Fade in={isFetching}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ p: 2 }}>
            Updating...
          </Typography>
        </Fade>
      </DashboardTablePagination>
    </>
  );
}

export default QuestionnaireTable;
