// @mui
import { Box, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import React from 'react';
import { ResponseListItem, TableAttributes } from '../../interfaces/Interfaces';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)'
};

interface Props {
  order: 'asc' | 'desc';
  orderBy: string;
  headLabel: TableAttributes[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ResponseListItem) => void;
}

function ResponseListHead(props: Props) {
  const { order, orderBy, headLabel, onRequestSort } = props;
  const createSortHandler =
    (property: TableAttributes['id']) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property as keyof ResponseListItem);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default ResponseListHead;
