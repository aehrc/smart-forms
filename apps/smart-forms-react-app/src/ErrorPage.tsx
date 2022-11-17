import React from 'react';
import './App.css';
import { Box, Container, Grid, Typography } from '@mui/material';

interface Props {
  error: Error;
}

function ErrorPage(props: Props) {
  const { error } = props;

  return (
    <Container maxWidth="lg">
      <Grid container>
        <Grid item xs={8}>
          <Box display="flex" flexDirection="column" justifyContent="center" minHeight="90vh">
            <Typography variant="h2" fontSize={72} fontWeight="bold" sx={{ mb: 3 }}>
              Error 404
            </Typography>
            <Typography variant="h5" fontSize={24}>
              {error.message}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ErrorPage;
