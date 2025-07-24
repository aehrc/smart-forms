import { Table as MuiTable, TableBody, TableContainer } from '@mui/material';
import DashboardTableHead from '../../../dashboard/components/DashboardPages/DashboardTableHead.tsx';
import { createResponseListItem } from '../../../dashboard/utils/dashboard.ts';
import ResponseTableRow from '../../../dashboard/components/DashboardPages/ResponsesPage/TableComponents/ResponseTableRow.tsx';
import DashboardTablePagination from '../../../dashboard/components/DashboardPages/DashboardTablePagination.tsx';
import type { QuestionnaireResponse } from 'fhir/r4';
import type { Table } from '@tanstack/react-table';
import ExistingResponseTableToolbar from './ExistingResponseTableToolbar.tsx';
import ExistingResponsesTableFeedback from './ExistingResponsesTableFeedback.tsx';
import RefetchButton from '../../../../components/Button/RefetchButton.tsx';

interface ExistingResponsesTableViewProps {
  table: Table<QuestionnaireResponse>;
  isFetching: boolean;
  fetchError: unknown;
  selectedResponse: QuestionnaireResponse | null;
  onRowClick: (id: string) => void;
  onSelectResponse: (selected: QuestionnaireResponse | null) => void;
  refetchResponses: () => void;
}

function ExistingResponsesTableView(props: ExistingResponsesTableViewProps) {
  const {
    table,
    isFetching,
    fetchError,
    selectedResponse,
    onRowClick,
    onSelectResponse,
    refetchResponses
  } = props;

  const headers = table.getHeaderGroups()[0].headers;

  const isEmpty = table.getRowModel().rows.length === 0 && !isFetching;

  return (
    <>
      <ExistingResponseTableToolbar
        selectedResponse={selectedResponse}
        isFetching={isFetching}
        onClearSelection={() => onSelectResponse(null)}
      />

      <TableContainer sx={{ minWidth: 575, boxShadow: 'none' }}>
        <MuiTable>
          <DashboardTableHead headers={headers} />
          <TableBody>
            {table.getRowModel().rows.map((row, index) => {
              const rowData = row.original;
              const listItem = createResponseListItem(rowData, index);
              const isSelected = selectedResponse?.id === listItem.id;

              return (
                <ResponseTableRow
                  key={listItem.id}
                  row={listItem}
                  isSelected={isSelected}
                  onRowClick={() => onRowClick(listItem.id)}
                />
              );
            })}
          </TableBody>

          {(isEmpty || isFetching) && table.getRowModel().rows.length === 0 ? (
            <ExistingResponsesTableFeedback
              isEmpty={isEmpty}
              isFetching={isFetching}
              fetchError={fetchError}
            />
          ) : null}
        </MuiTable>
      </TableContainer>

      <DashboardTablePagination table={table}>
        <RefetchButton isFetching={isFetching} refetchResources={refetchResponses} />
      </DashboardTablePagination>
    </>
  );
}

export default ExistingResponsesTableView;
