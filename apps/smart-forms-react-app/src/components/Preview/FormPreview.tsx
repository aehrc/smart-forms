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

import React, { useContext } from 'react';
import { Box, Card, Container, Fade, Typography } from '@mui/material';
import Preview from './Preview';
import { QuestionnaireProviderContext } from '../../App';
import { RendererContext } from '../../layouts/renderer/RendererLayout';
import FormInvalid from '../QRenderer/FormInvalid';

function FormPreview() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const { renderer } = useContext(RendererContext);
  const { response } = renderer;

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !response.item) return <FormInvalid />;

  const qForm = questionnaire.item[0];
  const qrForm = response.item[0];

  if (qForm.item && qrForm.item) {
    return (
      <Fade in={true} timeout={500}>
        <Container sx={{ mt: 3 }}>
          <Box mb={3}>
            <Typography variant="h2">Preview</Typography>
          </Box>
          <Box>
            <Card sx={{ p: 4, mb: 2 }}>
              <Preview />
            </Card>
          </Box>
        </Container>
      </Fade>
    );
  } else {
    return <FormInvalid />;
  }
}

export default FormPreview;
