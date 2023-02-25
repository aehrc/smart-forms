import { Box, Typography } from '@mui/material';
import { StyledAlert } from '../StyledComponents/Nav.styles';
import React from 'react';

interface Props {
  message: string;
}
function NavErrorAlert(props: Props) {
  const { message } = props;

  return (
    <Box sx={{ px: 2.5, py: 10 }}>
      <StyledAlert color="error">
        <Typography variant="subtitle2">{message}</Typography>
      </StyledAlert>
    </Box>
  );
}

export default NavErrorAlert;
