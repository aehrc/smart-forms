import React, { useMemo, useState } from 'react';
// @mui
import {
  Avatar,
  Button,
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
import Iconify from '../components/Iconify';
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

const TABLE_HEAD: TableAttributes[] = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'publisher', label: 'Publisher', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function QuestionnairePage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<keyof QuestionnaireListItem>('name');

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 200);
  const numOfSearchEntries = 15;

  const endpointUrl = 'https://sqlonfhir-r4.azurewebsites.net/fhir';
  const queryUrl = `/Questionnaire?_count=${numOfSearchEntries}`;

  const { isInitialLoading, error, data, status } = useQuery<Bundle>(
    ['questionnaire', queryUrl],
    () => getQuestionnairesPromise(endpointUrl, queryUrl),
    {
      enabled: debouncedInput === searchInput
    }
  );

  console.log(data);
  console.log(status);

  const questionnaireListItems: QuestionnaireListItem[] = useMemo(
    () => getQuestionnaireListItems(data),
    [data]
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questionnaireListItems.length) : 0;

  const filteredQuestionnaires = applySortFilter(
    questionnaireListItems,
    getComparator(order, orderBy),
    searchInput
  );

  const isNotFound = !filteredQuestionnaires.length && searchInput;

  // Event handlers
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof QuestionnaireListItem
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = questionnaireListItems.map((item) => item.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string } }) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleSearchByName = (event: { target: { value: React.SetStateAction<string> } }) => {
    setPage(0);
    setSearchInput(event.target.value);
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
          numSelected={selected.length}
          searchInput={searchInput}
          onSearch={handleSearchByName}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <QuestionnaireListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={questionnaireListItems.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {filteredQuestionnaires
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const { id, name, avatarColor, publisher, date, status } = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} selected={selectedUser}>
                        <TableCell>
                          <Avatar sx={{ bgcolor: avatarColor }}>
                            <AssignmentIcon />
                          </Avatar>
                        </TableCell>

                        <TableCell scope="row" padding="normal" sx={{ maxWidth: 240 }}>
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

              {isNotFound || status === 'error' || status === 'loading' ? (
                <QuestionnaireListFeedback status={status} searchInput={searchInput} />
              ) : null}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={questionnaireListItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Stack direction="row-reverse" alignItems="center" my={5}>
        <Button variant="contained" endIcon={<Iconify icon="material-symbols:arrow-right-alt" />}>
          Create response
        </Button>
      </Stack>
    </Container>
  );
}

export default QuestionnairePage;
