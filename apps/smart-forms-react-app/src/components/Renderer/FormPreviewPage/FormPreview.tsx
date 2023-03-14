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
import { QuestionnaireProviderContext } from '../../../App';
import { RendererContext } from '../RendererLayout';
import FormInvalid from '../FormPage/FormInvalid';
import parse from 'html-react-parser';
import { qrToHTML } from '../../../functions/PreviewFunctions';
import { removeHiddenAnswers } from '../../../functions/SaveQrFunctions';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { Helmet } from 'react-helmet';

function FormPreview() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const enableWhenContext = useContext(EnableWhenContext);
  const { renderer } = useContext(RendererContext);
  const { response } = renderer;

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !response.item) return <FormInvalid />;

  const qForm = questionnaire.item[0];
  const qrForm = response.item[0];

  if (qForm.item && qrForm.item) {
    const responseCleaned = removeHiddenAnswers(questionnaire, response, enableWhenContext);
    const parsedHTML = parse(qrToHTML(questionnaire, responseCleaned));

    return (
      <>
        <Helmet>
          <title>{questionnaire.title ? questionnaire.title : 'Form Preview'}</title>
        </Helmet>
        <Fade in={true} timeout={500}>
          <Container sx={{ mt: 3 }}>
            <Box mb={3}>
              <Typography variant="h3">Preview</Typography>
            </Box>
            <Card sx={{ p: 4, mb: 2 }}>{parsedHTML}</Card>
          </Container>
        </Fade>
      </>
    );
  } else {
    return <FormInvalid />;
  }
}

export default FormPreview;
