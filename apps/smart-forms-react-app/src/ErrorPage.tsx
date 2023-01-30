/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
