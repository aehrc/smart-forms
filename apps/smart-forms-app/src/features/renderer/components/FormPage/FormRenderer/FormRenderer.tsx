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

import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import RendererDebugFooter from '../../RendererDebugFooter/RendererDebugFooter.tsx';
import { Helmet } from 'react-helmet';
import Form from './Form.tsx';
import useQuestionnaireStore from '../../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../../stores/useQuestionnaireResponseStore.ts';
import useConfigStore from '../../../../../stores/useConfigStore.ts';

function FormRenderer() {
  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updateExpressions = useQuestionnaireStore((state) => state.updateExpressions);
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const updateResponse = useQuestionnaireResponseStore((state) => state.updateResponse);

  const debugMode = useConfigStore((state) => state.debugMode);

  const topLevelQItems = sourceQuestionnaire.item;
  const topLevelQRItems = updatableResponse.item;

  // event handlers
  function handleTopLevelQRItemChange(newTopLevelQItem: QuestionnaireResponseItem, index: number) {
    if (!updatableResponse.item || updatableResponse.item.length === 0) {
      return;
    }

    const updatedItems = [...updatableResponse.item]; // Copy the original array of items
    updatedItems[index] = newTopLevelQItem; // Modify the item at the specified index

    const updatedResponse: QuestionnaireResponse = {
      ...updatableResponse,
      item: updatedItems
    };

    updateExpressions(updatedResponse);
    updateResponse(updatedResponse);
  }

  return (
    <>
      <Helmet>
        <title>{sourceQuestionnaire.title ?? 'Form Renderer'}</title>
      </Helmet>

      <Form
        questionnaire={sourceQuestionnaire}
        topLevelQItems={topLevelQItems}
        topLevelQRItems={topLevelQRItems}
        onTopLevelQRItemChange={handleTopLevelQRItemChange}
      />

      {/* Debug footer */}
      {debugMode ? <RendererDebugFooter /> : null}
    </>
  );
}

export default FormRenderer;
