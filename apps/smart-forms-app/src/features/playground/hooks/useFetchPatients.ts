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

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Patient } from 'fhir/r4';
import { useMemo } from 'react';
import { fetchFhirResources } from '../api/fetchFhirResources.ts';
import { NUM_OF_PATIENTS_TO_FETCH_PLAYGROUND } from '../../../globals.ts';

interface useFetchPatientsReturnParams {
  patients: Patient[];
  fetchStatus: UseQueryResult['status'];
  fetchError: unknown;
  isLoading: boolean;
  isFetching: boolean;
}

function useFetchPatients(endpointUrl: string): useFetchPatientsReturnParams {
  const numOfSearchEntries = NUM_OF_PATIENTS_TO_FETCH_PLAYGROUND;

  const queryUrl = `/Patient?_count=${numOfSearchEntries}`;

  const {
    data: bundle,
    status,
    isLoading,
    error,
    isFetching
  } = useQuery<Bundle>({
    queryKey: ['patients' + numOfSearchEntries.toString(), endpointUrl, queryUrl],
    queryFn: () => fetchFhirResources(endpointUrl, queryUrl)
  });

  const patients: Patient[] = useMemo(() => {
    if (responseIsPatientBundle(bundle)) {
      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry
          .map((entry) => entry.resource)
          .filter((patient): patient is Patient => !!patient);
      }
    }

    return [];
  }, [bundle]);

  return {
    patients,
    fetchStatus: status,
    fetchError: error,
    isLoading,
    isFetching
  };
}

function responseIsPatientBundle(response: any): response is Bundle<Patient> {
  return (
    response &&
    response.resourceType === 'Bundle' &&
    response.entry &&
    response.entry.length > 0 &&
    response.entry[0].resource &&
    response.entry[0].resource.resourceType === 'Patient'
  );
}

export default useFetchPatients;
