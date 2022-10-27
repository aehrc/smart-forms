import { styled, Typography, Box, Card } from '@mui/material';

export const DrawerTitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.primary.dark,
  padding: 1
}));

export const DrawerSubTitleTypography = styled(Typography)(() => ({
  fontSize: 10,
  marginLeft: '16px',
  marginTop: '8px'
}));

export const DrawerListBox = styled(Box)(() => ({
  paddingLeft: '8px',
  paddingRight: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

export const SideBarCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: '95vh',
  borderRadius: 0
}));
