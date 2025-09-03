/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { useSearchParams } from 'react-router-dom';
import { oauth2 } from 'fhirclient';
import { useState, useEffect } from 'react';
import LaunchView from './LaunchView.tsx';
import { LAUNCH_CLIENT_ID, LAUNCH_SCOPE } from '../../../globals.ts';

export type LaunchState = 'loading' | 'error' | 'success';

function Launch() {
  const [launchState, setLaunchState] = useState<LaunchState>('loading');
  const [clientId, setClientId] = useState<string>(LAUNCH_CLIENT_ID);

  const [searchParams] = useSearchParams();
  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');
  const scope = LAUNCH_SCOPE;

  // Fetch client ID from config.json based on issuer
  useEffect(() => {
    const fetchClientId = async () => {
      if (!iss) {
        setClientId(LAUNCH_CLIENT_ID);
        return;
      }

      try {
        const response = await fetch('/config.json');
        const config = await response.json();
        
        if (config[iss]) {
          setClientId(config[iss]);
        } else {
          setClientId(LAUNCH_CLIENT_ID);
        }
      } catch (error) {
        console.error('Error fetching config.json:', error);
        setClientId(LAUNCH_CLIENT_ID);
      }
    };

    fetchClientId();
  }, [iss]);

  // Handle OAuth2 authorization when we have all required parameters
  useEffect(() => {
    if (iss && launch && clientId) {
      // oauth2.authorize triggers a redirect to EHR
      oauth2
        .authorize({
          iss: iss,
          clientId: clientId,
          scope: scope
        })
        .catch((err) => {
          console.error('OAuth2 authorization failed:', err);
          setLaunchState('error');
        });
    }
  }, [iss, launch, clientId, scope]);

  const launchParamsNotExist = !iss || !launch;

  if (launchParamsNotExist && launchState !== 'error') {
    setLaunchState('error');
  }

  return <LaunchView launchState={launchState} />;
}

export default Launch;