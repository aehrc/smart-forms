import { Box, styled } from '@mui/material';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 72;

export const StyledRoot = styled(Box)({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

export const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 12,
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 16,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));
