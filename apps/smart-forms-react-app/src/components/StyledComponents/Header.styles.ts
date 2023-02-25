import { alpha, styled } from '@mui/material/styles';
import { AppBar, Toolbar } from '@mui/material';

const NAV_WIDTH = 240;

const HEADER_MOBILE = 64;

const HEADER_DESKTOP = 72;

export const StyledRoot = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'navCollapsed'
})<{ navCollapsed?: boolean }>(({ theme, navCollapsed }) => ({
  backdropFilter: `blur(2.25px)`,
  WebkitBackdropFilter: `blur(2.25px)`,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  boxShadow: 'none',
  [theme.breakpoints.up('lg')]: {
    width: navCollapsed ? '100%' : `calc(100% - ${NAV_WIDTH + 1}px)`
  }
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 4)
  }
}));
