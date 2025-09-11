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

import { useContext, useEffect, useState } from 'react';
import LaunchView from './LaunchView.tsx';
import { ConfigContext } from '../../configChecker/contexts/ConfigContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { getClientId } from '../utils/launch.ts';
import { oauth2 } from 'fhirclient';

export type LaunchState = 'loading' | 'error' | 'success';

function Launch() {
  const [launchState, setLaunchState] = useState<LaunchState>('loading');

  const { config, currentClientId, onSetCurrentClientId } = useContext(ConfigContext);

  const { registeredClientIds, defaultClientId, launchScopes } = config;

  // Get issuer and launch from URL parameters
  const [searchParams] = useSearchParams();
  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  useEffect(() => {
    if (iss) {
      const clientId = getClientId(iss, registeredClientIds, defaultClientId);
      onSetCurrentClientId(clientId);
    }
  }, [iss, launch, registeredClientIds, defaultClientId, launchScopes, onSetCurrentClientId]);

  // authorize() is only called if iss and launch query params are present, AND we have a non-empty client ID
  if (iss && launch && currentClientId !== '') {
    // Trigger OAuth redirect
    oauth2
      .authorize({
        iss,
        clientId: currentClientId,
        scope: launchScopes
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

  return <LaunchView launchState={launchState} />;
}

export default Launch;
