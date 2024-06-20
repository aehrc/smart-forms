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
  FhirResource,
  Parameters,
  ParametersParameter,
  QuestionnaireResponse,
  StructureMap
} from 'fhir/r4b';
import { HEADERS } from './globals';

export function createTransformInputParameters(
  targetStructureMap: StructureMap,
  questionnaireResponse: QuestionnaireResponse
): TransformInputParameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'source',
        resource: targetStructureMap
      },
      {
        name: 'content',
        resource: questionnaireResponse
      }
    ]
  };
}

export async function invokeTransform(
  transformInputParameters: TransformInputParameters,
  ehrServerUrl: string
): Promise<any> {
  const requestUrl = `${ehrServerUrl}/StructureMap/$transform`;
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(transformInputParameters)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export interface TransformInputParameters extends Parameters {
  parameter: [SourceParameter, ContentParameter];
}

interface SourceParameter extends ParametersParameter {
  name: 'source';
  resource: StructureMap;
}

interface ContentParameter extends ParametersParameter {
  name: 'content';
  resource: FhirResource;
}
