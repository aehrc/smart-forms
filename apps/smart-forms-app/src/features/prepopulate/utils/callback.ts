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

import type {
  FetchResourceCallback,
  FetchResourceRequestConfig,
  FetchTerminologyCallback,
  FetchTerminologyRequestConfig
} from '@aehrc/sdc-populate';
import type { Bundle, BundleEntry, BundleLink } from 'fhir/r4';
import { nanoid } from 'nanoid';

const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].\S*$/;
const MAX_PAGES_SEARCH_BUNDLE = 10;

export const fetchResourceCallback: FetchResourceCallback = async (
  query: string,
  requestConfig: FetchResourceRequestConfig
) => {
  let { sourceServerUrl } = requestConfig;
  const { authToken } = requestConfig;

  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!sourceServerUrl.endsWith('/')) {
    sourceServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : `${sourceServerUrl}${query}`;

  // Support for paginated resources, keep repeating the request until there are no more pages
  let allEntries: BundleEntry[] = [];
  let nextUrl: string | null = requestUrl;
  const maxPages = MAX_PAGES_SEARCH_BUNDLE; // Set a maximum number of pages to fetch
  let pageCount = 0;
  do {
    const response: Response = await fetch(nextUrl, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error when performing ${nextUrl}. Status: ${response.status}`);
    }

    try {
      // Attempt to parse the response JSON
      const fhirData = await response.json();

      // If the response is not a Bundle searchset, return the original promise
      if (!isBundleSearchset(fhirData)) {
        return fhirData;
      }

      // At this point, fhirData is always a Bundle
      if (fhirData.entry) {
        allEntries = allEntries.concat(fhirData.entry);
      }

      const nextLink: BundleLink | undefined = fhirData.link?.find(
        (link) => link.relation === 'next'
      );

      // Set nextUrl to null if there are no more pages
      nextUrl = nextLink ? fixFhirNextUrl(nextLink.url, sourceServerUrl) : null;
      pageCount++;
      if (pageCount >= maxPages) {
        nextUrl = null;
      }
      // console.log(nextUrl);
    } catch (error) {
      // Return the original promise when an error occurs without any interruption
      console.error('Error processing FHIR resource:', error);

      return response.json();
    }
  } while (nextUrl);

  // At this point, fhirData is always a Bundle
  // Create a combined bundle with all entries
  return createCombinedBundle(allEntries, query);
};

function createCombinedBundle(entries: BundleEntry[], query: string): Bundle {
  return {
    resourceType: 'Bundle',
    id: nanoid(),
    meta: {
      lastUpdated: new Date().toISOString().replace('Z', '+00:00'),
      tag: [
        {
          code: `${query}:fhirpath`
        }
      ]
    },
    type: 'searchset',
    entry: entries
  };
}

// Fix nextLink as some FHIR servers have inaccurate URLs
// Example: Next link of https://proxy.smartforms.io/v/r4/fhir might be returned as http://proxy.smartforms.io/fhir (non HTTPS)
function fixFhirNextUrl(nextUrl: string, baseUrl: string) {
  const fhirRoute = '/fhir';
  const fhirIndex = nextUrl.indexOf(fhirRoute);

  // Replace everything before "/fhir" with correct base URL
  if (fhirIndex !== -1) {
    const nextQuery = nextUrl.slice(fhirIndex + fhirRoute.length);

    // Remove trailing slash from base URL if there are two slashes
    if (baseUrl.endsWith('/') && nextQuery.startsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    return baseUrl + nextQuery;
  }

  // Return original if "/fhir" is not found
  return nextUrl;
}

function isBundleSearchset(resource: unknown): resource is Bundle {
  if (!resource || typeof resource !== 'object') {
    return false;
  }
  return (
    'resourceType' in resource &&
    resource.resourceType === 'Bundle' &&
    'type' in resource &&
    resource.type === 'searchset'
  );
}

export const fetchTerminologyCallback: FetchTerminologyCallback = async (
  query: string,
  terminologyRequestConfig: FetchTerminologyRequestConfig
) => {
  let { terminologyServerUrl } = terminologyRequestConfig;

  const headers = {
    Accept: 'application/json;charset=utf-8'
  };

  if (!terminologyServerUrl.endsWith('/')) {
    terminologyServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : terminologyServerUrl + query;

  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
