import { styled } from '@mui/material';
import Drawer from '@mui/material/Drawer';

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
