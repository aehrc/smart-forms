import { Card, styled } from '@mui/material';

export const FullHeightCard = styled(Card)(() => ({
  padding: 8,
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));
