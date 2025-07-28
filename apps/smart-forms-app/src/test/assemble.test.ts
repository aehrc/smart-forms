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

import { describe, expect, it } from '@jest/globals';
import type { Questionnaire } from 'fhir/r4';
import { assemblyIsRequired } from '../utils/assemble.ts';
import { QAssemblyInstructions } from './data-shared/QAssemblyInstructions.ts';
import { QRegularMedications } from './data-shared/QRegularMedications.ts';

// Mock the whole fhirclient library
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));

describe('assemblyIsRequired', () => {
  it('returns true if assemble-root extension is present', () => {
    expect(assemblyIsRequired(QAssemblyInstructions)).toBe(true);
  });

  it('returns false if extension is missing or incorrect', () => {
    expect(assemblyIsRequired({} as Questionnaire)).toBe(false);
    expect(assemblyIsRequired(QRegularMedications)).toBe(false);
  });
});
//
// describe('assembleQuestionnaire', () => {
//   it('returns assembled Questionnaire if assemble is successful', async () => {
//     const inputQ: Questionnaire = { resourceType: 'Questionnaire', id: 'q1', status: 'draft' };
//     const outputQ: Questionnaire = {
//       resourceType: 'Questionnaire',
//       id: 'assembled-q1',
//       status: 'draft'
//     };
//
//     // Mock FHIR.client() to return an object with the mocked request()
//     (FHIR.client as jest.Mock).mockReturnValue({
//       resourceType: 'Parameters',
//       parameter: [
//         {
//           resource: outputQ
//         }
//       ]
//     });
//
//     const result = await assembleQuestionnaire(inputQ);
//     expect(result).toEqual(outputQ);
//   });
//
//   it('returns OperationOutcome if output is not a Questionnaire', async () => {
//     const inputQ: Questionnaire = { resourceType: 'Questionnaire', id: 'q1', status: 'draft' };
//
//     const operationOutcome: OperationOutcome = {
//       resourceType: 'OperationOutcome',
//       issue: []
//     };
//
//     // Mock FHIR.client() to return a Parameters resource containing the OperationOutcome
//     (FHIR.client as jest.Mock).mockReturnValue({
//       request: jest.fn().mockResolvedValue({
//         resourceType: 'Parameters',
//         parameter: [{ resource: operationOutcome }]
//       })
//     });
//
//     const result = await assembleQuestionnaire(inputQ);
//     expect(result).toEqual(operationOutcome);
//   });
// });
//
// describe('updateAssembledQuestionnaire', () => {
//   it('sends PUT request to update assembled Questionnaire', async () => {
//     const assembledQ: Questionnaire = {
//       resourceType: 'Questionnaire',
//       id: 'assembled-q1',
//       status: 'draft'
//     };
//
//     const mockRequest = jest.fn().mockResolvedValue({});
//     (FHIR.client as jest.Mock).mockReturnValue({
//       request: jest.fn().mockResolvedValue({})
//     });
//
//     await updateAssembledQuestionnaire(assembledQ);
//
//     expect(mockRequest).toHaveBeenCalledWith(
//       expect.objectContaining({
//         url: 'Questionnaire/assembled-q1',
//         method: 'PUT',
//         body: JSON.stringify(assembledQ)
//       })
//     );
//   });
// });
//
// describe('assembleIfRequired', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//
//   it('returns existing assembled Questionnaire if found in bundle', async () => {
//     const baseQ: Questionnaire = QAssemblyInstructions;
//     const assembledQ = { resourceType: 'Questionnaire', id: 'q-assembled' };
//
//     (getFormsServerAssembledBundlePromise as jest.Mock).mockResolvedValue({
//       entry: [{ resource: assembledQ }]
//     });
//
//     const result = await assembleIfRequired(baseQ);
//     expect(result).toEqual(assembledQ);
//   });
//
//   it('returns null if assembly returns OperationOutcome', async () => {
//     const baseQ: Questionnaire = QAssemblyInstructions;
//
//     const operationOutcome: OperationOutcome = {
//       resourceType: 'OperationOutcome',
//       issue: []
//     };
//
//     (getFormsServerAssembledBundlePromise as jest.Mock).mockResolvedValue({ entry: [] });
//
//     const mockRequest = jest.fn().mockResolvedValueOnce({
//       parameter: [{ resource: operationOutcome }]
//     });
//
//     (FHIR.client as jest.Mock).mockReturnValue({
//       request: mockRequest
//     });
//
//     const result = await assembleIfRequired(baseQ);
//     expect(result).toBeNull();
//   });
//
//   it('returns original Questionnaire if no assemble required', async () => {
//     const inputQ: Questionnaire = {
//       resourceType: 'Questionnaire',
//       id: 'q1',
//       status: 'draft'
//     };
//     const result = await assembleIfRequired(inputQ);
//     expect(result).toEqual(inputQ);
//   });
// });
