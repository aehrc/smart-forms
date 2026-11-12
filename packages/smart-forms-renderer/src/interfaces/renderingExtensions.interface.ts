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

import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { JSX } from 'react';

/**
 * Rendering extensions read off a questionnaire item, as returned by `useRenderingExtensions`.
 *
 * Defined here rather than in `hooks/useRenderingExtensions` so that type-only consumers (such
 * as `QItemOverrideComponentProps`, which the headless `/engine` entrypoint reaches) do not
 * pull that hook's runtime imports into their type closure.
 */
export interface RenderingExtensions {
  displayUnit: string;
  displayPrompt: string;
  displayInstructions: string;
  displayFlyover: string | JSX.Element | JSX.Element[];
  readOnly: boolean;
  entryFormat: string;
  required: boolean;
  quantityUnit: QuestionnaireItemAnswerOption | null;
  isRepopulatable: boolean;
}
