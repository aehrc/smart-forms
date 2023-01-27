import { Box, Card, styled } from '@mui/material';

export const SideBarListBox = styled(Box)(() => ({
  paddingLeft: 8,
  paddingRight: 8,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

export const SideBarCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: 0,
  width: '100%',
  marginRight: 1
}));
