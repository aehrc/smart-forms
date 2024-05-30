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
import type { Bundle, Practitioner } from 'fhir/r4';
import { useMemo } from 'react';
import { fetchFhirResources } from '../api/fetchFhirResources.ts';

interface useFetchPractitionersReturnParams {
  practitioners: Practitioner[];
  fetchStatus: 'error' | 'success' | 'loading';
  fetchError: unknown;
  isInitialLoading: boolean;
  isFetching: boolean;
}

function useFetchPractitioners(endpointUrl: string): useFetchPractitionersReturnParams {
  const numOfSearchEntries = 100;

  const queryUrl = `/Practitioner?_count=${numOfSearchEntries}`;

  const {
    data: bundle,
    status,
    isInitialLoading,
    error,
    isFetching
  } = useQuery<Bundle>(['practitioners', endpointUrl, queryUrl], () =>
    fetchFhirResources(endpointUrl, queryUrl)
  );

  const practitioners: Practitioner[] = useMemo(() => {
    if (responseIsPractitionerBundle(bundle)) {
      if (bundle.entry && bundle.entry.length > 0) {
        return bundle.entry
          .map((entry) => entry.resource)
          .filter((patient): patient is Practitioner => !!patient);
      }
    }

    return [];
  }, [bundle]);

  return {
    practitioners,
    fetchStatus: status,
    fetchError: error,
    isInitialLoading,
    isFetching
  };
}

function responseIsPractitionerBundle(response: any): response is Bundle<Practitioner> {
  return (
    response &&
    response.resourceType === 'Bundle' &&
    response.entry &&
    response.entry.length > 0 &&
    response.entry[0].resource &&
    response.entry[0].resource.resourceType === 'Practitioner'
  );
}

export default useFetchPractitioners;
