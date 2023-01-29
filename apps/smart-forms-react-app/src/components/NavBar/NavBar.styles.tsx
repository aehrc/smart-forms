import { Box, IconButton, styled, Toolbar, Typography } from '@mui/material';

export const NavToolBar = styled(Toolbar)(({ theme }) => ({
  paddingTop: 8,
  paddingBottom: 8,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white
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
  },
  paddingTop: 4,
  paddingBottom: 4
}));

export const NavBarPopUpBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.common.white
}));

export const NavBarPatientDetailsTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 14
}));

export const PatientDetailsDialogTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 14
}));

export const NavBarTitleTypography = styled(Typography)(() => ({
  textTransform: 'capitalize',
  fontSize: 14,
  fontWeight: 500
}));
