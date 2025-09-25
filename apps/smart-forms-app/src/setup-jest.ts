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

import '@testing-library/jest-dom';
import { mockFhirClient } from './test/data-shared/mockFhirClient.ts';

// Polyfill for structuredClone
global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));

// Need to mock as nanoid is an ESM module
jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-id-123'
}));

// Mock CSS imports
jest.mock('@fontsource/inter', () => ({}));

// Mock smart-forms-renderer module functions
jest.mock('@aehrc/smart-forms-renderer', () => ({
  getQrItemsIndex: jest.fn().mockReturnValue({}),
  isSpecificItemControl: jest.fn().mockReturnValue(false),
  mapQItemsIndex: jest.fn().mockReturnValue({}),
  parseFhirDateTimeToDisplayDateTime: jest.fn().mockReturnValue({
    displayDateTime: '01/01/2023, 12:00 PM',
    dateParseFail: false
  }),
  parseFhirDateToDisplayDate: jest.fn().mockReturnValue({
    displayDate: '01/01/2023',
    dateParseFail: false
  }),
  canBeObservationExtracted: jest.fn()
}));

// Mock sdc-template-extract module functions
jest.mock('@aehrc/sdc-template-extract', () => ({
  canBeTemplateExtracted: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parametersIsFhirPatch: jest.fn().mockImplementation((resource: any) => {
    // Return true for Parameters resources that have parameter array
    // and look like valid FHIR patch structures
    if (resource?.resourceType !== 'Parameters' || !Array.isArray(resource?.parameter)) {
      return false;
    }

    // Check if all operations have valid types (not containing "invalid")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return resource.parameter.every((param: any) => {
      if (param.name !== 'operation' || !Array.isArray(param.part)) {
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typePart = param.part.find((part: any) => part.name === 'type');
      return (
        typePart &&
        typeof typePart.valueCode === 'string' &&
        !typePart.valueCode.includes('invalid')
      );
    });
  })
}));

// Mock read methods on client.patient, client.user, client.encounter
mockFhirClient.patient.read = jest.fn().mockResolvedValue({
  resourceType: 'Patient',
  id: mockFhirClient.patient.id
});

mockFhirClient.user.read = jest.fn().mockResolvedValue({
  resourceType: 'Practitioner',
  id: mockFhirClient.user.id
});

mockFhirClient.encounter.read = jest.fn().mockResolvedValue({
  resourceType: 'Encounter',
  id: null
});

// Mock the whole fhirclient library
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));
