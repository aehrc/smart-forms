import { Box, styled } from '@mui/material';

export const MainGridContainerBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 24,
  height: '100%',
  gap: 12
}));

export const QGroupContainerBox = styled(Box)(() => ({
  marginTop: 18,
  marginBottom: 18
}));

export const FullWidthFormComponentBox = styled(Box)(() => ({
  marginBottom: 12
}));
