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
import { Box, Button, Container, Fade, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../Misc/Iconify';

function ViewerInvalid() {
  const navigate = useNavigate();

  function handleClick() {
    navigate('/');
  }

  return (
    <Fade in={true} timeout={500}>
      <Container>
        <Stack gap={3}>
          <Typography variant="h3">
            {"Oops, the selected response doesn't seem to be valid."}
          </Typography>
          <Typography>
            {
              "It's most likely due to the selected response or its referenced questionnaire not having a top-level group item."
            }
          </Typography>
        </Stack>
        <Box sx={{ py: 5 }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="material-symbols:arrow-back" />}
            onClick={handleClick}>
            Take me back
          </Button>
        </Box>
      </Container>
    </Fade>
  );
}

export default ViewerInvalid;
