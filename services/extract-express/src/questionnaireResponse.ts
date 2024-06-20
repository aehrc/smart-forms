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

import type { Parameters, ParametersParameter, QuestionnaireResponse } from 'fhir/r4b';

export function getQuestionnaireResponse(body: any): QuestionnaireResponse | null {
  if (isQuestionnaireResponse(body)) {
    return body;
  }

  if (isInputParameters(body)) {
    return body.parameter[0].resource;
  }

  return null;
}

export function isQuestionnaireResponse(body: any): body is QuestionnaireResponse {
  return body.resourceType && body.resourceType === 'QuestionnaireResponse';
}

export function isInputParameters(body: any): body is ExtractInputParameters {
  return (
    body.resourceType &&
    body.resourceType === 'Parameters' &&
    body.parameter[0].name === 'questionnaire-response' &&
    isQuestionnaireResponse(body.parameter[0].resource)
  );
}

export interface ExtractInputParameters extends Parameters {
  parameter: [QuestionnaireResponseParameter];
}

interface QuestionnaireResponseParameter extends ParametersParameter {
  name: 'questionnaire-response';
  resource: QuestionnaireResponse;
}
