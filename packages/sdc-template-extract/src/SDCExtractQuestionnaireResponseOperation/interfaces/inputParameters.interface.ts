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

import type {
  Parameters,
  ParametersParameter,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';

/**
 * Input parameters for the $extract operation
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition-QuestionnaireResponse-extract.html}
 */
export interface InputParameters extends Parameters {
  parameter: InputParamArray;
}

type InputParamOptionalExtras =
  | []
  | [CustomQuestionnaireParameter]
  | [CustomComparisonSourceResponseParameter]
  | [CustomQuestionnaireParameter, CustomComparisonSourceResponseParameter]
  | [CustomComparisonSourceResponseParameter, CustomQuestionnaireParameter];

export type InputParamArray = [QuestionnaireResponseParameter, ...InputParamOptionalExtras];

export interface QuestionnaireResponseParameter extends ParametersParameter {
  name: 'questionnaire-response';
  resource: QuestionnaireResponse;
}

// This is used for providing a questionnaire definition upfront rather than getting it to resolve it by reference, this parameter does not exist in the FHIR spec
export interface CustomQuestionnaireParameter extends ParametersParameter {
  name: 'questionnaire';
  resource: Questionnaire;
}

// This is used for providing a pre-populated QuestionnaireResponse to perform comparisons, this parameter does not exist in the FHIR spec
export interface CustomComparisonSourceResponseParameter extends ParametersParameter {
  name: 'comparison-source-response';
  resource: QuestionnaireResponse;
}
