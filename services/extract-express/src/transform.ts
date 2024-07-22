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

export function createTransformInputParametersForExtract(
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

export function createTransformInputParametersForConvert(
  fhirMappingLanguageMap: string
): TransformInputParameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'source',
        valueString: fhirMappingLanguageMap
      },
      // Hardcoded content to be empty QuestionnaireResponse since it is not used in the conversion
      {
        name: 'content',
        resource: {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress'
        }
      }
    ]
  };
}

export async function invokeTransform(
  transformInputParameters: TransformInputParameters,
  ehrServerUrl: string,
  ehrServerAuthToken?: string,
  debugMode?: boolean
): Promise<any> {
  let requestUrl = `${ehrServerUrl}/StructureMap/$transform`;

  // Brian's demo-map-server by default return xml when debug=true, explicitly set it to json
  if (debugMode) {
    requestUrl += '?debug=true&_format=json';
  }

  const headers = ehrServerAuthToken
    ? { ...HEADERS, Authorization: `Bearer ${ehrServerAuthToken}` }
    : HEADERS;
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(transformInputParameters)
  });

  if (!response.ok) {
    const debugModeMessage = debugMode
      ? '\nNote: The input FML map might not be valid. If it is valid but you are still getting this error, please raise a GitHub issue at https://github.com/aehrc/smart-forms/issues/new'
      : '';
    throw new Error(
      `HTTP error when performing ${ehrServerUrl}/StructureMap/$transform. Status: ${response.status}${debugModeMessage}`
    );
  }

  return response.json();
}

export interface TransformInputParameters extends Parameters {
  parameter:
    | [SourceResourceParameter, ContentParameter]
    | [SourceValueStringParameter, ContentParameter];
}

interface SourceResourceParameter extends ParametersParameter {
  name: 'source';
  resource: StructureMap;
}

interface SourceValueStringParameter extends ParametersParameter {
  name: 'source';
  valueString: string;
}

interface ContentParameter extends ParametersParameter {
  name: 'content';
  resource: FhirResource;
}
