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

import { IS_IN_APP_POPULATE } from '../../../utils/env.ts';
import type { InputParameters, OutputParameters } from '@aehrc/sdc-populate';
import { isOutputParameters, populate } from '@aehrc/sdc-populate';
import type { RequestConfig } from '../utils/callback.ts';
import { fetchResourceCallback } from '../utils/callback.ts';
import { HEADERS } from '../../../api/headers.ts';
import type Client from 'fhirclient/lib/Client';
import type { OperationOutcome } from 'fhir/r4';

export async function requestPopulate(
  fhirClient: Client,
  inputParameters: InputParameters
): Promise<OutputParameters | OperationOutcome> {
  const requestConfig: RequestConfig = {
    clientEndpoint: fhirClient.state.serverUrl,
    authToken: fhirClient.state.tokenResponse!.access_token!
  };

  const populatePromise: Promise<any> = IS_IN_APP_POPULATE
    ? populate(inputParameters, fetchResourceCallback, requestConfig)
    : fhirClient.request({
        url: 'Questionnaire/$populate',
        method: 'POST',
        body: JSON.stringify(inputParameters),
        headers: {
          ...HEADERS,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${requestConfig.authToken}`
        }
      });

  try {
    const promiseResult = await addTimeoutToPromise(populatePromise, 10000);

    if (promiseResult.timeout) {
      return {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'timeout',
            details: { text: '$populate operation timed out.' }
          }
        ]
      };
    }

    if (isOutputParameters(promiseResult)) {
      return promiseResult;
    }

    return {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: 'Output parameters do not match the specification.' }
        }
      ]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'unknown',
          details: { text: 'An unknown error occurred.' }
        }
      ]
    };
  }
}

async function addTimeoutToPromise(promise: Promise<any>, timeoutMs: number) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeoutMs} milliseconds`));
    }, timeoutMs);
  });

  // Use Promise.race to wait for either the original promise or the timeout promise
  return Promise.race([promise, timeoutPromise]);
}
