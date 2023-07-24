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
import type { SelectedResponse } from '../../../types/list.interface.ts';
import useDebounce from '../../../../renderer/hooks/useDebounce.ts';
import useFetchResponses from '../../../hooks/useFetchResponses.ts';
import { createResponseTableColumns } from '../../../utils/tableColumns.ts';
import type { SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import type { QuestionnaireResponse } from 'fhir/r4';
import ResponsesTableView from './ResponsesTableView.tsx';

function ResponsesTable() {
  const [selectedResponse, setSelectedResponse] = useState<SelectedResponse | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const debouncedInput = useDebounce(searchInput, 300);

  const { responses, responseListItems, fetchStatus, fetchError, isFetching } = useFetchResponses(
    searchInput,
    debouncedInput
  );

  const columns = useMemo(() => createResponseTableColumns(), []);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'authored',
      desc: true
    }
  ]);

  const table = useReactTable({
    data: responseListItems,
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
    const selectedItem = responseListItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.id === selectedResponse?.listItem.id) {
        setSelectedResponse(null);
      } else {
        const resource = responses?.entry?.find((entry) => entry.resource?.id === id)?.resource;

        if (resource) {
          setSelectedResponse({
            listItem: selectedItem,
            resource: resource as QuestionnaireResponse
          });
        } else {
          setSelectedResponse(null);
        }
      }
    }
  }

  return (
    <ResponsesTableView
      table={table}
      searchInput={searchInput}
      debouncedInput={debouncedInput}
      fetchStatus={fetchStatus}
      isFetching={isFetching}
      fetchError={fetchError}
      selectedResponse={selectedResponse}
      onSearch={(input) => {
        table.setPageIndex(0);
        setSearchInput(input);
      }}
      onRowClick={handleRowClick}
      onSelectResponse={setSelectedResponse}
    />
  );
}

export default ResponsesTable;
