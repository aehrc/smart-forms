import { styled } from '@mui/material/styles';
import Fab from '@mui/material/Fab';

export const StandardFab = styled(Fab)(({ theme }) => ({
  color: theme.palette.customButton.foreground,
  background: theme.palette.customButton.background,
  '&:hover': {
    background: theme.palette.customButton.backgroundHover
  }
}));
