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
import type { QuestionnaireItem } from 'fhir/r4';
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { syncXFhirQueries } from '@aehrc/sdc-populate';
import { useQuestionnaireStore, useSmartConfigStore } from '../../../stores';
import { fetchResourceCallback } from '../../../stories/storybookWrappers/populateCallbackForStorybook';

// FIXME poc of sync button - https://smartforms.csiro.au/ig/StructureDefinition/GranularRepopulateSync

interface TempCalculatedExpressionSyncButtonProps {
  qItem: QuestionnaireItem;
  disabled: boolean;
}

function TempCalculatedExpressionSyncButton(props: TempCalculatedExpressionSyncButtonProps) {
  const { qItem, disabled } = props;

  const client = useSmartConfigStore.use.client();
  const patient = useSmartConfigStore.use.patient();
  const user = useSmartConfigStore.use.user();
  const encounter = useSmartConfigStore.use.encounter();
  const fhirContext = useSmartConfigStore.use.fhirContext();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const [spinning, setSpinning] = useState(false);

  const xFhirQueriesToSync = useMemo(() => {
    return (qItem.extension
      ?.filter(
        (ext) =>
          ext.url === 'https://smartforms.csiro.au/ig/StructureDefinition/GranularRepopulateSync' &&
          !!ext.valueIdentifier?.value
      )
      .map((ext) => ext.valueIdentifier?.value) ?? []) as string[];
  }, [qItem.extension]);

  async function handleClick() {
    if (spinning) {
      return;
    }

    if (!client || !patient) {
      console.warn('GranularRepopulateSync: Client or patient is not available');
      return;
    }

    if (xFhirQueriesToSync.length === 0) {
      return null;
    }

    setSpinning(true);
    const evaluatedQueries = await syncXFhirQueries({
      xFhirQueries: xFhirQueriesToSync,
      questionnaire: sourceQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: client.state.serverUrl,
        authToken: client.state.tokenResponse?.access_token ?? ''
      },
      patient,
      user: user ?? undefined,
      encounter: encounter ?? undefined,
      fhirContext: fhirContext ?? undefined
    });
    setSpinning(false);

    console.log('Sync button clicked', evaluatedQueries);
  }

  if (xFhirQueriesToSync.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        ...(spinning && { cursor: 'default' })
      }}>
      <IconButton
        title="Sync with server"
        size="small"
        onClick={handleClick}
        disabled={disabled || spinning}>
        <Box
          sx={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {spinning ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <RefreshIcon fontSize="small" />
          )}
        </Box>
      </IconButton>
    </Box>
  );
}

export default TempCalculatedExpressionSyncButton;
