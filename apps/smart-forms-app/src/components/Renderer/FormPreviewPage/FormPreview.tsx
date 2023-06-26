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

import { useContext } from 'react';
import { Box, Card, Container, Fade, Typography } from '@mui/material';
import { QuestionnaireProviderContext } from '../../../App';
import FormInvalid from '../FormPage/FormInvalid';
import parse from 'html-react-parser';
import { qrToHTML } from '../../../features/preview/utils/preview.ts';
import { removeHiddenAnswers } from '../../../features/save/api/saveQr.ts';
import { EnableWhenContext } from '../../../features/enableWhen/contexts/EnableWhenContext.tsx';
import { Helmet } from 'react-helmet';
import { EnableWhenExpressionContext } from '../../../features/enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import { RendererContext } from '../../../features/renderer/contexts/RendererContext.ts';

function FormPreview() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenExpressionContext = useContext(EnableWhenExpressionContext);

  const { renderer } = useContext(RendererContext);
  const { response } = renderer;

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !response.item) return <FormInvalid />;

  const topLevelQItems = questionnaire.item;
  const topLevelQRItems = response.item;

  if (topLevelQItems[0] && topLevelQRItems[0]) {
    const responseCleaned = removeHiddenAnswers(
      questionnaire,
      response,
      enableWhenContext,
      enableWhenExpressionContext
    );
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
