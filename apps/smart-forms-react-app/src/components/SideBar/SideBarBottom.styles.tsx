import { Box, IconButton, styled } from '@mui/material';

export const OrganisationLogoBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  padding: 10
}));

export const SideBarExpandButtonBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'end',
  padding: 3
}));

export const SideBarIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover, &.Mui-focusVisible': {
    backgroundColor: theme.palette.accent2.light,
    '&.MuiButtonBase-root': {
      color: theme.palette.secondary.dark
    }
  },
  '&.MuiButtonBase-root': {
    color: '#444746'
  }
}));
