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

import { useContext, useEffect, useRef } from 'react';
import { Box, Card, Container, Fade, Typography } from '@mui/material';
import ViewerInvalid from '../renderer/components/FormPage/ViewerInvalid.tsx';
import { PrintComponentRefContext } from './ViewerLayout.tsx';
import { removeHiddenAnswers } from '../save/api/saveQr.ts';
import parse from 'html-react-parser';
import { qrToHTML } from '../preview/utils/preview.ts';
import { Helmet } from 'react-helmet';
import useQuestionnaireStore from '../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../stores/useQuestionnaireResponseStore.ts';

function ResponsePreview() {
  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);

  const { setComponentRef } = useContext(PrintComponentRefContext);
  const componentRef = useRef(null);

  useEffect(
    () => {
      setComponentRef(componentRef);
    },
    // init componentRef on first render, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const questionnaire = sourceQuestionnaire;

  if (!questionnaire.item || !sourceResponse.item)
    return <ViewerInvalid questionnaire={questionnaire} />;

  const responseCleaned = removeHiddenAnswers({
    questionnaire,
    questionnaireResponse: sourceResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });

  // TODO fix the additional group title "Emergency contact"
  const parsedHTML = parse(qrToHTML(questionnaire, responseCleaned));

  return (
    <>
      <Helmet>
        <title>{questionnaire.title ? questionnaire.title : 'Response Preview'}</title>
      </Helmet>
      <Fade in={true} timeout={500}>
        <Container>
          <Box mb={3}>
            <Typography variant="h3">Response Preview</Typography>
          </Box>
          <Card sx={{ mb: 2 }}>
            <Box ref={componentRef} sx={{ p: 4 }} data-test="response-preview-box">
              <>{parsedHTML}</>
            </Box>
          </Card>
        </Container>
      </Fade>
    </>
  );
}

export default ResponsePreview;
