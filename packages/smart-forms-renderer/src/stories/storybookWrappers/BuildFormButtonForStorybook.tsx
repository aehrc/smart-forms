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
import React from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { Box, IconButton, Tooltip } from '@mui/material';
import Iconify from '../../components/Iconify/Iconify';
import { buildForm } from '../../utils';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';

interface BuildFormButtonProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormButtonForStorybook(props: BuildFormButtonProps) {
  const { questionnaire, questionnaireResponse } = props;

  async function handleBuildForm() {
    await buildForm(
      questionnaire,
      questionnaireResponse,
      undefined,
      STORYBOOK_TERMINOLOGY_SERVER_URL
    );
  }

  return (
    <Box display="flex" mb={0.5} alignItems="center" columnGap={3}>
      <Tooltip title="Build form with questionnaire response" placement="right">
        <IconButton onClick={handleBuildForm} size="small" color="primary">
          <Iconify icon="ph:hammer" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default BuildFormButtonForStorybook;
