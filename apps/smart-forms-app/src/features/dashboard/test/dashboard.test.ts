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

import type { Bundle } from 'fhir/r4';
import { getFormsServerBundlePromise } from '../utils/dashboard';
import * as FHIR from 'fhirclient';
import { expect } from '@jest/globals';

const mockRequest = jest.fn();
(FHIR.client as jest.Mock).mockReturnValue({
  request: mockRequest
});

describe('getFormsServerBundlePromise', () => {
  it('calls FHIR.client with correct URL and headers', async () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      entry: [],
      type: 'searchset'
    };
    mockRequest.mockResolvedValue(bundle);

    const result = await getFormsServerBundlePromise('Questionnaire?url=http://x|1.0');
    expect(mockRequest).toHaveBeenCalledWith({
      url: 'Questionnaire?url=http://x&version=1.0',
      headers: expect.anything()
    });
    expect(result).toEqual(bundle);
  });
});

// describe('getFormsServerAssembledBundlePromise', () => {
//   it('behaves like getFormsServerBundlePromise', async () => {
//     const bundle: Bundle = { resourceType: 'Bundle', entry: [] };
//     mockRequest.mockResolvedValue(bundle);
//
//     const result = await getFormsServerAssembledBundlePromise('Questionnaire?url=http://y|2.1');
//     expect(mockRequest).toHaveBeenCalledWith({
//       url: 'Questionnaire?url=http://y&version=2.1',
//       headers: HEADERS
//     });
//     expect(result).toEqual(bundle);
//   });
// });
//
// describe('getClientBundlePromise', () => {
//   it('calls client.request with correct URL and headers', async () => {
//     const mockClient: Client = {
//       request: jest.fn().mockResolvedValue({ resourceType: 'Bundle', entry: [] })
//     } as any;
//
//     const result = await getClientBundlePromise(mockClient, 'Observation?code=123');
//     expect(mockClient.request).toHaveBeenCalledWith({
//       url: 'Observation?code=123',
//       headers: HEADERS
//     });
//     expect(result.resourceType).toBe('Bundle');
//   });
// });
//
// describe('getFormsServerBundleOrQuestionnairePromise', () => {
//   it('removes SMARTcopy and transforms version in URL', async () => {
//     const bundle: Bundle = { resourceType: 'Bundle', entry: [] };
//     mockRequest.mockResolvedValue(bundle);
//
//     const result = await getFormsServerBundleOrQuestionnairePromise(
//       'Questionnaire?url=http://z|3.0-SMARTcopy'
//     );
//     expect(mockRequest).toHaveBeenCalledWith({
//       url: 'Questionnaire?url=http://z&version=3.0',
//       headers: HEADERS
//     });
//     expect(result).toEqual(bundle);
//   });
//
//   it('handles Questionnaire return', async () => {
//     const questionnaire: Questionnaire = {
//       resourceType: 'Questionnaire',
//       id: 'q123'
//     };
//     mockRequest.mockResolvedValue(questionnaire);
//
//     const result = await getFormsServerBundleOrQuestionnairePromise('Questionnaire/q123');
//     expect(mockRequest).toHaveBeenCalledWith({
//       url: 'Questionnaire/q123',
//       headers: HEADERS
//     });
//     expect(result).toEqual(questionnaire);
//   });
// });
