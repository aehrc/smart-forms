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
  FetchResourceRequestConfig,
  FetchTerminologyRequestConfig,
  InputParameters,
  OutputParameters
} from '@aehrc/sdc-populate';
import { isOutputParameters, populate } from '@aehrc/sdc-populate';
import { fetchResourceCallback, fetchTerminologyCallback } from '../utils/callback.ts';
import { HEADERS } from '../../../api/headers.ts';
import type Client from 'fhirclient/lib/Client';
import type { OperationOutcome } from 'fhir/r4';
import { IN_APP_POPULATE, TERMINOLOGY_SERVER_URL } from '../../../globals.ts';

export async function requestPopulate(
  fhirClient: Client,
  inputParameters: InputParameters
): Promise<OutputParameters | OperationOutcome> {
  const fetchResourceRequestConfig: FetchResourceRequestConfig = {
    sourceServerUrl: fhirClient.state.serverUrl,
    authToken: fhirClient.state.tokenResponse!.access_token!
  };

  const terminologyRequestConfig: FetchTerminologyRequestConfig = {
    terminologyServerUrl: TERMINOLOGY_SERVER_URL
  };

  const populatePromise: Promise<any> = IN_APP_POPULATE
    ? populate(
        inputParameters,
        fetchResourceCallback,
        fetchResourceRequestConfig,
        fetchTerminologyCallback,
        terminologyRequestConfig
      )
    : fhirClient.request({
        url: 'Questionnaire/$populate',
        method: 'POST',
        body: JSON.stringify(inputParameters),
        headers: {
          ...HEADERS,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fetchResourceRequestConfig.authToken}`
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
