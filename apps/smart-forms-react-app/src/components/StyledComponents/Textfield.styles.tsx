import { OutlinedInput, styled, TextField } from '@mui/material';

// Always use this accompanied by the TextField prop fullWidth
export const StandardTextField = styled(TextField)(() => ({
  maxWidth: 280
}));

export const StandardOutlinedInput = styled(OutlinedInput)(() => ({
  maxWidth: 280
}));
