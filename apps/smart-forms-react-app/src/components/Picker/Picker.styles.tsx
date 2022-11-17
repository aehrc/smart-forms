import { styled, TextField } from '@mui/material';

export const PickerSearchField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderRadius: `30px`
    }
  },
  marginBottom: 0
}));
