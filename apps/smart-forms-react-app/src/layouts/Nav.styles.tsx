import { alpha, styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const NAV_WIDTH = 280;

export const StyledAccount = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12)
}));
