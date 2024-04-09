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

import type { OperationOutcome, Parameters, ParametersParameter, Questionnaire } from 'fhir/r4';

/**
 * Input parameters for the $assemble operation
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble}
 *
 * @author Sean Fong
 */
export interface InputParameters extends Parameters {
  parameter: [
    {
      name: 'questionnaire';
      resource: Questionnaire;
    }
  ];
}

/**
 * Output parameters for the $assemble operation
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble}
 *
 * @author Sean Fong
 */
export interface OutputParameters extends Parameters {
  parameter: [ReturnParameter, OutcomeParameter];
}

interface ReturnParameter extends ParametersParameter {
  name: 'return';
  resource: Questionnaire;
}

interface OutcomeParameter extends ParametersParameter {
  name: 'outcome';
  resource: OperationOutcome;
}
