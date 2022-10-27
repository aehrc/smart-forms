import { Box, Card, styled } from '@mui/material';

export const SideBarListBox = styled(Box)(() => ({
  paddingLeft: '8px',
  paddingRight: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

export const SideBarCard = styled(Card)(({ theme }) => ({
  height: '95vh',
  backgroundColor: theme.palette.background.default,
  borderRadius: 0
}));
