import { styled } from '@mui/material/styles';
import Fab from '@mui/material/Fab';

export const SecondaryFab = styled(Fab)(({ theme }) => ({
  color: '#fff',
  background: theme.palette.secondary.main,
  '&:hover': {
    background: theme.palette.secondary.dark
  }
}));
