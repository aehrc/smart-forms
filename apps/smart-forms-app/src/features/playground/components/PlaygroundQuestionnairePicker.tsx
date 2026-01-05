/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { useContext, useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import type { Questionnaire } from 'fhir/r4';
import useFetchQuestionnaires from '../../dashboard/hooks/useFetchQuestionnaires';
import { StyledAlert } from '../../../components/Nav/Nav.styles.ts';
import { ConfigContext } from '../../configChecker/contexts/ConfigContext.tsx';

interface PlaygroundQuestionnairePickerProps {
  onBuild: (questionnaire: Questionnaire) => void;
}

function PlaygroundQuestionnairePicker(props: PlaygroundQuestionnairePickerProps) {
  const { onBuild } = props;

  const { config } = useContext(ConfigContext);

  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState('');

  const { questionnaires, fetchStatus, isLoading, isFetching } = useFetchQuestionnaires(
    '',
    '',
    true
  );

  const questionnaireIds = useMemo(
    () => questionnaires.map((questionnaire) => questionnaire.id),
    [questionnaires]
  );

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((questionnaire) => questionnaire.id === selectedQuestionnaireId),
    [questionnaires, selectedQuestionnaireId]
  );

  if (isLoading || isFetching) {
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

  const resolvableUrl = `${config.formsServerUrl}/Questionnaire/${selectedQuestionnaireId}`;

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
              <Grid size={{ xs: 2 }}>
                <b>ID:</b>
              </Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedQuestionnaire.id}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>
                <b>Title:</b>
              </Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedQuestionnaire.title}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>
                <b>Canonical URL:</b>
              </Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedQuestionnaire.url}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>
                <b>Version:</b>
              </Grid>
              <Grid size={{ xs: 10 }}>
                <Typography mb={1}>{selectedQuestionnaire.version}</Typography>
              </Grid>

              <Grid size={{ xs: 2 }}>
                <b>Resolvable URL:</b>
              </Grid>
              <Grid size={{ xs: 10 }}>
                <Link href={resolvableUrl} target="_blank" rel="noreferrer">
                  {resolvableUrl}
                </Link>
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="end" mt={1} gap={1}>
              <Button
                component="a"
                href={`https://fhirpath-lab.com/Questionnaire/tester?tab=questionnaire,csiro%20renderer&id=${resolvableUrl}`}
                target="_blank"
                rel="noopener"
                endIcon={<OpenInNewIcon />}>
                Open in fhirpath-lab
              </Button>
              <Button
                data-test="picker-build-form-button-playground"
                onClick={() => onBuild(selectedQuestionnaire)}
                endIcon={<PlayCircleIcon />}>
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
