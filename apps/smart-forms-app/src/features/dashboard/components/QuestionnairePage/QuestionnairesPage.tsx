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
import {
  Avatar,
  Box,
  Card,
  Container,
  Fade,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import Scrollbar from '../../../../components/Scrollbar/Scrollbar.tsx';
import QuestionnaireListHead from './TableComponents/QuestionnaireListHead.tsx';
import QuestionnaireListToolbar from './TableComponents/QuestionnaireListToolbar.tsx';
import {
  applySortFilter,
  constructBundle,
  getComparator,
  getFormsServerBundlePromise,
  getQuestionnaireListItems
} from '../../utils/dashboard.ts';
import QuestionnaireLabel from './TableComponents/QuestionnaireLabel.tsx';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r4';
import useDebounce from '../../../renderer/hooks/useDebounce.ts';
import QuestionnaireListFeedback from './TableComponents/QuestionnaireListFeedback.tsx';
import CreateNewResponseButton from './Buttons/CreateNewResponseButton.tsx';
import ViewExistingResponsesButton from './Buttons/ViewExistingResponsesButton.tsx';
import { SelectedQuestionnaireContext } from '../../contexts/SelectedQuestionnaireContext.tsx';
import QuestionnaireSourceToggle from '../../../../components/Toggles/QuestionnaireSourceToggle.tsx';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import type { TableAttributes } from '../../../renderer/types/table.interface.ts';
import type { QuestionnaireListItem } from '../../types/list.interface.ts';
import { loadQuestionnairesFromLocal } from '../../../../api/local.ts';
import useConfigStore from '../../../../stores/useConfigStore.ts';

const tableHeaders: TableAttributes[] = [
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'publisher', label: 'Publisher', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function QuestionnairesPage() {
  const smartClient = useConfigStore((state) => state.smartClient);
  const debugMode = useConfigStore((state) => state.debugMode);
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof QuestionnaireListItem>('date');

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 300);
  const numOfSearchEntries = 100;

  let queryUrl = `/Questionnaire?_count=${numOfSearchEntries}&_sort=-date&`;
  if (debouncedInput) {
    queryUrl += 'title:contains=' + debouncedInput;
  }

  const { data, status, error } = useQuery<Bundle>(
    ['questionnaires', queryUrl],
    () => getFormsServerBundlePromise(queryUrl),
    {
      enabled: debouncedInput === searchInput
    }
  );

  // load local questionnaires to be used if source is local
  const localQuestionnaireBundle: Bundle = useMemo(
    () => constructBundle(loadQuestionnairesFromLocal()),
    []
  );

  // construct questionnaire list items for data display
  const questionnaireListItems: QuestionnaireListItem[] = useMemo(
    () =>
      getQuestionnaireListItems(questionnaireSource === 'remote' ? data : localQuestionnaireBundle),
    [data, localQuestionnaireBundle, questionnaireSource]
  );

  const emptyRows: number = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questionnaireListItems.length) : 0),
    [page, questionnaireListItems.length, rowsPerPage]
  );

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

  const isEmpty = filteredListItems.length === 0 && !!debouncedInput && status !== 'loading';

  // Event handlers
  const handleRequestSort = (_: MouseEvent, property: keyof QuestionnaireListItem) => {
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
        const bundle = questionnaireSource === 'remote' ? data : localQuestionnaireBundle;
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
          <Stack direction="row" alignItems="center" mb={3}>
            <Typography variant="h3" gutterBottom>
              Questionnaires
            </Typography>
            <Box flexGrow={1} />
            {debugMode ? <QuestionnaireSourceToggle setPage={setPage} /> : null}
          </Stack>

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
                  <QuestionnaireListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={tableHeaders}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {filteredListItems
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        const { id, title, avatarColor, publisher, date, status } = row;
                        const isSelected = selectedQuestionnaire?.listItem.id === id;

                        return (
                          <TableRow
                            hover
                            key={id}
                            tabIndex={-1}
                            selected={isSelected}
                            sx={{ cursor: 'pointer' }}
                            data-test="questionnaire-list-row"
                            onClick={() => handleRowClick(row.id)}>
                            <TableCell padding="checkbox">
                              <Avatar
                                sx={{
                                  bgcolor: avatarColor,
                                  ml: 1,
                                  my: 2.25,
                                  width: 36,
                                  height: 36
                                }}>
                                <AssignmentIcon />
                              </Avatar>
                            </TableCell>

                            <TableCell scope="row" sx={{ maxWidth: 240 }}>
                              <Typography variant="subtitle2" sx={{ textTransform: 'Capitalize' }}>
                                {title}
                              </Typography>
                            </TableCell>

                            <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                              {publisher}
                            </TableCell>

                            <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                              {dayjs(date).format('LL')}
                            </TableCell>

                            <TableCell align="left">
                              <QuestionnaireLabel color={status}>{status}</QuestionnaireLabel>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 72.5 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>

                  {isEmpty || status === 'error' || status === 'loading' ? (
                    <QuestionnaireListFeedback
                      isEmpty={isEmpty}
                      status={status}
                      searchInput={searchInput}
                      error={error}
                    />
                  ) : null}
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredListItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value));
                setPage(0);
              }}
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
