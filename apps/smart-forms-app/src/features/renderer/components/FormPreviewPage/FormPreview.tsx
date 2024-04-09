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

import { Card, Container, Fade } from '@mui/material';
import FormInvalid from '../FormPage/FormInvalid.tsx';
import parse from 'html-react-parser';
import { qrToHTML } from '../../../preview/utils/preview.ts';
import { Helmet } from 'react-helmet';
import PageHeading from '../../../dashboard/components/DashboardPages/PageHeading.tsx';
import {
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';

function FormPreview() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  if (!sourceQuestionnaire.item || !updatableResponse.item) {
    return <FormInvalid />;
  }

  if (sourceQuestionnaire.item.length === 0 && updatableResponse.item.length === 0) {
    return <FormInvalid />;
  }

  const cleanResponse = removeEmptyAnswersFromResponse(sourceQuestionnaire, updatableResponse);
  const parsedHTML = parse(qrToHTML(sourceQuestionnaire, cleanResponse));

  return (
    <>
      <Helmet>
        <title>{sourceQuestionnaire.title ?? 'Form Preview'}</title>
      </Helmet>
      <Fade in={true} timeout={500}>
        <Container sx={{ mt: 2 }}>
          <PageHeading>Preview</PageHeading>
          <Card sx={{ p: 4, mb: 2 }}>{parsedHTML}</Card>
        </Container>
      </Fade>
    </>
  );
}

export default FormPreview;
