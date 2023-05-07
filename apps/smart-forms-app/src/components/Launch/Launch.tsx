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

import { useSearchParams } from 'react-router-dom';
import { oauth2 } from 'fhirclient';
import ProgressSpinner from '../Misc/ProgressSpinner';

function Launch() {
  const [searchParams] = useSearchParams();

  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  const clientId = import.meta.env.VITE_LAUNCH_CLIENT_ID ?? 'smart-forms';
  const scope =
    import.meta.env.VITE_LAUNCH_SCOPE ??
    'launch/patient patient/*.read offline_access openid fhirUser';

  if (iss && launch) {
    oauth2.authorize({
      iss: iss,
      clientId: clientId,
      scope: scope,
      pkceMode: 'required'
    });
  } else {
    window.location.replace('/');
  }

  return (
    <>
      <ProgressSpinner message="Launching Smart Forms" />
    </>
  );
}

export default Launch;
