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

import type { Extension, QuestionnaireResponse } from 'fhir/r4';

/**
 * Get questionnaire name from questionnaireResponse
 * If questionnaireResponse does not have a name, fallback to questionnaireResponse questionnaireId
 *
 * @author Sean Fong
 */
export function getQuestionnaireNameFromResponse(
  questionnaireResponse: QuestionnaireResponse
): string {
  const itemControl = questionnaireResponse._questionnaire?.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/display'
  );

  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString.charAt(0).toUpperCase() + itemControl.valueString.slice(1);
    }
  }

  return questionnaireResponse.id ?? 'Unnamed Response';
}
