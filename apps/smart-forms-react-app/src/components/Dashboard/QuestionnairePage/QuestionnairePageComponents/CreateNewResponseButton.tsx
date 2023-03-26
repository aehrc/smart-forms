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

import { Button, CircularProgress } from '@mui/material';
import React, { useContext, useState } from 'react';
import type { SelectedQuestionnaire } from '../../../../interfaces/Interfaces';
import Iconify from '../../../Misc/Iconify';
import {
  QuestionnaireProviderContext,
  QuestionnaireResponseProviderContext
} from '../../../../App';
import { createQuestionnaireResponse } from '../../../../functions/QrItemFunctions';
import { useNavigate } from 'react-router-dom';
import { postQuestionnaireToSMARTHealthIT } from '../../../../functions/SaveQrFunctions';
import { LaunchContext } from '../../../../custom-contexts/LaunchContext';

interface Props {
  selectedQuestionnaire: SelectedQuestionnaire | null;
}

function CreateNewResponseButton(props: Props) {
  const { selectedQuestionnaire } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!selectedQuestionnaire) return;

    setIsLoading(true);

    const questionnaireResource = selectedQuestionnaire.resource;

    // Post questionnaire to client if it is SMART Health IT and its variants
    if (fhirClient?.state.serverUrl.includes('/v/r4/fhir')) {
      questionnaireResource.id = questionnaireResource.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(fhirClient, questionnaireResource);
    }

    // Assign questionnaire to questionnaire provider
    await questionnaireProvider.setQuestionnaire(questionnaireResource);

    // Assign questionnaireResponse to questionnaireResponse provider
    if (questionnaireResource.item && questionnaireResource.item.length > 0) {
      questionnaireResponseProvider.setQuestionnaireResponse(
        createQuestionnaireResponse(questionnaireResource.id, questionnaireResource.item[0])
      );
    }
    navigate('/renderer');

    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedQuestionnaire?.listItem}
      endIcon={
        isLoading ? (
          <CircularProgress size={20} sx={{ color: 'common.white' }} />
        ) : (
          <Iconify icon="ant-design:form-outlined" />
        )
      }
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
    </Button>
  );
}

export default CreateNewResponseButton;
