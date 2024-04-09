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

import { useQuery } from '@tanstack/react-query';
import type { Bundle } from 'fhir/r4';
import { fetchResource } from '../utils/fetchResource.ts';
import { PATIENT_QUERY, PRACTITIONER_QUERY } from '../utils/apiConstants.ts';

function useLaunchContext(bearerToken: string | null) {
  const { data: patientBundle, isFetching: isFetchingPatient } = useQuery<Bundle>(
    ['patientBundle'],
    () => fetchResource(PATIENT_QUERY, bearerToken),
    {
      enabled: bearerToken !== null
    }
  );

  const { data: practitionerBundle, isFetching: isFetchingPractitioner } = useQuery<Bundle>(
    ['practitionerBundle'],
    () => fetchResource(PRACTITIONER_QUERY, bearerToken),
    {
      enabled: bearerToken !== null
    }
  );

  return {
    patientBundle,
    practitionerBundle,
    isFetchingPatient,
    isFetchingPractitioner
  };
}

export default useLaunchContext;
