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

import { useMemo } from 'react';
import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { includeAnsweredOptions, isDisplayUnavailable } from '../utils/openChoice';

export interface AnswerOptionVisibility {
  visibleOptions: QuestionnaireItemAnswerOption[];
  hasUnavailableDisplayOptions: boolean;
}

// Hide options whose display couldn't be resolved so raw codes are never shown, but never hide
// an option the user has already answered - it stays visible using its originally-recorded
// display, or is dropped if no display can be found anywhere (never a raw code). Also reports
// whether anything couldn't be freshly resolved, even if a merged-back answer still looks fine
// on screen, so callers can show a warning.
function useAnswerOptionVisibility(
  options: QuestionnaireItemAnswerOption[],
  answers: Array<{ valueCoding?: Coding }>
): AnswerOptionVisibility {
  return useMemo(
    () => ({
      visibleOptions: includeAnsweredOptions(options, answers),
      hasUnavailableDisplayOptions: options.some(isDisplayUnavailable)
    }),
    [options, answers]
  );
}

export default useAnswerOptionVisibility;
