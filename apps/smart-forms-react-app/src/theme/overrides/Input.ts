import { alpha } from '@mui/material/styles';
import { Theme } from '@mui/material';

export default function Input(theme: Theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            '& svg': { color: theme.palette.text.disabled }
          }
        },
        input: {
          '&::placeholder': {
            opacity: 1,
            color: theme.palette.text.disabled
          }
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        underline: {
          '&:before': {
            borderBottomColor: alpha(theme.palette.grey[500], 0.56)
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.16)
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.action.focus
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground
          }
        },
        underline: {
          '&:before': {
            borderBottomColor: alpha(theme.palette.grey[500], 0.56)
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.grey[500], 0.32)
          },
          '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.action.disabledBackground
            }
          }
        }
      }
    }
  };
}
