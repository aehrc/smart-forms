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

import { useContext, useEffect, useRef } from 'react';
import { Box, Card, Container, Fade } from '@mui/material';
import ViewerInvalid from '../renderer/components/FormPage/ViewerInvalid.tsx';
import { PrintComponentRefContext } from './ViewerLayout.tsx';
import parse from 'html-react-parser';
import { qrToHTML } from '../preview/utils/preview.ts';
import { Helmet } from 'react-helmet';
import PageHeading from '../dashboard/components/DashboardPages/PageHeading.tsx';
import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';

function ResponsePreview() {
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

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  if (!sourceQuestionnaire.item || !sourceResponse.item) {
    return <ViewerInvalid questionnaire={sourceQuestionnaire} />;
  }

  const responseCleaned = removeEmptyAnswersFromResponse(sourceQuestionnaire, sourceResponse);
  const parsedHTML = parse(qrToHTML(sourceQuestionnaire, responseCleaned));

  return (
    <>
      <Helmet>
        <title>{sourceQuestionnaire.title ? sourceQuestionnaire.title : 'Response Preview'}</title>
      </Helmet>
      <Fade in={true} timeout={500}>
        <Container>
          <PageHeading>Response Preview</PageHeading>
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
