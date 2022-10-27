import { styled, Typography, List, Box, Card } from '@mui/material';
export const TabListTypography = styled(Typography)(() => ({
  fontSize: 12
}));

export const DrawerOperationTypography = styled(Typography)(() => ({
  fontSize: 12
}));

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

export const DrawerOperationList = styled(List)(({ theme }) => ({
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 20
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.accent2.light,
    borderRadius: 20
  }
}));

export const DrawerTabList = styled(List)(({ theme }) => ({
  '&& .Mui-selected': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.main,
    borderRadius: 20
  },
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 20
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.light,
    borderRadius: 20
  }
}));
