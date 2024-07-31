import { styled } from '@mui/material/styles';
import Fab from '@mui/material/Fab';

export const StandardFab = styled(Fab)(() => ({
  color: '#161C26',
  background: '#0ABDC3',
  '&:hover': {
    background: '#08979C'
  }
}));
