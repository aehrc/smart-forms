import { styled } from '@mui/material/styles';
import Radio from '@mui/material/Radio';

export const StandardRadio = styled(Radio, {
  shouldForwardProp: (prop) => prop !== 'readOnly'
})<{ readOnly: boolean }>(({ theme, readOnly }) => ({
  ...(readOnly && {
    '&.MuiButtonBase-root': {
      '&.MuiRadio-root': {
        // Use text.disabled colour (same as disabled field) here because text.secondary is too dark, and 'rgb(220, 223, 228)' is too light
        color: readOnly ? theme.palette.text.disabled : undefined
      },
      '&:hover': {
        backgroundColor: readOnly ? theme.palette.action.hover : undefined
      }
    }
  })
}));
