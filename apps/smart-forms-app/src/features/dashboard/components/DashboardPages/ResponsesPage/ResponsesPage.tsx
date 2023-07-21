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
import { Card, Container, Fade, Table, TableBody, TableContainer } from '@mui/material';
import { applySortFilter, getComparator } from '../../../utils/dashboard.ts';
import type { QuestionnaireResponse } from 'fhir/r4';
import ResponseListToolbar from './TableComponents/ResponseListToolbar.tsx';
import ResponseListFeedback from './TableComponents/ResponseListFeedback.tsx';
import useDebounce from '../../../../renderer/hooks/useDebounce.ts';
import { Helmet } from 'react-helmet';
import type { TableAttributes } from '../../../../renderer/types/table.interface.ts';
import type { ResponseListItem, SelectedResponse } from '../../../types/list.interface.ts';
import useConfigStore from '../../../../../stores/useConfigStore.ts';
import DashboardHeading from '../DashboardHeading.tsx';
import ResponseTableRow from './TableComponents/ResponseTableRow.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import useFetchResponses from '../../../hooks/useFetchResponses.ts';
import DashboardTableHead from '../DashboardTableHead.tsx';

const tableHeaders: TableAttributes[] = [
  { id: 'title', label: 'Questionnaire Title', alignRight: false },
  { id: 'author', label: 'Author', alignRight: false },
  { id: 'authored', label: 'Authored On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function ResponsesPage() {
  const questionnaireSource = useConfigStore((state) => state.questionnaireSource);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<SelectedResponse | null>(null);
  const [orderBy, setOrderBy] = useState<keyof ResponseListItem>('authored');
  const [searchInput, setSearchInput] = useState('');

  const debouncedInput = useDebounce(searchInput, 300);

  const { responses, responseListItems, fetchStatus, fetchError, isFetching } = useFetchResponses(
    searchInput,
    debouncedInput,
    questionnaireSource
  );

  // sort or perform client-side filtering or items
  const filteredListItems: ResponseListItem[] = useMemo(
    () =>
      applySortFilter(
        responseListItems,
        getComparator(order, orderBy, 'response'),
        questionnaireSource
      ) as ResponseListItem[],
    [order, orderBy, responseListItems, questionnaireSource]
  );

  const isEmpty = filteredListItems.length === 0 && fetchStatus !== 'loading';

  // Event handlers
  const handleSort = (_: MouseEvent, property: keyof ResponseListItem) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (id: string) => {
    const selectedItem = filteredListItems.find((item) => item.id === id);

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
  };

  return (
    <>
      <Helmet>
        <title>Responses</title>
      </Helmet>
      <Fade in={true}>
        <Container data-test="dashboard-responses-container">
          <DashboardHeading headingText="Responses" setPage={setPage} />

          <Card>
            <ResponseListToolbar
              selectedResponse={selectedResponse}
              searchInput={searchInput}
              isFetching={isFetching}
              onClearSelection={() => setSelectedResponse(null)}
              onSearch={(input) => {
                setPage(0);
                setSearchInput(input);
              }}
            />

            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <DashboardTableHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={tableHeaders}
                  onSort={handleSort}
                />
                <TableBody>
                  {filteredListItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id } = row;
                      const isSelected = selectedResponse?.listItem.id === id;

                      return (
                        <ResponseTableRow
                          key={id}
                          row={row}
                          isSelected={isSelected}
                          onRowClick={() => handleRowClick(id)}
                        />
                      );
                    })}
                </TableBody>

                {(isEmpty || fetchStatus === 'error' || fetchStatus === 'loading') &&
                filteredListItems.length === 0 ? (
                  <ResponseListFeedback
                    isEmpty={isEmpty}
                    status={fetchStatus}
                    searchInput={searchInput}
                    error={fetchError}
                  />
                ) : null}
              </Table>
            </TableContainer>

            <DashboardTablePagination
              isFetching={isFetching}
              numOfItems={filteredListItems.length}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </Card>
        </Container>
      </Fade>
    </>
  );
}

export default ResponsesPage;
