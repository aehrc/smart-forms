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

import { useContext, useState } from 'react';
import EnableWhenContextProvider from '../../features/enableWhen/contexts/EnableWhenContext.tsx';
import CalculatedExpressionContextProvider from '../../features/calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import CachedQueriedValueSetContextProvider from '../../features/valueSet/contexts/CachedQueriedValueSetContext.tsx';
import { CurrentTabIndexContext, RendererContext } from '../Renderer/RendererLayout.tsx';
import Form from '../Renderer/FormPage/Form.tsx';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App.tsx';
import type { QuestionnaireResponse } from 'fhir/r4';
import { createQuestionnaireResponse } from '../../features/renderer/utils/qrItem.ts';
import EnableWhenExpressionContextProvider from '../../features/enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import type { Renderer } from '../../features/renderer/types/renderer.interface.ts';

function PlaygroundRenderer() {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);

  // Fill questionnaireResponse with questionnaire details if questionnaireResponse is in a clean state
  let initialResponse: QuestionnaireResponse;
  if (questionnaireProvider.questionnaire.item && !questionnaireResponseProvider.response.item) {
    initialResponse = createQuestionnaireResponse(
      questionnaireProvider.questionnaire.id,
      questionnaireProvider.questionnaire.item[0]
    );
    questionnaireResponseProvider.setQuestionnaireResponse(initialResponse);
  } else {
    initialResponse = questionnaireResponseProvider.response;
  }

  const [renderer, setRenderer] = useState<Renderer>({
    response: initialResponse,
    hasChanges: false
  });

  return (
    <RendererContext.Provider value={{ renderer, setRenderer }}>
      <EnableWhenContextProvider>
        <CalculatedExpressionContextProvider>
          <EnableWhenExpressionContextProvider>
            <CachedQueriedValueSetContextProvider>
              <CurrentTabIndexContext.Provider value={{ currentTabIndex, setCurrentTabIndex }}>
                <Form />
              </CurrentTabIndexContext.Provider>
            </CachedQueriedValueSetContextProvider>
          </EnableWhenExpressionContextProvider>
        </CalculatedExpressionContextProvider>
      </EnableWhenContextProvider>
    </RendererContext.Provider>
  );
}

export default PlaygroundRenderer;
