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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  buildForm,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useTerminologyServerStore
} from '@aehrc/smart-forms-renderer';
import ViewerOperationItem from './ViewerOperationItem.tsx';
import type { QuestionnaireResponse } from 'fhir/r4';

function ViewerCloneResponseAction() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  const terminologyServerUrl = useTerminologyServerStore.use.url();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleClone() {
    setIsLoading(true);

    // Strip id, meta and authored so the response is treated as new when saved
    const newResponse: QuestionnaireResponse = { ...sourceResponse, status: 'in-progress' };
    delete newResponse.id;
    delete newResponse.meta;
    delete newResponse.authored;

    await buildForm({
      questionnaire: sourceQuestionnaire,
      questionnaireResponse: newResponse,
      terminologyServerUrl
    });

    // Pass isClone flag via router state so RendererLayout skips pre-population
    navigate('/renderer', { state: { isClone: true } });
    setIsLoading(false);
  }

  return (
    <ViewerOperationItem
      title="Clone Response"
      icon={<ContentCopyIcon />}
      disabled={isLoading}
      onClick={handleClone}
    />
  );
}

export default ViewerCloneResponseAction;
