import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

interface Props {
  message: string;
}

function ProgressSpinner(props: Props) {
  const { message } = props;

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" minHeight="95vh">
      <Box display="flex" flexDirection="row" justifyContent="center">
        <CircularProgress size={72} />
      </Box>
      <Box display="flex" justifyContent="center" sx={{ m: 3 }}>
        <Typography variant="h6" fontSize={16}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default ProgressSpinner;
