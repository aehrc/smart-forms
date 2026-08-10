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

import React from 'react';
import type { Questionnaire } from 'fhir/r4';
import StyledText from './StyledText';
import Typography from '@mui/material/Typography';

export interface QuestionnaireTitleTextProps {
  /** The FHIR R4 Questionnaire whose title should be rendered. */
  questionnaire: Questionnaire;
}

/**
 * Renders `Questionnaire.title` with support for optional `Questionnaire._title` rendering
 * extensions (xhtml, markdown, style).
 *
 * This component is rendered automatically by the renderer at the top of the form unless
 * `hideQuestionnaireTitle` is set to `true` in the renderer config (via `setRendererConfig`).
 * Set `hideQuestionnaireTitle: true` when your consuming app already displays the questionnaire
 * title in its own header, to avoid rendering it twice.
 *
 * The component is also exported so consuming apps can render the styled title independently
 * in a custom location (e.g. a page header or sidebar).
 *
 * @example
 * // Render title in a custom location
 * import { QuestionnaireTitleText } from '@aehrc/smart-forms-renderer';
 * <QuestionnaireTitleText questionnaire={questionnaire} />
 *
 * @see {@link QuestionnaireTitleTextProps}
 */
function QuestionnaireTitleText(props: QuestionnaireTitleTextProps) {
  const { questionnaire } = props;

  return (
    <Typography component="h1" variant="h4" mb={2}>
      <StyledText textToDisplay={questionnaire.title ?? null} element={questionnaire._title} />
    </Typography>
  );
}

export default QuestionnaireTitleText;
