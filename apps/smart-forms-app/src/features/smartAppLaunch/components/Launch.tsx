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
import { useDynamicClientRegistration } from '../hooks/useDynamicClientRegistration';

export type LaunchState = 'loading' | 'error' | 'success' | 'registering';

function Launch() {
  const [launchState, setLaunchState] = useState<LaunchState>('loading');
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  const scope = LAUNCH_SCOPE;

  const {
    isSupported,
    isRegistering,
    dynamicClientId,
    error: registrationError,
    useFixedClientId,
    fixedClientId,
    getClientId,
    reset
  } = useDynamicClientRegistration();

  // Reset registration state when component mounts or issuer changes
  useEffect(() => {
    reset();
  }, [iss, reset]);

  // Handle client ID resolution
  useEffect(() => {
    if (!iss) return;

    const resolveClientId = async () => {
      try {
        setLaunchState('loading');
        setError(null);

        // Get the appropriate client ID for this issuer
        const resolvedClientId = await getClientId(iss);
        
        if (resolvedClientId) {
          setClientId(resolvedClientId);
          setLaunchState('success');
        } else {
          // Fallback to default client ID if dynamic registration fails
          console.warn(`Dynamic client registration failed for issuer: ${iss}, using fallback client ID`);
          setClientId(LAUNCH_CLIENT_ID);
          setLaunchState('success');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error resolving client ID:', err);
        setError(errorMessage);
        setLaunchState('error');
      }
    };

    resolveClientId();
  }, [iss, getClientId]);

  // Handle OAuth2 authorization when client ID is resolved
  useEffect(() => {
    if (launchState === 'success' && clientId && iss && launch) {
      // oauth2.authorize triggers a redirect to EHR
      oauth2
        .authorize({
          iss: iss,
          clientId: clientId,
          scope: scope
        })
        .catch((err) => {
          console.error('OAuth2 authorization failed:', err);
          setError(err instanceof Error ? err.message : 'OAuth2 authorization failed');
          setLaunchState('error');
        });
    }
  }, [launchState, clientId, iss, launch, scope]);

  // Update launch state based on registration status
  useEffect(() => {
    if (isRegistering) {
      setLaunchState('registering');
    }
  }, [isRegistering]);

  // Handle registration errors
  useEffect(() => {
    if (registrationError) {
      setError(registrationError);
      setLaunchState('error');
    }
  }, [registrationError]);

  const launchParamsNotExist = !iss || !launch;

  if (launchParamsNotExist && launchState !== 'error') {
    setLaunchState('error');
  }

  // Determine what to display based on current state
  let displayState: LaunchState = launchState;
  let displayError = error;

  if (launchState === 'registering') {
    displayState = 'registering';
  } else if (launchState === 'success' && !clientId) {
    displayState = 'loading';
  }

  return (
    <LaunchView 
      launchState={displayState} 
      error={displayError}
      isRegistering={isRegistering}
      useFixedClientId={useFixedClientId}
      dynamicClientId={dynamicClientId}
      fixedClientId={fixedClientId}
    />
  );
}

export default Launch;
