import { List, styled } from '@mui/material';

export const SecondaryNonSelectableList = styled(List)(({ theme }) => ({
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 20
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.accent2.light,
    borderRadius: 25
  }
}));

export const PrimarySelectableList = styled(List)(({ theme }) => ({
  '&& .Mui-selected': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.main,
    borderRadius: 20
  },
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 20
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.light,
    borderRadius: 20
  }
}));
