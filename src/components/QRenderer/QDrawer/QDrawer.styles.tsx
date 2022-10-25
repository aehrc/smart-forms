import { styled, Box } from '@mui/material';
import Drawer from '@mui/material/Drawer';

export const DrawerContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth'
})<{ drawerWidth?: number }>(({ theme, drawerWidth }) => ({
  [theme.breakpoints.up('md')]: {
    width: drawerWidth,
    flexShrink: 0
  }
}));

export const MobileDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth'
})<{ drawerWidth?: number }>(({ theme, drawerWidth }) => ({
  [theme.breakpoints.up('xs')]: {
    display: 'block'
  },
  [theme.breakpoints.up('md')]: {
    display: 'none'
  },
  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
}));

export const DesktopDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth'
})<{ drawerWidth?: number }>(({ theme, drawerWidth }) => ({
  [theme.breakpoints.up('xs')]: {
    display: 'none'
  },
  [theme.breakpoints.up('md')]: {
    display: 'block'
  },
  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
}));
