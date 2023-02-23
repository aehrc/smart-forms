import { alpha, styled } from '@mui/material/styles';
import { Box, Theme } from '@mui/material';
import { ResponseListItem } from '../../interfaces/Interfaces';

const handleColorType = (color: ResponseListItem['status'], theme: Theme) => {
  switch (color) {
    case 'in-progress':
      return theme.palette.primary.dark;
    case 'completed':
      return theme.palette.success.dark;
    case 'amended':
      return theme.palette.warning.dark;
    case 'entered-in-error':
      return theme.palette.error.dark;
    case 'stopped':
      return theme.palette.grey[700];
  }
};

const handleBgColorType = (color: ResponseListItem['status'], theme: Theme) => {
  switch (color) {
    case 'in-progress':
      return alpha(theme.palette.primary.main, 0.16);
    case 'completed':
      return alpha(theme.palette.success.main, 0.16);
    case 'amended':
      return alpha(theme.palette.warning.main, 0.16);
    case 'entered-in-error':
      return alpha(theme.palette.error.main, 0.16);
    case 'stopped':
      return theme.palette.grey[300];
  }
};

export const ResponseStyledLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: ResponseListItem['status'] }>(({ theme, color }) => ({
  height: 24,
  minWidth: 22,
  lineHeight: 0,
  borderRadius: 6,
  cursor: 'default',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  justifyContent: 'center',
  textTransform: 'capitalize',
  padding: theme.spacing(0, 1),
  fontSize: theme.typography.pxToRem(12),
  fontFamily: theme.typography.fontFamily,
  color: handleColorType(color, theme),
  backgroundColor: handleBgColorType(color, theme),
  fontWeight: theme.typography.fontWeightBold
}));
