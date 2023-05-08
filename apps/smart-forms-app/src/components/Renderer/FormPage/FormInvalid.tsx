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

import { useEffect } from 'react';
import { Box, Button, Container, Fade, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../Misc/Iconify';
import type { Questionnaire } from 'fhir/r4';

interface Props {
  questionnaire?: Questionnaire;
}

function FormInvalid(props: Props) {
  const { questionnaire } = props;

  const navigate = useNavigate();

  function handleClick() {
    navigate('/dashboard/questionnaires');
  }

  useEffect(() => {
    // Questionnaire only has the minimum required implementation, which logically means that it was triggered by a refresh
    // auto redirect to dashboard
    if (questionnaire && Object.keys(questionnaire).length === 2) {
      navigate('/dashboard/questionnaires');
    }
  }, [navigate, questionnaire]);

  return (
    <Fade in={true} timeout={500}>
      <Container sx={{ mt: 1.25 }}>
        <Stack gap={1}>
          <Typography variant="h3">
            Oops, the form renderer is unable to render this questionnaire.
          </Typography>
          <Typography>
            {
              "This questionnaire either lacks a top-level group item, or the group item doesn't have any items."
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

export default FormInvalid;
