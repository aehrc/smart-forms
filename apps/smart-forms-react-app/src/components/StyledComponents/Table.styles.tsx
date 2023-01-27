import { styled, TableCell } from '@mui/material';

export const HeaderTableCell = styled(TableCell)(() => ({ fontSize: 13, lineHeight: 'normal' }));

export const FirstTableCell = styled(TableCell)(() => ({
  width: '35%',
  paddingLeft: 10,
  paddingRight: 5
}));

export const StandardTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'numOfColumns'
})<{ numOfColumns: number }>(({ numOfColumns }) => ({
  width: `${65 / (numOfColumns - 1)}%`,
  paddingLeft: 5,
  paddingRight: 5
}));

export const DeleteButtonTableCell = styled(TableCell)(() => ({
  paddingLeft: 0,
  paddingRight: 5
}));
