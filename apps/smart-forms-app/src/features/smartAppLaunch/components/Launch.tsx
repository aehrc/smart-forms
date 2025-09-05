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
import { DEFAULT_LAUNCH_CLIENT_ID, DEFAULT_LAUNCH_SCOPE } from '../../../globals.ts';
import { useConfig } from '../../../contexts/ConfigContext';

export type LaunchState = 'loading' | 'error' | 'success';

function Launch() {
  const [launchState, setLaunchState] = useState<LaunchState>('loading');
  const [clientId, setClientId] = useState<string>(DEFAULT_LAUNCH_CLIENT_ID);
  const [scope, setScope] = useState<string>(DEFAULT_LAUNCH_SCOPE);

  const { getClientId, getAppConfig, loading: configLoading } = useConfig();
  const [searchParams] = useSearchParams();
  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  // Load configuration and resolve client ID
  useEffect(() => {
    if (configLoading) return; // Wait for config to load

    const appConfig = getAppConfig();
    if (!appConfig) {
      console.log('No app config available, using defaults');
      setClientId(DEFAULT_LAUNCH_CLIENT_ID);
      setScope(DEFAULT_LAUNCH_SCOPE);
      return;
    }

    setScope(appConfig.launchScope);
    
    if (!iss) {
      // No iss parameter, use default client ID from config
      console.log('No iss parameter, using default client ID from config:', appConfig.launchClientId);
      setClientId(appConfig.launchClientId);
      return;
    }

    // Try to get client ID for specific issuer
    const issuerClientId = getClientId(iss);
    if (issuerClientId) {
      console.log(`✅ Using client ID from config for issuer ${iss}: ${issuerClientId}`);
      setClientId(issuerClientId);
    } else {
      console.log('No client ID found in config for issuer, using default client ID');
      setClientId(appConfig.launchClientId);
    }
  }, [iss, configLoading, getClientId, getAppConfig]);

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