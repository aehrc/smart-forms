import { styled } from '@mui/material/styles';
import Radio from '@mui/material/Radio';

export const StandardRadio = styled(Radio, {
  shouldForwardProp: (prop) => prop !== 'readOnly'
})<{ readOnly: boolean; 'aria-describedby'?: string }>(({ theme, readOnly }) => ({
  ...(readOnly && {
    // Remove 'pointer' cursor when readOnly
    cursor: 'default',

    // Hide the ripple effect when readOnly, show a grey background when its focused
    '.MuiTouchRipple-root': {
      display: 'none'
    },
    // Your grey border wrapper effect
    '&.Mui-focusVisible': {
      backgroundColor: theme.palette.action.hover
    },

    // Use grey stylings when it's readOnly
    '&.MuiButtonBase-root': {
      '&.MuiRadio-root': {
        // Use text.disabled colour (same as disabled field) here because text.secondary is too dark, and 'rgb(220, 223, 228)' is too light
        color: theme.palette.text.disabled
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  })
}));
