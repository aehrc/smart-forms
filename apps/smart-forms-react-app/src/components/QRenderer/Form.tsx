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

import React, { useContext, useEffect, useState } from 'react';
import { Box, Container, Divider, Fade, Typography } from '@mui/material';
import type { Coding, QuestionnaireResponseItem } from 'fhir/r5';
import FormBodyTabbed from './FormBodyTabbed';
import { containsTabs } from '../../functions/TabFunctions';
import { QuestionnaireProviderContext } from '../../App';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import FormInvalid from './FormInvalid';
import QTitle from './QFormComponents/QItemParts/QTitle';
import QItemGroup from './QFormComponents/QItemGroup';
import { CalculatedExpressionContext } from '../../custom-contexts/CalculatedExpressionContext';
import { CurrentTabIndexContext, RendererContext } from '../Renderer/RendererLayout';
import RendererDebugFooter from '../Renderer/RendererDebugFooter/RendererDebugFooter';
import { DebugModeContext } from '../../Router';
import { Helmet } from 'react-helmet';

export const PreprocessedValueSetContext = React.createContext<Record<string, Coding[]>>({});

function Form() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const { renderer, setRenderer } = useContext(RendererContext);
  const { currentTabIndex } = useContext(CurrentTabIndexContext);

  const enableWhenContext = useContext(EnableWhenContext);
  const { updateCalculatedExpressions } = useContext(CalculatedExpressionContext);
  const { debugMode } = useContext(DebugModeContext);

  const [preprocessedValueSetCodings] = useState<Record<string, Coding[]>>(
    questionnaireProvider.preprocessedValueSetCodings
  );

  let qrForm: QuestionnaireResponseItem = {
    linkId: ''
  };

  useEffect(() => {
    enableWhenContext.setItems(questionnaireProvider.enableWhenItems, qrForm);
  }, []); // init enableWhen items on first entry into renderer, leave dependency array empty

  const questionnaire = questionnaireProvider.questionnaire;
  const { response } = renderer;

  if (!questionnaire.item || !response.item) return <FormInvalid />;

  const qForm = questionnaire.item[0];
  qrForm = response.item[0];

  function onQrFormChange(newQrForm: QuestionnaireResponseItem) {
    const updatedResponse = {
      ...response,
      item: [newQrForm]
    };

    updateCalculatedExpressions(updatedResponse, questionnaireProvider.variables);
    setRenderer({ response: updatedResponse, hasChanges: true });
  }

  if (qForm.item && qrForm.item) {
    return (
      <>
        <Helmet>
          <title>{questionnaire.title ? questionnaire.title : 'Form Renderer'}</title>
        </Helmet>
        <PreprocessedValueSetContext.Provider value={preprocessedValueSetCodings}>
          <Fade in={true} timeout={500}>
            <Container disableGutters maxWidth="xl" sx={{ px: 2 }}>
              <Box>
                <Typography variant="h3" data-test="form-heading">
                  <QTitle questionnaire={questionnaire} />
                </Typography>
              </Box>
              <Divider light sx={{ my: 1.5 }} />
              {containsTabs(qForm.item) ? (
                <FormBodyTabbed
                  qForm={qForm}
                  qrForm={qrForm}
                  currentTabIndex={currentTabIndex}
                  onQrItemChange={(newQrForm) => onQrFormChange(newQrForm)}
                />
              ) : (
                // If form is untabbed, it is rendered as a regular group
                <QItemGroup
                  qItem={qForm}
                  qrItem={qrForm}
                  groupCardElevation={1}
                  onQrItemChange={(newQrForm) => onQrFormChange(newQrForm)}
                  isRepeated={false}
                />
              )}
            </Container>
          </Fade>
          {debugMode ? <RendererDebugFooter /> : null}
        </PreprocessedValueSetContext.Provider>
      </>
    );
  } else {
    return <FormInvalid />;
  }
}

export default Form;
