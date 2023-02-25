import { Box, styled } from '@mui/material';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

export const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 4,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 8,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));
