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

/**
 * To define a method to fetch resources from the FHIR server with a given query string
 * Method should be able to handle both absolute urls and query strings
 *
 * @param query - The query URL of the FHIR resource
 * @param requestConfig - Any request configs - can be headers, auth tokens or endpoints
 * @returns A promise of the FHIR resource (or an error)!
 *
 * @example
 * const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
 *
 * const fetchResourceCallback: FetchResourceCallback = (canonicalUrl: string, requestConfig: any) => {
 * const { clientEndpoint, authToken } = requestConfig
 * const headers = {
 *     'Cache-Control': 'no-cache',
 *     Accept: 'application/json;charset=utf-8',
 *     Authorization: `Bearer ${authToken}`
 *   };
 *
 *   if (ABSOLUTE_URL_REGEX.test(query)) {
 *     return axios.get(query, {
 *       headers: headers
 *     });
 *   } else {
 *     return axios.get(clientEndpoint + query, {
 *       headers: headers
 *     });
 *   }
 * };
 *
 *
 * @author Sean Fong
 */
export interface FetchResourceCallback {
  (query: string, requestConfig?: any): Promise<any>;
}
