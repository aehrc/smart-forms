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
import { Card, Container, Fade, Table, TableBody, TableContainer, Typography } from '@mui/material';
import type { QuestionnaireResponse } from 'fhir/r4';
import ResponseListToolbar from './TableComponents/ResponseListToolbar.tsx';
import ResponseListFeedback from './TableComponents/ResponseListFeedback.tsx';
import useDebounce from '../../../../renderer/hooks/useDebounce.ts';
import { Helmet } from 'react-helmet';
import type { SelectedResponse } from '../../../types/list.interface.ts';
import DashboardHeading from '../DashboardHeading.tsx';
import ResponseTableRow from './TableComponents/ResponseTableRow.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import useFetchResponses from '../../../hooks/useFetchResponses.ts';
import DashboardTableHead from '../DashboardTableHead.tsx';
import { createResponseTableColumns } from '../../../utils/tableColumns.ts';
import type { SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

function ResponsesPage() {
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

  const headers = table.getHeaderGroups()[0].headers;

  const isEmpty = table.getRowModel().rows.length === 0 && fetchStatus !== 'loading';

  return (
    <>
      <Helmet>
        <title>Responses</title>
      </Helmet>
      <Fade in={true}>
        <Container data-test="dashboard-responses-container">
          <DashboardHeading>Responses</DashboardHeading>

          <Card>
            <ResponseListToolbar
              selectedResponse={selectedResponse}
              searchInput={searchInput}
              isFetching={isFetching}
              onClearSelection={() => setSelectedResponse(null)}
              onSearch={(input) => {
                table.setPageIndex(0);
                setSearchInput(input);
              }}
            />

            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <DashboardTableHead headers={headers} />
                <TableBody>
                  {table.getRowModel().rows.map((row) => {
                    const rowData = row.original;
                    const isSelected = selectedResponse?.listItem.id === rowData.id;

                    return (
                      <ResponseTableRow
                        key={rowData.id}
                        row={rowData}
                        isSelected={isSelected}
                        onRowClick={() => handleRowClick(rowData.id)}
                      />
                    );
                  })}
                </TableBody>

                {(isEmpty || fetchStatus === 'error' || fetchStatus === 'loading') &&
                table.getRowModel().rows.length === 0 ? (
                  <ResponseListFeedback
                    isEmpty={isEmpty}
                    status={fetchStatus}
                    searchInput={searchInput}
                    error={fetchError}
                  />
                ) : null}
              </Table>
            </TableContainer>

            <DashboardTablePagination table={table}>
              <Fade in={isFetching}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ p: 2 }}>
                  Updating...
                </Typography>
              </Fade>
            </DashboardTablePagination>
          </Card>
        </Container>
      </Fade>
    </>
  );
}

export default ResponsesPage;
