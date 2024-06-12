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

import type { Questionnaire, QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';

/**
 * Filter x-fhir-query variables from questionnaire's extensions needed for population
 *
 * @author Sean Fong
 */
export function insertCompleteAnswerOptionsIntoQuestionnaire(
  questionnaire: Questionnaire,
  completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]>
): Questionnaire {
  if (questionnaire.item && questionnaire.item.length > 0) {
    for (const qItem of questionnaire.item) {
      insertCompleteAnswerOptionsRecursive(qItem, completeAnswerOptions);
    }
  }

  return questionnaire;
}

function insertCompleteAnswerOptionsRecursive(
  qItem: QuestionnaireItem,
  completeAnswerOptions: Record<string, QuestionnaireItemAnswerOption[]>
) {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      insertCompleteAnswerOptionsRecursive(childItem, completeAnswerOptions);
    }
  }

  if (qItem.answerOption) {
    const options = completeAnswerOptions[qItem.linkId];
    if (options) {
      qItem.answerOption = options;
    }
  }

  return;
}
