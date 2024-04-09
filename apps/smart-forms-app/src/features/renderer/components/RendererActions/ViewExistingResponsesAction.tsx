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

import type { SpeedDialActionProps } from '@mui/material';
import { SpeedDialAction } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';
import ExistingResponsesBadgeIcon from '../RendererNav/ExistingResponsesBadgeIcon.tsx';
import { useMemo } from 'react';
import useSelectedQuestionnaire from '../../../dashboard/hooks/useSelectedQuestionnaire.ts';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import type { QuestionnaireResponse } from 'fhir/r4';

interface ViewExistingResponsesActionProps extends SpeedDialActionProps {
  existingResponses: QuestionnaireResponse[];
  fetchResponsesError: unknown;
  isSpeedDial?: boolean;
}

function ViewExistingResponsesAction(props: ViewExistingResponsesActionProps) {
  const { existingResponses, fetchResponsesError, isSpeedDial, ...speedDialActionProps } = props;

  const { launchQuestionnaire } = useSmartClient();

  const draftExistingResponses = useMemo(
    () => existingResponses.map((response) => response.status === 'in-progress'),
    [existingResponses]
  );

  const { setSelectedQuestionnaire } = useSelectedQuestionnaire();

  const { closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  function handleViewExistingResponses() {
    closeSnackbar();
    setSelectedQuestionnaire(launchQuestionnaire);
    navigate('/dashboard/existing');
  }

  if (isSpeedDial) {
    return (
      <SpeedDialAction
        icon={
          <ExistingResponsesBadgeIcon
            numOfDraftResponses={draftExistingResponses.length}
            fetchError={fetchResponsesError}
          />
        }
        tooltipTitle="View Existing Responses"
        tooltipOpen
        onClick={handleViewExistingResponses}
        {...speedDialActionProps}
      />
    );
  }

  return (
    <RendererOperationItem
      title="View Existing Responses"
      icon={
        <ExistingResponsesBadgeIcon
          numOfDraftResponses={draftExistingResponses.length}
          fetchError={fetchResponsesError}
        />
      }
      onClick={handleViewExistingResponses}
    />
  );
}

export default ViewExistingResponsesAction;
