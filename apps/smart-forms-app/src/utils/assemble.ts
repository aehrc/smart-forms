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

import type { Extension, OperationOutcome, Parameters, Questionnaire } from 'fhir/r4';
import { isInputParameters } from '@aehrc/sdc-assemble';
import * as FHIR from 'fhirclient';
import { HEADERS } from '../api/headers.ts';
import { getFormsServerAssembledBundlePromise } from '../features/dashboard/utils/dashboard.ts';

const endpointUrl = import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://smartforms.csiro.au/api/fhir';

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
  const parameters = defineAssembleParameters(questionnaire);
  if (isInputParameters(parameters)) {
    const outputAssembleParams = await FHIR.client(endpointUrl).request({
      url: 'Questionnaire/$assemble',
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: { ...HEADERS, 'Content-Type': 'application/json' }
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
  return FHIR.client(endpointUrl).request({
    url: `Questionnaire/${questionnaire.id}`,
    method: 'PUT',
    body: JSON.stringify(questionnaire),
    headers: HEADERS
  });
}

export async function assembleIfRequired(
  questionnaire: Questionnaire
): Promise<Questionnaire | null> {
  // get assembled version of questionnaire if assembled-expectation extension exists
  const assembleRequired = assemblyIsRequired(questionnaire);
  if (assembleRequired) {
    // check for existing assembled questionnaires
    const queryUrl = `/Questionnaire?_sort=-date&url=${questionnaire.url}&version=${questionnaire.version}-assembled`;
    const bundle = await getFormsServerAssembledBundlePromise(queryUrl);

    // if there is an assembled questionnaire, return it
    if (bundle.entry && bundle.entry.length > 0) {
      const firstQuestionnaire = bundle.entry[0].resource;
      if (firstQuestionnaire) {
        return firstQuestionnaire as Questionnaire;
      }
    }

    // If not, perform assemble on-the-fly and save it to forms server
    const resource = await assembleQuestionnaire(questionnaire);
    if (resource.resourceType === 'OperationOutcome') return null;

    // at this point, assembly is successful
    // save assembled questionnaire to forms server and return it
    await updateAssembledQuestionnaire(questionnaire);
    return resource;
  }

  // questionnaire does not require assembly, return as usual
  return questionnaire;
}
