import { Card, styled } from '@mui/material';

export const FullHeightCard = styled(Card)(() => ({
  padding: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));
