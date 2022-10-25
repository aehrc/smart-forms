import { Box, styled } from '@mui/material';

export const FormContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth'
})<{ drawerWidth?: number }>(({ theme, drawerWidth }) => ({
  flexGrow: 1,
  padding: '18px',
  minHeight: '100vh',
  [theme.breakpoints.up('md')]: {
    width: `calc(100% - ${drawerWidth}px)`
  }
}));
