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

import { useState } from 'react';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import { createQuestionnaireResponse } from '../../../../../renderer/utils/qrItem.ts';
import { useNavigate } from 'react-router-dom';
import { postQuestionnaireToSMARTHealthIT } from '../../../../../save/api/saveQr.ts';
import type { SelectedQuestionnaire } from '../../../../types/list.interface.ts';
import useQuestionnaireStore from '../../../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../../../stores/useQuestionnaireResponseStore.ts';
import useConfigStore from '../../../../../../stores/useConfigStore.ts';
import { LoadingButton } from '@mui/lab';

interface Props {
  selectedQuestionnaire: SelectedQuestionnaire | null;
}

function CreateNewResponseButton(props: Props) {
  const { selectedQuestionnaire } = props;

  const smartClient = useConfigStore((state) => state.smartClient);
  const buildSourceQuestionnaire = useQuestionnaireStore((state) => state.buildSourceQuestionnaire);
  const buildSourceResponse = useQuestionnaireResponseStore((state) => state.buildSourceResponse);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!selectedQuestionnaire) return;

    setIsLoading(true);

    const questionnaire = selectedQuestionnaire.resource;

    // Post questionnaire to client if it is SMART Health IT and its variants
    if (smartClient?.state.serverUrl.includes('/v/r4/fhir')) {
      questionnaire.id = questionnaire.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(smartClient, questionnaire);
    }

    // Assign questionnaire to questionnaire provider
    await buildSourceQuestionnaire(questionnaire);

    // Assign questionnaireResponse to questionnaireResponse provider
    const questionnaireResponse = createQuestionnaireResponse(questionnaire);
    buildSourceResponse(questionnaireResponse);

    navigate('/renderer');
    setIsLoading(false);
  }

  return (
    <LoadingButton
      variant="contained"
      disabled={!selectedQuestionnaire?.listItem}
      loading={isLoading}
      loadingPosition="end"
      endIcon={<Iconify icon="ant-design:form-outlined" />}
      sx={{
        px: 2.5,
        backgroundColor: 'secondary.main',
        '&:hover': {
          backgroundColor: 'secondary.dark'
        }
      }}
      data-test="button-create-response"
      onClick={handleClick}>
      Create response
    </LoadingButton>
  );
}

export default CreateNewResponseButton;
