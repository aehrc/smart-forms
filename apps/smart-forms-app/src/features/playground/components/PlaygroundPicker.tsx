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

// @ts-ignore
import { Box, Stack, Typography } from '@mui/material';
import FileCollector from './FileCollector.tsx';
import type { Patient, Practitioner, Questionnaire } from 'fhir/r4';
import PlaygroundQuestionnairePicker from './PlaygroundQuestionnairePicker.tsx';
import useLaunchContextNames from '../hooks/useLaunchContextNames.ts';

interface PlaygroundPickerProps {
  patient: Patient | null;
  user: Practitioner | null;
  onBuildQuestionnaireFromFile: (file: File) => void;
  onBuildQuestionnaireFromResource: (questionnaire: Questionnaire) => void;
}

function PlaygroundPicker(props: PlaygroundPickerProps) {
  const { patient, user, onBuildQuestionnaireFromFile, onBuildQuestionnaireFromResource } = props;

  const { patientName, userName } = useLaunchContextNames(patient, user);

  return (
    <>
      <Stack direction="row" justifyContent="end" gap={2} m={1}>
        {patientName ? (
          <Typography variant="subtitle2" color="text.secondary">
            Patient: {patientName}
          </Typography>
        ) : null}
        {patientName && userName ? (
          <Typography variant="subtitle2" color="text.secondary">
            User: {userName}
          </Typography>
        ) : null}
      </Stack>
      <Stack justifyContent="center" alignItems="center">
        <Stack gap={2} m={2}>
          <Stack alignItems="center">
            <FileCollector onBuild={onBuildQuestionnaireFromFile} />
          </Stack>

          <Box>
            <PlaygroundQuestionnairePicker onBuild={onBuildQuestionnaireFromResource} />
          </Box>
        </Stack>
      </Stack>
    </>
  );
}

export default PlaygroundPicker;
