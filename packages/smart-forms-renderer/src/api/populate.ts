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

import type { InputParameters, OutputParameters } from 'sdc-populate';
import { isOutputParameters, populate } from 'sdc-populate';
import type { RequestConfig } from '../utils/populateCallback';
import { fetchResourceCallback } from '../utils/populateCallback';
import type Client from 'fhirclient/lib/Client';
import type { OperationOutcome } from 'fhir/r4';

const IS_IN_APP_POPULATE = true;

export const HEADERS = {
  'Content-Type': 'application/json;charset=utf-8',
  Accept: 'application/json;charset=utf-8'
};

export async function requestPopulate(
  fhirClient: Client,
  inputParameters: InputParameters
): Promise<OutputParameters | OperationOutcome> {
  const requestConfig: RequestConfig = {
    clientEndpoint: fhirClient.state.serverUrl,
    authToken: fhirClient.state.tokenResponse!.access_token!
  };

  if (IS_IN_APP_POPULATE) {
    return await populate(inputParameters, fetchResourceCallback, requestConfig);
  }

  const outputParameters = await fhirClient.request({
    url: 'Questionnaire/$populate',
    method: 'POST',
    body: JSON.stringify(inputParameters),
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requestConfig.authToken}`
    }
  });

  if (isOutputParameters(outputParameters)) {
    return outputParameters;
  }

  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Output parameters does not match the specification.' }
      }
    ]
  };
}
