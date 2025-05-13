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

import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

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
    // Normalize date format - keep YYYY-MM-DD format for consistency
    return standardizeDateFormat(answer.valueDate);
  }

  if (answer.valueDateTime !== undefined) {
    // Extract just the date portion and standardize format
    const datePart = answer.valueDateTime.split('T')[0];
    return standardizeDateFormat(datePart);
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

/**
 * Ensures consistent date format by converting between common formats
 * @param dateString - A date string in any common format
 * @returns - Standardized date in YYYY-MM-DD format
 */
function standardizeDateFormat(dateString: string): string {
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Handle DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // Handle MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const parts = dateString.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    return `${parts[2]}-${month}-${day}`;
  }

  // If we can't parse it, return the original
  return dateString;
}
