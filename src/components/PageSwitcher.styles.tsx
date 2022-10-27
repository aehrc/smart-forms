import { Card, styled } from '@mui/material';

export const SideBarCard = styled(Card)(({ theme }) => ({
  height: '95vh',
  backgroundColor: theme.palette.background.default,
  borderRadius: 0
}));
