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

import type { Parameters, ParametersParameter } from 'fhir/r4';
import type { InputParameters } from '../interfaces';

/**
 * Check if the given parameters is a valid InputParameters for $assemble
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble}
 *
 * @param parameters - a given Parameters resource
 * @return boolean value of whether the given parameters is InputParameters
 *
 * @author Sean Fong
 */
export function isInputParameters(parameters: Parameters): parameters is InputParameters {
  return !!parameters.parameter?.find(
    (param: ParametersParameter) =>
      param.name === 'questionnaire' && param.resource?.resourceType === 'Questionnaire'
  );
}
