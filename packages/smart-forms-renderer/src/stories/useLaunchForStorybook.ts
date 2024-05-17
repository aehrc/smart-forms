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

import { oauth2 } from 'fhirclient';
import { useState } from 'react';

export type LaunchState = 'loading' | 'error' | 'success';

function useLaunchForStorybook(
  iss: string,
  clientId: string,
  scope: string,
  patientId: string,
  userId: string,
  encounterId?: string,
  questionnaireCanonical?: string
) {
  const [launchState, setLaunchState] = useState<LaunchState>('loading');

  const currentUrl = window.location.href;
  console.log(currentUrl);

  const launch = setLaunchParams(
    clientId,
    scope,
    currentUrl,
    patientId,
    userId,
    encounterId,
    questionnaireCanonical
  );

  console.log(launch);

  if (iss && launch) {
    // oauth2.authorize triggers a redirect to EHR
    oauth2
      .authorize({
        iss: iss,
        clientId: clientId,
        scope: scope,
        // launch: launch,
        // completeInTarget: true,
        noRedirect: true
        // redirectUri: currentUrl
      })
      .catch((err) => {
        console.error(err);
        setLaunchState('error');
      });
  }

  const launchParamsNotExist = !iss || !launch;

  if (launchParamsNotExist && launchState !== 'error') {
    setLaunchState('error');
  }

  return launchState;
}

function setLaunchParams(
  clientId: string,
  scope: string,
  currentUrl: string,
  patientId: string,
  userId: string,
  encounterId?: string,
  questionnaireCanonical?: string
) {
  // Launch parameters used in the storybook
  // LaunchParams from smart-launcher-v2 (https://github.com/smart-on-fhir/smart-launcher-v2/blob/main/index.d.ts#L55)
  const launchParams = [
    0, // launch_type - LaunchType
    patientId, // patient ID - string
    userId, // practitioner ID - string
    encounterId ?? 'AUTO', // encounter ID - string (use AUTO to auto-select encounter)
    0, // skip login - boolean
    0, // skip_auth - boolean
    0, // sim_ehr - boolean
    scope, // scopes
    ``, // redirect_uris - string
    clientId, // client ID
    '', // client secret - string
    '', // auth_error - SimulatedError
    '', // jwks_url - string
    '', // jwks - string
    0, // client_type - SMARTClientType
    1, // pkce -  PKCEValidation
    // CUSTOM: fhirContext - string
    questionnaireCanonical
      ? `{"role":"https://smartforms.csiro.au/smart/role/questionnaire-to-display","canonical":"${questionnaireCanonical}","type":"Questionnaire"}`
      : '',
    false // CUSTOM: is_embedded_view - boolean
  ];

  return base64UrlEncode(JSON.stringify(launchParams));
}

/**
 * IMPORTANT: This function will work on both in the browser and in Node
 */
export function base64UrlEncode(str: string) {
  return typeof Buffer === 'undefined'
    ? window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    : Buffer.from(str, 'utf8').toString('base64url');
}

export default useLaunchForStorybook;
