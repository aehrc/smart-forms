import { AppBar, Box, IconButton, styled, Toolbar, Typography } from '@mui/material';

export const NavAppBar = styled(AppBar)(() => ({
  height: '45px'
}));

export const NavToolBar = styled(Toolbar)(() => ({
  paddingTop: '8px',
  paddingBottom: '8px'
}));

export const NavBarDrawerIconButton = styled(IconButton)(({ theme }) => ({
  color: 'inherit',
  edge: 'start',
  marginRight: '8px',
  [theme.breakpoints.up('md')]: {
    display: 'none'
  }
}));

export const NavBarPatientUserDataBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    display: 'none'
  },
  [theme.breakpoints.up('lg')]: {
    display: 'flex'
  }
}));

export const NavBarPatientUserDataIconButton = styled(IconButton)(({ theme }) => ({
  color: 'inherit',
  [theme.breakpoints.up('lg')]: {
    display: 'none'
  }
}));

export const NavBarPatientDetailsTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 14
}));

export const PatientDetailsDialogTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 16
}));

export const NavBarTitleTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 14,
  fontWeight: 500
}));
