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

import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import dayjs from 'dayjs';

/**
 * Converts a QuestionnaireResponseItemAnswer to a string representation
 * for display in the repopulation dialog
 */
export function getAnswerValueAsString(answer: QuestionnaireResponseItemAnswer): string {
  if (!answer) return '';

  if (answer.valueString !== undefined) {
    return answer.valueString;
  }

  if (answer.valueBoolean !== undefined) {
    return answer.valueBoolean ? 'Yes' : 'No';
  }

  if (answer.valueInteger !== undefined) {
    return answer.valueInteger.toString();
  }

  if (answer.valueDecimal !== undefined) {
    return answer.valueDecimal.toString();
  }

  if (answer.valueDate !== undefined) {
    return dayjs(answer.valueDate).format('DD/MM/YYYY');
  }

  if (answer.valueDateTime !== undefined) {
    return dayjs(answer.valueDateTime).format('DD/MM/YYYY hh:mm A');
  }

  if (answer.valueTime !== undefined) {
    return answer.valueTime;
  }

  if (answer.valueUri !== undefined) {
    return answer.valueUri;
  }

  if (answer.valueQuantity !== undefined) {
    return `${answer.valueQuantity.value} ${answer.valueQuantity.unit || ''}`.trim();
  }

  if (answer.valueCoding !== undefined) {
    return answer.valueCoding.display || answer.valueCoding.code || '';
  }

  if (answer.valueAttachment?.url !== undefined) {
    return answer.valueAttachment.title || 'Attachment';
  }

  if (answer.valueReference !== undefined) {
    return answer.valueReference.display || answer.valueReference.reference || '';
  }

  return '';
}
