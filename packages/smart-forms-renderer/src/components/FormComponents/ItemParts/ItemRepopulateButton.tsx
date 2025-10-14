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

import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import {
  useQuestionnaireStore,
  useSmartConfigStore,
  useTerminologyServerStore
} from '../../../stores';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQuestionnaireResponseItem } from '../../../utils/misc';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningIcon from '@mui/icons-material/Warning';
import { fetchResourceCallback, fetchTerminologyCallback } from '../../../api/callback';

type RepopulationState = 'success' | 'idle' | 'loading' | 'error';

interface ItemRepopulateButtonProps {
  qItem: QuestionnaireItem;
  repopulatable: boolean;
  onRepopulate: (newQrItem: QuestionnaireResponseItem | null) => unknown;
}

function ItemRepopulateButton(props: ItemRepopulateButtonProps) {
  const { qItem, repopulatable, onRepopulate } = props;

  const client = useSmartConfigStore.use.client();
  const patient = useSmartConfigStore.use.patient();
  const user = useSmartConfigStore.use.user();
  const encounter = useSmartConfigStore.use.encounter();
  const fhirContext = useSmartConfigStore.use.fhirContext();

  const defaultTerminologyServerUrl = useTerminologyServerStore.use.url();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const [repopulationState, setRepopulationState] = useState<RepopulationState>('idle');

  // On success, set state to successful and set back to idle after 5 seconds
  useEffect(() => {
    if (repopulationState === 'success' || repopulationState === 'error') {
      const timer = setTimeout(() => {
        setRepopulationState('idle');
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [repopulationState]);

  async function handleClick() {
    if (!client || !patient || !user) {
      setRepopulationState('error');
      console.warn(
        'ItemRepopulateButton: fhirClient, patient or user is not available. Load it via useSmartConfigStore first.'
      );
      return;
    }

    setRepopulationState('loading');

    const { populateSuccess, populateResult } = await populateQuestionnaire({
      questionnaire: sourceQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: client.state.serverUrl,
        authToken: client.state.tokenResponse?.access_token ?? ''
      },
      patient: patient,
      user: user,
      encounter: encounter ?? undefined,
      fhirContext: fhirContext ?? undefined,
      fetchTerminologyCallback: fetchTerminologyCallback,
      fetchTerminologyRequestConfig: {
        terminologyServerUrl: defaultTerminologyServerUrl
      }
    });

    if (!populateSuccess || !populateResult) {
      setRepopulationState('error');
      return;
    }

    setRepopulationState('success');
    const { populatedResponse } = populateResult;

    const newQuestionnaireResponseItem = getQuestionnaireResponseItem(
      populatedResponse,
      qItem.linkId
    );
    onRepopulate(newQuestionnaireResponseItem ?? null);
  }

  if (!repopulatable) {
    return null;
  }

  if (repopulationState === 'success') {
    return (
      <Box
        title="Sync successful"
        sx={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <TaskAltIcon fontSize="small" color="success" />
      </Box>
    );
  }

  if (repopulationState === 'error') {
    return (
      <Box
        title={`Unable to sync item "${qItem.text ?? qItem.linkId}".`}
        sx={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <WarningIcon fontSize="small" color="warning" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        cursor: repopulationState === 'loading' ? 'wait' : 'pointer'
      }}>
      {
        <IconButton
          title="Sync with server"
          size="small"
          onClick={handleClick}
          disabled={repopulationState === 'loading'}>
          <Box
            sx={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {repopulationState === 'loading' ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </Box>
        </IconButton>
      }
    </Box>
  );
}

export default ItemRepopulateButton;
