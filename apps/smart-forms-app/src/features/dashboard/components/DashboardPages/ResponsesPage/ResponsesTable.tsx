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
import useFetchResponses from '../../../hooks/useFetchResponses.ts';
import { createResponseTableColumns } from '../../../utils/tableColumns.ts';
import type { SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import ResponsesTableView from './ResponsesTableView.tsx';

function ResponsesTable() {
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [searchedQuestionnaire, setSearchedQuestionnaire] = useState<Questionnaire | null>(null);

  const { responses, fetchStatus, fetchError, isFetching } =
    useFetchResponses(searchedQuestionnaire);

  const columns = useMemo(() => createResponseTableColumns(), []);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'authored',
      desc: true
    }
  ]);

  const table = useReactTable({
    data: responses,
    columns: columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting
    }
  });

  function handleRowClick(id: string) {
    const response = responses.find((response) => response.id === id);

    if (response) {
      if (response.id === selectedResponse?.id) {
        setSelectedResponse(null);
      } else {
        setSelectedResponse(response);
      }
    }
  }

  return (
    <ResponsesTableView
      table={table}
      searchedQuestionnaire={searchedQuestionnaire}
      fetchStatus={fetchStatus}
      isFetching={isFetching}
      fetchError={fetchError}
      selectedResponse={selectedResponse}
      onChangeSearchedQuestionnaire={(searched) => {
        setSearchedQuestionnaire(searched);
      }}
      onRowClick={handleRowClick}
      onSelectResponse={setSelectedResponse}
    />
  );
}

export default ResponsesTable;
