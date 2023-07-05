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

import { useContext, useMemo, useRef, useState } from 'react';
import { Card, Container, Fade, Stack, Table, TableBody, TableContainer } from '@mui/material';
import Scrollbar from '../../../../../components/Scrollbar/Scrollbar.tsx';
import QuestionnaireListToolbar from './TableComponents/QuestionnaireListToolbar.tsx';
import { applySortFilter, getComparator } from '../../../utils/dashboard.ts';
import type { Questionnaire } from 'fhir/r4';
import useDebounce from '../../../../renderer/hooks/useDebounce.ts';
import QuestionnaireListFeedback from './TableComponents/QuestionnaireListFeedback.tsx';
import CreateNewResponseButton from './Buttons/CreateNewResponseButton.tsx';
import ViewExistingResponsesButton from './Buttons/ViewExistingResponsesButton.tsx';
import { SelectedQuestionnaireContext } from '../../../contexts/SelectedQuestionnaireContext.tsx';
import { Helmet } from 'react-helmet';
import type { TableAttributes } from '../../../../renderer/types/table.interface.ts';
import type { QuestionnaireListItem } from '../../../types/list.interface.ts';
import useConfigStore from '../../../../../stores/useConfigStore.ts';
import DashboardHeading from '../DashboardHeading.tsx';
import QuestionnaireTableRow from './TableComponents/QuestionnaireTableRow.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import useFetchQuestionnaires from '../../../hooks/useFetchQuestionnaires.ts';
import DashboardTableHead from '../DashboardTableHead.tsx';

const tableHeaders: TableAttributes[] = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'publisher', label: 'Publisher', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function QuestionnairesPage() {
  const smartClient = useConfigStore((state) => state.smartClient);
  const questionnaireSource = useConfigStore((state) => state.questionnaireSource);

  const { selectedQuestionnaire, setSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );

  // Scroll to buttons row when questionnaire is selected - for screens with small height
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  function executeScroll() {
    if (buttonsRef.current) {
      buttonsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof QuestionnaireListItem>('date');

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 300);

  const {
    remoteQuestionnaires,
    localQuestionnaires,
    questionnaireListItems,
    fetchStatus,
    fetchError,
    isInitialLoading,
    isFetching
  } = useFetchQuestionnaires(searchInput, debouncedInput, questionnaireSource);

  // sort or perform client-side filtering or items
  const filteredListItems: QuestionnaireListItem[] = useMemo(
    () =>
      applySortFilter(
        questionnaireListItems,
        getComparator(order, orderBy, 'questionnaire'),
        questionnaireSource,
        debouncedInput
      ) as QuestionnaireListItem[],
    [debouncedInput, order, orderBy, questionnaireListItems, questionnaireSource]
  );

  const isEmpty = filteredListItems.length === 0 && !!debouncedInput && fetchStatus !== 'loading';

  // Event handlers
  const handleSort = (_: MouseEvent, property: keyof QuestionnaireListItem) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (id: string) => {
    const selectedItem = filteredListItems.find((item) => item.id === id);

    if (selectedItem) {
      executeScroll();
      if (selectedItem.id === selectedQuestionnaire?.listItem.id) {
        setSelectedQuestionnaire(null);
      } else {
        const bundle =
          questionnaireSource === 'remote' ? remoteQuestionnaires : localQuestionnaires;
        const resource = bundle?.entry?.find((entry) => entry.resource?.id === id)?.resource;

        if (resource) {
          setSelectedQuestionnaire({
            listItem: selectedItem,
            resource: resource as Questionnaire
          });
        } else {
          setSelectedQuestionnaire(null);
        }
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Questionnaires</title>
      </Helmet>
      <Fade in={true}>
        <Container data-test="dashboard-questionnaires-container">
          <DashboardHeading headingText="Questionnaires" setPage={setPage} />

          <Card>
            <QuestionnaireListToolbar
              selected={selectedQuestionnaire?.listItem}
              searchInput={searchInput}
              clearSelection={() => setSelectedQuestionnaire(null)}
              onSearch={(input) => {
                setPage(0);
                setSearchInput(input);
              }}
            />

            <Scrollbar>
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
                        const isSelected = selectedQuestionnaire?.listItem.id === id;

                        return (
                          <QuestionnaireTableRow
                            key={id}
                            row={row}
                            isSelected={isSelected}
                            onRowClick={() => handleRowClick(id)}
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
                </Table>
              </TableContainer>
            </Scrollbar>

            <DashboardTablePagination
              isFetching={isFetching}
              numOfItems={filteredListItems.length}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </Card>

          <Stack direction="row-reverse" alignItems="center" gap={2} my={5} ref={buttonsRef}>
            {smartClient ? <ViewExistingResponsesButton /> : null}
            <CreateNewResponseButton selectedQuestionnaire={selectedQuestionnaire} />
          </Stack>
        </Container>
      </Fade>
    </>
  );
}

export default QuestionnairesPage;
