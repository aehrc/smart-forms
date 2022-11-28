import { Box, Chip, styled } from '@mui/material';

export const ChipBarBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  '& .MuiButtonBase-root: hover': {
    transition: '0.2s',
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.accent2.light,
    '& .MuiSvgIcon-root': {
      color: theme.palette.secondary.dark
    }
  }
}));

export const OperationChip = styled(Chip)(() => ({
  paddingLeft: '4px',
  paddingRight: '4px'
}));
