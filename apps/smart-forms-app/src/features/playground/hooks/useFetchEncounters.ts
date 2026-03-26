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

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Encounter } from 'fhir/r4';
import { useMemo } from 'react';
import { fetchFhirResources } from '../api/fetchFhirResources.ts';
import { NUM_OF_ENCOUNTERS_TO_FETCH_PLAYGROUND } from '../../../globals.ts';

interface useFetchEncountersReturnParams {
  encounters: Encounter[];
  fetchStatus: UseQueryResult['status'];
  fetchError: unknown;
  isLoading: boolean;
  isFetching: boolean;
}

function useFetchEncounters(
  endpointUrl: string,
  patientId: string | null
): useFetchEncountersReturnParams {
  const numOfSearchEntries = NUM_OF_ENCOUNTERS_TO_FETCH_PLAYGROUND;

  const queryUrl = `/Encounter?patient=${patientId}&_count=${numOfSearchEntries}`;

  const {
    data: bundle,
    status,
    isLoading,
    error,
    isFetching
  } = useQuery<Bundle>({
    queryKey: ['encounters' + numOfSearchEntries.toString(), endpointUrl, patientId],
    queryFn: () => fetchFhirResources(endpointUrl, queryUrl),
    enabled: !!patientId
  });

  const encounters: Encounter[] = useMemo(() => {
    if (responseIsEncounterBundle(bundle)) {
      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry
          .map((entry) => entry.resource)
          .filter((encounter): encounter is Encounter => !!encounter);
      }
    }

    return [];
  }, [bundle]);

  return {
    encounters,
    fetchStatus: status,
    fetchError: error,
    isLoading,
    isFetching
  };
}

function responseIsEncounterBundle(response: any): response is Bundle<Encounter> {
  return (
    response &&
    response.resourceType === 'Bundle' &&
    response.entry &&
    response.entry.length > 0 &&
    response.entry[0].resource &&
    response.entry[0].resource.resourceType === 'Encounter'
  );
}

export default useFetchEncounters;
