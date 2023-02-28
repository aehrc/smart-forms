import { alpha, styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const NAV_WIDTH = 240;

export const StyledAccount = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.primary.light, 0.12)
}));

export const StyledAlert = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: 'info' | 'error' }>(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(
    color === 'error' ? theme.palette.error.light : theme.palette.info.light,
    0.12
  ),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.5)
  }
}));
