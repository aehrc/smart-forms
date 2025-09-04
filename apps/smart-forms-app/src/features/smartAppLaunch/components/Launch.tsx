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

  // Client ID resolution: local config.json -> fixed client ID
  useEffect(() => {
    const fetchClientId = async () => {
      if (!iss) {
        // No iss parameter, use fixed client ID
        console.log('No iss parameter, using fixed client ID:', LAUNCH_CLIENT_ID);
        setClientId(LAUNCH_CLIENT_ID);
        return;
      }

      try {
        // Try to fetch client ID from local config.json
        console.log('Fetching client ID from local config for issuer:', iss);
        const response = await fetch('/config.json');
        
        if (response.ok) {
          const config = await response.json();
          if (config[iss]) {
            console.log(`✅ Using client ID from config for issuer ${iss}: ${config[iss]}`);
            setClientId(config[iss]);
            return;
          }
        }
        
        console.log('No client ID found in config for issuer, using fixed client ID');
      } catch (error) {
        console.log('Failed to fetch config, using fixed client ID:', error);
      }

      // Fallback to fixed client ID
      console.log(`Using fixed client ID: ${LAUNCH_CLIENT_ID}`);
      setClientId(LAUNCH_CLIENT_ID);
    };

    fetchClientId();
  }, [iss]);

  // Handle OAuth2 authorization when we have the required parameters
  useEffect(() => {
    if (iss && clientId) {
      console.log('Starting OAuth2 authorization with:', { iss, clientId, scope, launch });
      
      // oauth2.authorize triggers a redirect to EHR
      oauth2
        .authorize({
          iss: iss,
          clientId: clientId,
          scope: scope,
          ...(launch && { launch }) // Only include launch if it exists
        })
        .catch((err) => {
          console.error('OAuth2 authorization failed:', err);
          setLaunchState('error');
        });
    }
  }, [iss, launch, clientId, scope]);

  // Only require iss parameter, launch is optional
  const issMissing = !iss;

  if (issMissing && launchState !== 'error') {
    setLaunchState('error');
  }

  return <LaunchView launchState={launchState} />;
}

export default Launch;