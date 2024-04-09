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
 * To define a method to fetch Questionnaire resources from the FHIR server with the given canonical URL
 * @see {@link https://www.hl7.org/fhir/questionnaire.html}
 *
 * @param canonicalUrl - The canonical URL of the Questionnaire resource
 * @param requestConfig - Any kind of request configuration necessary (auth, token, etc)
 * @returns A promise of the Questionnaire Bundle resource (or an error)!
 *
 * @example
 * const fetchQuestionnaireCallback: FetchQuestionnaireCallback = (canonicalUrl: string, requestConfig: any) => {
 *   const { endpoint, token } = requestConfig;
 *   return axios.get(`${endpoint}/Questionnaire?url=${canonicalUrl}`, {
 *     method: 'GET',
 *     headers: { Accept: 'application/json;charset=utf-8', Authorization: `Bearer ${token}`, }
 *   });
 * };
 *
 * @author Sean Fong
 */
export interface FetchQuestionnaireCallback {
  (canonicalUrl: string, requestConfig?: any): Promise<any>;
}
