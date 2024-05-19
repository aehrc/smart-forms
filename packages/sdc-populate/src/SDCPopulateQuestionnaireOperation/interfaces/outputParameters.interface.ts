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
  Attachment,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  QuestionnaireResponse
} from 'fhir/r4';

/**
 * Output parameters for the $populate operation
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate}
 *
 * @author Sean Fong
 */
export interface OutputParameters extends Parameters {
  parameter: OutputParamArray;
}

type OutputParamArray =
  | [ResponseParameter, IssuesParameter, CustomContextResultParameter]
  | [ResponseParameter, IssuesParameter]
  | [ResponseParameter, CustomContextResultParameter]
  | [ResponseParameter];

export interface ResponseParameter extends ParametersParameter {
  name: 'response';
  resource: QuestionnaireResponse;
}

export interface IssuesParameter extends ParametersParameter {
  name: 'issues';
  resource: OperationOutcome;
}

// This is used for debugging purposes, it does not exist in the FHIR spec
// It is used to return the context result to the renderer
export interface CustomContextResultParameter extends ParametersParameter {
  name: 'contextResult-custom';
  valueAttachment: Attachment;
}
