/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 10.59 230.
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

import { useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import type { Questionnaire } from 'fhir/r4';
import useFetchQuestionnaires from '../../dashboard/hooks/useFetchQuestionnaires';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';

interface PlaygroundQuestionnairePickerProps {
  onBuild: (questionnaire: Questionnaire) => void;
}

function PlaygroundQuestionnairePicker(props: PlaygroundQuestionnairePickerProps) {
  const { onBuild } = props;

  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState('');

  const { questionnaires, fetchStatus, isInitialLoading, isFetching } = useFetchQuestionnaires(
    '',
    ''
  );

  const questionnaireIds = useMemo(
    () => questionnaires.map((questionnaire) => questionnaire.id),
    [questionnaires]
  );

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((questionnaire) => questionnaire.id === selectedQuestionnaireId),
    [questionnaires, selectedQuestionnaireId]
  );

  if (isInitialLoading || isFetching) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        gap={3}
        m={5.6}
        width="inherit"
        justifyContent="center">
        <CircularProgress size={24} sx={{ mb: 0.5 }} />
        <Typography variant="subtitle2">Loading questionnaires...</Typography>
      </Stack>
    );
  }

  if (fetchStatus === 'error') {
    return (
      <StyledAlert color="error">
        <Typography>Questionnaires failed to load.</Typography>
      </StyledAlert>
    );
  }

  return (
    <>
      {selectedQuestionnaireId === '' ? (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Or... pick a Questionnaire from our Forms Server
        </Typography>
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}
      {/* Questionnaire picker */}
      <Autocomplete
        options={questionnaireIds}
        getOptionLabel={(option) => `${option}`}
        value={!selectedQuestionnaireId ? null : selectedQuestionnaireId}
        onChange={(_, newValue) => setSelectedQuestionnaireId(newValue ?? '')}
        openOnFocus
        autoHighlight
        size="small"
        data-test="questionnaire-picker-playground"
        renderInput={(params) => <TextField {...params} />}
      />

      {/* Questionnaire details */}
      <Box pt={1} data-test="questionnaire-details-playground">
        {selectedQuestionnaire ? (
          <>
            <Grid container>
              <Grid item xs={1.5}>
                ID:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.id}</Typography>
              </Grid>

              <Grid item xs={1.5}>
                Title:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.title}</Typography>
              </Grid>

              <Grid item xs={1.5}>
                URL:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.url}</Typography>
              </Grid>

              <Grid item xs={1.5}>
                Version:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.version}</Typography>
              </Grid>
            </Grid>
            <Box display="flex">
              <Box flexGrow={1} />
              <Button
                data-test="picker-build-form-button-playground"
                onClick={() => onBuild(selectedQuestionnaire)}>
                Build Form
              </Button>
            </Box>
          </>
        ) : (
          <StyledAlert color="info">
            <Typography variant="body2" sx={{ mt: '0.5' }}>
              No questionnaire selected
            </Typography>
          </StyledAlert>
        )}
      </Box>
    </>
  );
}

export default PlaygroundQuestionnairePicker;
