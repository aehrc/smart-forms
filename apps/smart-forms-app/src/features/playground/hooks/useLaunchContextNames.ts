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

import { useMemo } from 'react';
import { constructName } from '../../smartAppLaunch/utils/launchContext.ts';
import type { Patient, Practitioner } from 'fhir/r4';

function useLaunchContextNames(patient: Patient | null, user: Practitioner | null) {
  const patientName = useMemo(() => {
    if (patient?.name) {
      return constructName(patient.name);
    }

    return patient?.id ?? null;
  }, [patient]);

  const userName = useMemo(() => {
    if (user?.name) {
      return constructName(user.name);
    }

    return user?.id ?? null;
  }, [user]);

  return { patientName, userName };
}

export default useLaunchContextNames;
