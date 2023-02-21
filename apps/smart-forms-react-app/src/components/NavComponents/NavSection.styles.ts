import { styled } from '@mui/material/styles';
import { ListItemButton, ListItemIcon } from '@mui/material';

export const StyledNavItem = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.subtitle2,
  height: 48,
  textTransform: 'capitalize',
  color: theme.palette.grey[700],

  '&:hover': {
    color: theme.palette.secondary.dark,
    bgcolor: 'action.selected',
    backgroundColor: theme.palette.accent2.light,
    borderRadius: 100
  }
}));

export const StyledNavItemIcon = styled(ListItemIcon)({
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});
