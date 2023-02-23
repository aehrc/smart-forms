import { alpha, styled } from '@mui/material/styles';
import { Box, Theme } from '@mui/material';
import { QuestionnaireListItem } from '../../interfaces/Interfaces';

const handleColorType = (color: QuestionnaireListItem['status'], theme: Theme) => {
  switch (color) {
    case 'draft':
      return theme.palette.warning.dark;
    case 'active':
      return theme.palette.success.dark;
    case 'retired':
      return theme.palette.error.dark;
    case 'unknown':
      return theme.palette.grey[700];
  }
};
const handleBgColorType = (color: QuestionnaireListItem['status'], theme: Theme) => {
  switch (color) {
    case 'draft':
      return alpha(theme.palette.warning.main, 0.16);
    case 'active':
      return alpha(theme.palette.success.main, 0.16);
    case 'retired':
      return alpha(theme.palette.error.main, 0.16);
    case 'unknown':
      return theme.palette.grey[300];
  }
};

export const QuestionnaireStyledLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: QuestionnaireListItem['status'] }>(({ theme, color }) => ({
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
