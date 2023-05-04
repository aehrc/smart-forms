/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { Extension, OperationOutcome, Parameters, Questionnaire } from 'fhir/r4';
import { isAssembleInputParameters } from 'sdc-assemble';
import { headers } from './LoadServerResourceFunctions';
import * as FHIR from 'fhirclient';

export function assemblyIsRequired(questionnaire: Questionnaire): boolean {
  return !!questionnaire.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation' &&
      extension.valueCode === 'assemble-root'
  );
}

function defineAssembleParameters(questionnaire: Questionnaire): Parameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      }
    ]
  };
}

export async function assembleQuestionnaire(
  questionnaire: Questionnaire
): Promise<Questionnaire | OperationOutcome> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  const parameters = defineAssembleParameters(questionnaire);
  if (isAssembleInputParameters(parameters)) {
    const outputAssembleParams = await FHIR.client(endpointUrl).request({
      url: 'Questionnaire/$assemble',
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

    if (outputAssembleParams.parameter[0].resource.resourceType !== 'Questionnaire') {
      console.warn('Assemble fail');
      console.warn(outputAssembleParams.parameter[0].resource);
    }
    return outputAssembleParams.parameter[0].resource;
  }

  return questionnaire;
}

export function updateAssembledQuestionnaire(questionnaire: Questionnaire) {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  return FHIR.client(endpointUrl).request({
    url: `Questionnaire/${questionnaire.id}`,
    method: 'PUT',
    body: JSON.stringify(questionnaire),
    headers: headers
  });
}
