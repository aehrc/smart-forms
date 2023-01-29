import { OutlinedInput, styled, TextField } from '@mui/material';

// Always use this accompanied by the TextField prop fullWidth
export const StandardTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isTabled'
})<{ isTabled: boolean }>(({ isTabled }) => ({
  // Set 280 as the standard width for a field
  // Set a theoretical infinite maxWidth if field is within a table to fill the table row
  maxWidth: !isTabled ? 280 : 3000
}));

export const StandardOutlinedInput = styled(OutlinedInput, {
  shouldForwardProp: (prop) => prop !== 'isTabled'
})<{ isTabled: boolean }>(({ isTabled }) => ({
  // Set 280 as the standard width for a field
  // Set a theoretical infinite maxWidth if field is within a table to fill the table row
  maxWidth: !isTabled ? 280 : 3000
}));
