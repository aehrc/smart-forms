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
import useFetchQuestionnaires from '../dashboard/hooks/useFetchQuestionnaires.ts';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import type { Questionnaire } from 'fhir/r4';
import { buildForm, destroyForm } from '@aehrc/smart-forms-renderer';

function SdcIdeQuestionnairePicker() {
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

  async function handleSetQuestionnaire(questionnaire: Questionnaire) {
    destroyForm();
    await buildForm(questionnaire);
  }

  if (isInitialLoading || isFetching) {
    return <Typography>Loading questionnaires...</Typography>;
  }

  if (fetchStatus === 'error') {
    return <Typography>Questionnaires failed to load.</Typography>;
  }

  return (
    <Box p={2}>
      {/* Questionnaire picker */}
      <Autocomplete
        options={questionnaireIds}
        getOptionLabel={(option) => `${option}`}
        value={selectedQuestionnaireId ?? null}
        onChange={(_, newValue) => setSelectedQuestionnaireId(newValue ?? '')}
        openOnFocus
        autoHighlight
        size="small"
        renderInput={(params) => <TextField {...params} />}
      />

      {/* Questionnaire details */}
      <Box pt={2}>
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

              <Grid item xs={1.5}>
                Status:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.status}</Typography>
              </Grid>

              <Grid item xs={1.5}>
                Date:
              </Grid>
              <Grid item xs={10.5}>
                <Typography mb={1}>{selectedQuestionnaire.date}</Typography>
              </Grid>
            </Grid>
            <Box display="flex">
              <Box flexGrow={1} />
              <Button onClick={() => handleSetQuestionnaire(selectedQuestionnaire)}>
                Use Questionnaire in IDE
              </Button>
            </Box>
          </>
        ) : (
          <Typography variant="body2" sx={{ mt: '0.5' }}>
            No questionnaire selected
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default SdcIdeQuestionnairePicker;
