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

export interface QuestionnaireTitleTextProps {
  questionnaire: Questionnaire;
}

/** Renders `Questionnaire.title` with optional `Questionnaire._title` rendering extensions (xhtml, markdown, style). */
function QuestionnaireTitleText(props: QuestionnaireTitleTextProps) {
  const { questionnaire } = props;

  return <StyledText textToDisplay={questionnaire.title ?? null} element={questionnaire._title} />;
}

export default QuestionnaireTitleText;
