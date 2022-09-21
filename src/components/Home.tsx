import React from 'react';
import { Box, Card, Container, Grid, Typography } from '@mui/material';

function Home() {
  return (
    <div>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="85vh">
              <Typography variant="h2" fontSize={72} fontWeight="bold" sx={{ mb: 3 }}>
                SMART Health Checks
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Card elevation={2} sx={{ my: 15, mx: 6 }}>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                minHeight="65vh"
                sx={{ p: 8 }}></Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Home;
