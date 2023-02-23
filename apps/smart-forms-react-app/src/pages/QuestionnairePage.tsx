import React, { useContext, useMemo, useState } from 'react';
import {
  Avatar,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import Scrollbar from '../components/Scrollbar/Scrollbar';
import QuestionnaireListHead from '../components/Questionnaires/QuestionnaireListHead';
import QuestionnaireListToolbar from '../components/Questionnaires/QuestionnaireListToolbar';
import { QuestionnaireListItem, TableAttributes } from '../interfaces/Interfaces';
import {
  applySortFilter,
  getComparator,
  getQuestionnaireListItems,
  getQuestionnairesPromise
} from '../functions/QuestionnairePageFunctions';
import Label from '../components/Label/Label';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useQuery } from '@tanstack/react-query';
import { Bundle } from 'fhir/r5';
import useDebounce from '../custom-hooks/useDebounce';
import QuestionnaireListFeedback from '../components/Questionnaires/QuestionnaireListFeedback';
import CreateResponseButton from '../components/Questionnaires/CreateResponseButton';
import { SourceContext } from '../layouts/dashboard/DashboardLayout';

const TABLE_HEAD: TableAttributes[] = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'publisher', label: 'Publisher', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function QuestionnairePage() {
  const { source, setSource } = useContext(SourceContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<QuestionnaireListItem | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<keyof QuestionnaireListItem>('name');

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 500);
  const numOfSearchEntries = 15;

  const endpointUrl =
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';
  const queryUrl = `/Questionnaire?_count=${numOfSearchEntries}&title:contains=${debouncedInput}`;

  const { data, status, error } = useQuery<Bundle>(
    ['questionnaire', queryUrl],
    () => getQuestionnairesPromise(endpointUrl, queryUrl),
    {
      enabled: debouncedInput === searchInput
    }
  );

  const questionnaireListItems: QuestionnaireListItem[] = useMemo(
    () => getQuestionnaireListItems(data),
    [data]
  );

  const emptyRows: number = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questionnaireListItems.length) : 0),
    [page, questionnaireListItems.length, rowsPerPage]
  );

  const filteredListItems: QuestionnaireListItem[] = useMemo(
    () => applySortFilter(questionnaireListItems, getComparator(order, orderBy), debouncedInput),
    [debouncedInput, order, orderBy, questionnaireListItems]
  );

  const isNotFound = filteredListItems.length === 0 && !!debouncedInput;

  // Event handlers
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof QuestionnaireListItem
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (id: string) => {
    const selectedItem = filteredListItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.id === selected?.id) {
        setSelected(undefined);
      } else {
        setSelected(selectedItem);
      }
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" mb={5}>
        <Typography variant="h3" gutterBottom>
          Questionnaires
        </Typography>
      </Stack>

      <Card>
        <QuestionnaireListToolbar
          selected={selected}
          searchInput={searchInput}
          clearSelection={() => setSelected(undefined)}
          onSearch={(input) => {
            setPage(0);
            setSearchInput(input);
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <QuestionnaireListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {filteredListItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const { id, name, avatarColor, publisher, date, status } = row;
                    const isSelected = selected?.name === name;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        selected={isSelected}
                        onClick={() => handleClick(row.id)}>
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
                            {name}
                          </Typography>
                        </TableCell>

                        <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                          {publisher}
                        </TableCell>

                        <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                          {date}
                        </TableCell>

                        <TableCell align="left">
                          <Label color={status}>{status}</Label>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>

              {isNotFound || status === 'error' ? (
                <QuestionnaireListFeedback
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value));
            setPage(0);
          }}
        />
      </Card>

      <Stack direction="row-reverse" alignItems="center" my={5}>
        <CreateResponseButton selectedItem={selected} source={source} />
      </Stack>
    </Container>
  );
}

export default QuestionnairePage;
