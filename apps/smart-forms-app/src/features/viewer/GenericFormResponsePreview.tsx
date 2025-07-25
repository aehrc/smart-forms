import { Box, Card, Container, Fade } from '@mui/material';
import parse from 'html-react-parser';
import { Helmet } from 'react-helmet';
import PageHeading from '../dashboard/components/DashboardPages/PageHeading.tsx';
import { qrToHTML } from '../preview/utils/preview.ts';
import { PrintComponentRefContext } from './ViewerLayout.tsx';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import FormInvalid from '../renderer/components/FormPage/FormInvalid.tsx';

/**
 * GenericFormResponsePreview is a component that renders a read-only HTML preview of a completed FHIR QuestionnaireResponse.
 *
 * It determines whether to use the updatable response (used in editing mode via `/viewer/viaRendererPreview`)
 * or the original source response for rendering, and then converts the response into XHTML using `qrToHTML`.
 * If no valid questionnaire or response exists, it renders a fallback FormInvalid component.
 *
 * Parsed XHTML is displayed inside a Material UI Card with a print ref wrapper, allowing integration with
 * the printing workflow via `PrintComponentRefContext`.
 *
 * @returns {JSX.Element} Rendered HTML preview of the QuestionnaireResponse or FormInvalid if data is invalid.
 */
export default function GenericFormResponsePreview() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const location = useLocation();
  // Check if the path includes a specific route segment
  const useUpdatableResponse = location.pathname.includes('/viewer/viaRendererPreview');

  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  if (useUpdatableResponse) {
    console.log('Using Updatable Response');
  } else {
    console.log('Using source response');
  }

  const responseToUse = useUpdatableResponse ? updatableResponse : sourceResponse;

  console.log('useUpdatableResonse = ' + useUpdatableResponse);
  console.log('IN Generic Form Response Preview');
  // TODO Determine if updatebleResponse or sourceResponse to use.

  const { componentRef } = useContext(PrintComponentRefContext);

  if (!sourceQuestionnaire.item || !updatableResponse.item) {
    return <FormInvalid />;
  }

  if (
    !sourceQuestionnaire.item ||
    !responseToUse.item ||
    (sourceQuestionnaire.item.length === 0 && responseToUse.item.length === 0)
  ) {
    return <FormInvalid />;
  }

  let responseHtmlDiv = '';

  if (useUpdatableResponse) {
    responseHtmlDiv = qrToHTML(
      sourceQuestionnaire,
      removeEmptyAnswersFromResponse(sourceQuestionnaire, responseToUse)
    );
  } else {
    responseHtmlDiv = responseToUse?.text?.div ?? '';
  }

  const parsedHTML = parse(responseHtmlDiv);

  return (
    <>
      <Helmet>
        <title>{sourceQuestionnaire?.title ?? 'Preview'}</title>
      </Helmet>
      <Fade in={true} timeout={500}>
        <Container sx={{ mt: 2 }}>
          <PageHeading>{'Preview'}</PageHeading>
          <Card sx={{ mb: 2 }}>
            <Box ref={componentRef} data-test="response-preview-box" sx={{ p: 4 }}>
              {parsedHTML}
            </Box>
          </Card>
        </Container>
      </Fade>
    </>
  );
}
