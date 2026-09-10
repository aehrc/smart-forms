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

import type { QuestionnaireItem } from 'fhir/r4';
import useValidationFeedbackSeverity from './useValidationFeedbackSeverity';

/**
 * @deprecated Use {@link useValidationFeedbackSeverity} instead.
 * This wrapper exists for backward compatibility and will be removed in the next major release.
 * Switching to the new hook lets field components distinguish warning-level feedback
 * (advisory, amber) from error-level feedback (blocking, red).
 */
function useValidationFeedback(
  qItem: QuestionnaireItem,
  feedbackFromParent: string | undefined
): string {
  return useValidationFeedbackSeverity(qItem, feedbackFromParent).feedback;
}

export default useValidationFeedback;
