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

import type { OperationOutcome, Parameters, ParametersParameter, StructureMap } from 'fhir/r4b';

export function responseIsParametersResource(parameters: any): parameters is DebugOutputParameters {
  return (
    parameters &&
    parameters.resourceType === 'Parameters' &&
    !!parameters.parameter &&
    parameters.parameter.length > 0 &&
    parameters.parameter[2].name === 'parameters' &&
    parameters.parameter[2].part.length > 0 &&
    !!parameters.parameter[2].part[1] &&
    parameters.parameter[2].part[1].name === 'source' &&
    !!parameters.parameter[2].part[1].resource &&
    parameters.parameter[2].part[1].resource.resourceType === 'StructureMap'
  );
}

export function getStructureMapFromDebugOutputParameters(
  outputParameters: any
): StructureMap | null {
  if (!responseIsParametersResource(outputParameters)) {
    return null;
  }

  return outputParameters.parameter[2].part[1].resource;
}

export interface DebugOutputParameters extends Parameters {
  parameter: [OutcomeParameter, ResultParameter, DebugParametersParameter, TraceParameter];
}

interface OutcomeParameter extends ParametersParameter {
  name: 'outcome';
  resource: OperationOutcome;
}

interface ResultParameter extends ParametersParameter {
  name: 'result';
  valueString: string;
}

interface DebugParametersParameter extends ParametersParameter {
  name: 'parameters';
  part: [
    {
      name: 'evaluator';
      valueString: string;
    },
    {
      name: 'source';
      resource: StructureMap;
    }
  ];
}

interface TraceParameter extends ParametersParameter {
  name: 'content';
  part: any[];
}
