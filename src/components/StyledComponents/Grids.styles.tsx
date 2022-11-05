import { Grid, styled } from '@mui/material';

export const SideBarGrid = styled(Grid)(({ theme }) => ({
  height: 'calc(100vh - 48px)',
  overflow: 'auto',
  [theme.breakpoints.up('xs')]: {
    display: 'none'
  },
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

export const MainGrid = styled(Grid)(() => ({
  height: 'calc(100vh - 48px)',
  overflow: 'auto'
}));
