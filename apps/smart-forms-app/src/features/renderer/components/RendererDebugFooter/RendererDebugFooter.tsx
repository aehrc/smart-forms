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

import { StyledRoot } from '../../../../components/DebugFooter/DebugFooter.styles.ts';
import { useState } from 'react';
import DebugPanel from './DebugPanel.tsx';
import RendererDebugBar from './RendererDebugBar.tsx';
import {
  initialiseQuestionnaireResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';

function RendererDebugFooter() {
  const [isHidden, setIsHidden] = useState(true);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const fhirPathContext = useQuestionnaireStore.use.fhirPathContext();
  const populatedContext = useQuestionnaireStore.use.populatedContext();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const updatableResponseItems = useQuestionnaireResponseStore.use.updatableResponseItems();

  const setUpdatableResponseAsEmpty =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsEmpty();
  const updateExpressions = useQuestionnaireStore.use.updateExpressions();

  function handleClearExistingResponse() {
    const clearedResponse = initialiseQuestionnaireResponse(sourceQuestionnaire);

    setUpdatableResponseAsEmpty(clearedResponse);
    updateExpressions(clearedResponse);
  }

  return (
    <>
      {isHidden ? null : (
        <DebugPanel
          questionnaire={sourceQuestionnaire}
          questionnaireResponse={updatableResponse}
          questionnaireResponseItems={updatableResponseItems}
          fhirPathContext={fhirPathContext}
          populatedContext={populatedContext}
          clearQResponse={() => handleClearExistingResponse()}
        />
      )}
      <StyledRoot>
        <RendererDebugBar isHidden={isHidden} toggleIsHidden={(checked) => setIsHidden(checked)} />
      </StyledRoot>
    </>
  );
}

export default RendererDebugFooter;
