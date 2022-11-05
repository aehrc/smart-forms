import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Stack, Typography } from '@mui/material';

interface Props {
  message: string;
}

function ProgressSpinner(props: Props) {
  const { message } = props;

  return (
    <Stack direction="column" justifyContent="center" minHeight="95vh" spacing={3}>
      <Box display="flex" flexDirection="row" justifyContent="center">
        <CircularProgress size={72} />
      </Box>
      <Box textAlign="center">
        <Typography>{message}</Typography>
      </Box>
    </Stack>
  );
}

export default ProgressSpinner;
