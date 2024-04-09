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

import QuestionnaireListToolbar from './TableComponents/QuestionnaireListToolbar.tsx';
import { Table as MuiTable, TableBody, TableContainer } from '@mui/material';
import DashboardTableHead from '../DashboardTableHead.tsx';
import QuestionnaireTableRow from './TableComponents/QuestionnaireTableRow.tsx';
import QuestionnaireListFeedback from './TableComponents/QuestionnaireListFeedback.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import type { Table } from '@tanstack/react-table';
import type { Questionnaire } from 'fhir/r4';
import { createQuestionnaireListItem } from '../../../utils/dashboard.ts';
import RefetchButton from '../../../../../components/Button/RefetchButton.tsx';

interface QuestionnaireTableViewProps {
  table: Table<Questionnaire>;
  searchInput: string;
  debouncedInput: string;
  fetchStatus: 'error' | 'success' | 'loading';
  isInitialLoading: boolean;
  isFetching: boolean;
  fetchError: unknown;
  selectedQuestionnaire: Questionnaire | null;
  onSearch: (input: string) => void;
  onRowClick: (id: string) => void;
  onSelectQuestionnaire: (selected: Questionnaire | null) => void;
  refetchQuestionnaires: () => void;
}

function QuestionnaireTableView(props: QuestionnaireTableViewProps) {
  const {
    table,
    searchInput,
    debouncedInput,
    fetchStatus,
    isInitialLoading,
    isFetching,
    fetchError,
    selectedQuestionnaire,
    onSearch,
    onRowClick,
    onSelectQuestionnaire,
    refetchQuestionnaires
  } = props;

  const headers = table.getHeaderGroups()[0].headers;

  const isEmpty =
    table.getRowModel().rows.length === 0 && !!debouncedInput && fetchStatus !== 'loading';

  return (
    <>
      <QuestionnaireListToolbar
        selected={selectedQuestionnaire}
        searchInput={searchInput}
        onClearSelection={() => onSelectQuestionnaire(null)}
        onSearch={onSearch}
      />

      <TableContainer sx={{ minWidth: 575 }}>
        <MuiTable stickyHeader>
          <DashboardTableHead headers={headers} />
          <TableBody>
            {table.getRowModel().rows.map((row, index) => {
              const rowData = row.original;
              const listItem = createQuestionnaireListItem(rowData, index);
              const isSelected = selectedQuestionnaire?.id === listItem.id;

              return (
                <QuestionnaireTableRow
                  key={listItem.id}
                  row={listItem}
                  isSelected={isSelected}
                  onRowClick={() => onRowClick(listItem.id)}
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

      <DashboardTablePagination table={table}>
        <RefetchButton isFetching={isFetching} refetchResources={refetchQuestionnaires} />
      </DashboardTablePagination>
    </>
  );
}

export default QuestionnaireTableView;
