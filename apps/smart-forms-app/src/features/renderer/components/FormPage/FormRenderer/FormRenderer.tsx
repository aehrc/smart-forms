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

import { createContext, useContext, useState } from 'react';
import type { Coding, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { QuestionnaireProviderContext } from '../../../../../App.tsx';
import { CalculatedExpressionContext } from '../../../../calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import RendererDebugFooter from '../../RendererDebugFooter/RendererDebugFooter.tsx';
import { DebugModeContext } from '../../../../debug/contexts/DebugModeContext.tsx';
import { Helmet } from 'react-helmet';
import { EnableWhenExpressionContext } from '../../../../enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import { RendererContext } from '../../../contexts/RendererContext.ts';
import useInitialiseForm from '../../../hooks/useInitialiseForm.ts';
import Form from './Form.tsx';

export const PreprocessedValueSetContext = createContext<Record<string, Coding[]>>({});

function FormRenderer() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const { renderer, setRenderer } = useContext(RendererContext);

  const { updateCalculatedExpressions } = useContext(CalculatedExpressionContext);
  const { updateEnableWhenExpressions } = useContext(EnableWhenExpressionContext);

  const { isDebugMode } = useContext(DebugModeContext);

  const [preprocessedValueSetCodings] = useState<Record<string, Coding[]>>(
    questionnaireProvider.preprocessedValueSetCodings
  );

  const { response } = renderer;
  const questionnaire = questionnaireProvider.questionnaire;

  useInitialiseForm();

  const topLevelQItems = questionnaire.item;
  const topLevelQRItems = response.item;

  // event handlers
  function handleTopLevelQRItemChange(newTopLevelQItem: QuestionnaireResponseItem, index: number) {
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

  return (
    <PreprocessedValueSetContext.Provider value={preprocessedValueSetCodings}>
      <Helmet>
        <title>{questionnaire.title ? questionnaire.title : 'Form Renderer'}</title>
      </Helmet>

      <Form
        questionnaire={questionnaire}
        topLevelQItems={topLevelQItems}
        topLevelQRItems={topLevelQRItems}
        onTopLevelQRItemChange={handleTopLevelQRItemChange}
      />

      {/* Debug footer */}
      {isDebugMode ? <RendererDebugFooter /> : null}
    </PreprocessedValueSetContext.Provider>
  );
}

export default FormRenderer;
