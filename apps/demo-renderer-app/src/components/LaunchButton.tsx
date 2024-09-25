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
import { CLIENT_ID, ISS, SCOPES } from '../utils/apiConstants.ts';
import { Button } from '@/components/ui/button.tsx';

function LaunchButton() {
  function launch() {
    oauth2
      .authorize({
        iss: ISS,
        clientId: CLIENT_ID,
        scope: SCOPES
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div>
      <Button variant="outline" onClick={() => launch()}>
        Get new bearer token from demo server {ISS}
      </Button>
    </div>
  );
}

export default LaunchButton;
