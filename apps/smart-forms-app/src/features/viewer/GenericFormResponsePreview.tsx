/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { Box, Card, Container, Fade } from '@mui/material';
import parse from 'html-react-parser';
import { Helmet } from 'react-helmet';
import PageHeading from '../dashboard/components/DashboardPages/PageHeading.tsx';
import { qrToHTML } from '../preview/utils/preview.ts';
import { PrintComponentRefContext } from './ViewerLayout.tsx';
import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import FormInvalid from '../renderer/components/FormPage/FormInvalid.tsx';
import { processHtmlNarrativeForPrinting } from './utils/print.ts';

/**
 * GenericFormResponsePreview is a component that renders a read-only HTML preview of a completed FHIR QuestionnaireResponse.
 *
 * Depending on the current route, it chooses between generating a real-time (updatable) response HTML narrative
 * (used in editing mode like `/renderer/preview`) or a snapshot of the HTML narrative stored in response.text.div.
 * If no valid questionnaire or response exists, it renders a fallback FormInvalid component.
 *
 * parsedPrintableHTML is displayed inside a Material UI Card with a print ref wrapper, allowing integration with
 * the printing workflow via `PrintComponentRefContext`.
 */
export default function GenericFormResponsePreview() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  const location = useLocation();

  // Determine if we are in the renderer preview route
  // In the renderer preview route, generate a real-time narrative from the updatable response
  // In the viewer route, use the snapshot narrative from response.text.div
  const isRendererPreviewRoute = location.pathname.includes('/renderer/preview');

  // Parse the HTML narrative string to a printable JSX element
  const parsedPrintableHTML = useMemo(() => {
    let htmlNarrative;

    // In the renderer preview route, generate a real-time narrative from the updatable response
    if (isRendererPreviewRoute) {
      htmlNarrative = qrToHTML(
        sourceQuestionnaire,
        removeEmptyAnswersFromResponse(sourceQuestionnaire, updatableResponse)
      );
    } else {
      // In the viewer route, use the snapshot narrative from response.text.div
      // htmlNarrative = updatableResponse?.text?.div ?? '';

      htmlNarrative = qrToHTML(
        sourceQuestionnaire,
        removeEmptyAnswersFromResponse(sourceQuestionnaire, updatableResponse)
      );
    }

    // Pre-process HTML narrative for printing
    htmlNarrative = processHtmlNarrativeForPrinting(htmlNarrative);

    // Parse HTML narrative to a JSX element
    return parse(htmlNarrative);
  }, [isRendererPreviewRoute, sourceQuestionnaire, updatableResponse]);

  const { componentRef } = useContext(PrintComponentRefContext);

  if (!sourceQuestionnaire.item || !updatableResponse.item) {
    return <FormInvalid />;
  }

  if (
    !sourceQuestionnaire.item ||
    !updatableResponse.item ||
    sourceQuestionnaire.item.length === 0 ||
    updatableResponse.item.length === 0
  ) {
    return <FormInvalid />;
  }

  return (
    <>
      <Helmet>
        <title>{sourceQuestionnaire?.title ?? 'Preview'}</title>
      </Helmet>
      <Fade in={true} timeout={500}>
        <Container sx={{ mt: 2 }}>
          <PageHeading>Preview</PageHeading>
          <Card sx={{ mb: 2, p: 4 }}>
            <Box ref={componentRef} data-test="response-preview-box">
              {parsedPrintableHTML}
            </Box>
          </Card>
        </Container>
      </Fade>
    </>
  );
}
