import { OutlinedInput, styled, TextField } from '@mui/material';

export const FixedSizeTextField = styled(TextField)(() => ({
  maxWidth: '202px'
}));

export const FixedSizeOutlinedInput = styled(OutlinedInput)(() => ({
  maxWidth: '202px'
}));
