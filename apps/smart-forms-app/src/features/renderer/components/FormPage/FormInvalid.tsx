/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { memo, useEffect } from 'react';
import { Box, Button, Container, Fade, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../../../components/Iconify/Iconify.tsx';
import type { Questionnaire } from 'fhir/r4';

interface FormInvalidProps {
  questionnaire?: Questionnaire;
}

const FormInvalid = memo(function FormInvalid(props: FormInvalidProps) {
  const { questionnaire } = props;

  const navigate = useNavigate();

  const pathName = window.location.pathname;

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
              'This questionnaire either lacks an item, or we have done something terribly wrong - raise an issue with us!'
            }
          </Typography>
        </Stack>
        <Box py={5}>
          {pathName !== '/playground' ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="material-symbols:arrow-back" />}
              onClick={() => {
                navigate('/dashboard/questionnaires');
              }}>
              Take me back
            </Button>
          ) : null}
        </Box>
      </Container>
    </Fade>
  );
});

export default FormInvalid;
