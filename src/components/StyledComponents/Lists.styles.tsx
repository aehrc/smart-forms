import { List, styled } from '@mui/material';

export const SecondaryNonSelectableList = styled(List)(({ theme }) => ({
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 30
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.secondary.dark,
    backgroundColor: theme.palette.accent2.light,
    borderRadius: 30
  }
}));

export const PrimarySelectableList = styled(List)(({ theme }) => ({
  '&& .Mui-selected': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.main,
    borderRadius: 30
  },
  '& .MuiListItemButton-root': {
    color: '#444746',
    borderRadius: 30
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.accent1.light,
    borderRadius: 30
  }
}));
