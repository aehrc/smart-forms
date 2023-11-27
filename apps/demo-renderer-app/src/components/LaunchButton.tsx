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

import { oauth2 } from 'fhirclient';
import '../styles.css';

// All hardcoded, this is a demo app anyway
const ISS = 'https://gw.interop.community/AuConNov23/data';
const CLIENT_ID = '320392f1-ef47-4470-8cfa-f31389057531';
const SCOPES =
  'patient/Observation.rs patient/Patient.rs online_access openid profile patient/QuestionnaireResponse.cruds launch fhirUser patient/Encounter.rs patient/Condition.rs';

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
      <button className="increase-button-hitbox" onClick={() => launch()}>
        Get new bearer token from demo server {ISS}
      </button>
    </div>
  );
}

export default LaunchButton;
