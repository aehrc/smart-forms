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

import FormRenderer from '../../renderer/components/FormPage/FormRenderer/FormRenderer.tsx';
import { createQuestionnaireResponse } from '../../renderer/utils/qrItem.ts';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../stores/useQuestionnaireResponseStore.ts';

function PlaygroundRenderer() {
  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);

  const buildSourceResponse = useQuestionnaireResponseStore((state) => state.buildSourceResponse);

  // Fill questionnaireResponse with questionnaire details if questionnaireResponse is in a clean state
  const questionnaireResponse = createQuestionnaireResponse(sourceQuestionnaire);
  buildSourceResponse(questionnaireResponse);

  return <FormRenderer />;
}

export default PlaygroundRenderer;
