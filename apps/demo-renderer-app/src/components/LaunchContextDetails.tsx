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

import type { Patient, Practitioner } from 'fhir/r4';
import { getDisplayName } from '../utils/humanName.ts';

interface LaunchContextDetailsProps {
  patient: Patient | null;
  practitioner: Practitioner | null;
}

function LaunchContextDetails(props: LaunchContextDetailsProps) {
  const { patient, practitioner } = props;

  return (
    <div>
      <div className="flex gap-3">
        <div>
          <div className="font-semibold">Selected patient</div>
          <div>Name: {getDisplayName(patient?.name)}</div>
          <div>Resource ID: {patient?.id}</div>
        </div>
        <br />
        <div>
          <div className="font-semibold">Selected practitioner</div>
          <div>Name: {getDisplayName(practitioner?.name)}</div>
          <div>Resource ID: {practitioner?.id}</div>
        </div>
      </div>
    </div>
  );
}

export default LaunchContextDetails;
