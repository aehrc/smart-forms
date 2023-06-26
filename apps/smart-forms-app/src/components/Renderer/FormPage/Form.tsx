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

import { createContext, useContext, useEffect, useState } from 'react';
import { Box, Container, Divider, Fade, Typography } from '@mui/material';
import type { Coding, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import FormBodyTabbed from './FormBodyTabbed';
import { containsTabs, isTabContainer } from '../../../features/renderer/utils/tabs.ts';
import { QuestionnaireProviderContext } from '../../../App';
import { EnableWhenContext } from '../../../features/enableWhen/contexts/EnableWhenContext.tsx';
import FormInvalid from './FormInvalid';
import QTitle from './QFormComponents/QItemParts/QTitle';
import QItemGroup from './QFormComponents/QItemGroup';
import { CalculatedExpressionContext } from '../../../features/calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import RendererDebugFooter from '../RendererDebugFooter/RendererDebugFooter';
import { DebugModeContext } from '../../../features/debug/contexts/DebugModeContext.tsx';
import { Helmet } from 'react-helmet';
import QItemSwitcher from './QFormComponents/QItemSwitcher.tsx';
import { EnableWhenExpressionContext } from '../../../features/enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import { RendererContext } from '../../../features/renderer/contexts/RendererContext.ts';
import { CurrentTabIndexContext } from '../../../features/renderer/contexts/CurrentTabIndexContext.ts';

export const PreprocessedValueSetContext = createContext<Record<string, Coding[]>>({});

function Form() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const { renderer, setRenderer } = useContext(RendererContext);
  const { currentTabIndex } = useContext(CurrentTabIndexContext);

  const enableWhenContext = useContext(EnableWhenContext);
  const { updateCalculatedExpressions } = useContext(CalculatedExpressionContext);
  const { initEnableWhenExpressions, updateEnableWhenExpressions } = useContext(
    EnableWhenExpressionContext
  );
  const { debugMode } = useContext(DebugModeContext);

  const [preprocessedValueSetCodings] = useState<Record<string, Coding[]>>(
    questionnaireProvider.preprocessedValueSetCodings
  );

  const { response } = renderer;
  const questionnaire = questionnaireProvider.questionnaire;

  useEffect(
    () => {
      enableWhenContext.setItems(questionnaireProvider.enableWhenItems, response);
      initEnableWhenExpressions(
        questionnaireProvider.enableWhenExpressions,
        response,
        questionnaireProvider.variables.fhirPathVariables
      );
    },
    // init enableWhen items on first entry into renderer, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const topLevelQItems = questionnaire.item;
  const topLevelQRItems = response.item;

  if (!topLevelQItems || !topLevelQRItems) {
    return <FormInvalid questionnaire={questionnaire} />;
  }

  // event handlers
  function onTopLevelQRItemChange(newTopLevelQItem: QuestionnaireResponseItem, index: number) {
    if (!response.item || response.item.length === 0) {
      return;
    }

    const updatedItems = [...response.item]; // Copy the original array of items
    updatedItems[index] = newTopLevelQItem; // Modify the item at the specified index

    const updatedResponse: QuestionnaireResponse = {
      ...response,
      item: updatedItems
    };

    updateEnableWhenExpressions(updatedResponse, questionnaireProvider.variables.fhirPathVariables);
    updateCalculatedExpressions(updatedResponse, questionnaireProvider.variables.fhirPathVariables);
    setRenderer({ response: updatedResponse, hasChanges: true });
  }

  if (topLevelQItems[0] && topLevelQRItems[0]) {
    return (
      <>
        <Helmet>
          <title>{questionnaire.title ? questionnaire.title : 'Form Renderer'}</title>
        </Helmet>
        <PreprocessedValueSetContext.Provider value={preprocessedValueSetCodings}>
          <Fade in={true} timeout={500}>
            <Container disableGutters maxWidth="xl" sx={{ px: 2 }}>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="h3" data-test="form-heading">
                  <QTitle questionnaire={questionnaire} />
                </Typography>
              </Box>
              <Divider light sx={{ my: 1.5 }} />
              {topLevelQItems.map((qItem, index) => {
                const qrItem = topLevelQRItems[index];
                return containsTabs(qItem) || isTabContainer(qItem) ? (
                  <FormBodyTabbed
                    key={qItem.linkId}
                    topLevelQItem={qItem}
                    topLevelQRItem={qrItem}
                    currentTabIndex={currentTabIndex}
                    hasTabContainer={isTabContainer(qItem)}
                    onQrItemChange={(newTopLevelQRItem) =>
                      onTopLevelQRItemChange(newTopLevelQRItem, index)
                    }
                  />
                ) : // If form is untabbed, it is rendered as a regular group
                qItem.type === 'group' ? (
                  <QItemGroup
                    key={qItem.linkId}
                    qItem={qItem}
                    qrItem={qrItem}
                    groupCardElevation={1}
                    onQrItemChange={(newTopLevelQRItem) =>
                      onTopLevelQRItemChange(newTopLevelQRItem, index)
                    }
                    isRepeated={false}
                  />
                ) : (
                  <QItemSwitcher
                    key={qItem.linkId}
                    qItem={qItem}
                    qrItem={qrItem}
                    isTabled={false}
                    onQrItemChange={(newTopLevelQRItem) =>
                      onTopLevelQRItemChange(newTopLevelQRItem, index)
                    }
                    isRepeated={false}
                  />
                );
              })}
            </Container>
          </Fade>
          {debugMode ? <RendererDebugFooter /> : null}
        </PreprocessedValueSetContext.Provider>
      </>
    );
  } else {
    return <FormInvalid questionnaire={questionnaire} />;
  }
}

export default Form;
