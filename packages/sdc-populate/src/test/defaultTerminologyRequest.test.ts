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

import { defaultTerminologyRequest } from '../SDCPopulateQuestionnaireOperation/api/expandValueset';
import { expect } from '@jest/globals';

test('default terminology request $expand', async () => {
  const expandResult = await defaultTerminologyRequest(
    'ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender'
  );

  expect(expandResult).toBeDefined();
  expect(expandResult.resourceType).toBeDefined();
  expect(expandResult.resourceType).toEqual('ValueSet');
  expect(expandResult.url).toEqual('http://hl7.org/fhir/ValueSet/administrative-gender');
  expect(expandResult.expansion).toBeDefined();
  expect(expandResult.expansion.contains).toBeDefined();
  expect(expandResult.expansion.contains).toHaveLength(4);
});

test('default terminology request $lookup', async () => {
  const lookupResult = await defaultTerminologyRequest(
    'CodeSystem/$lookup?system=http://hl7.org/fhir/administrative-gender&code=female'
  );

  expect(lookupResult).toBeDefined();
  expect(lookupResult.resourceType).toBeDefined();
  expect(lookupResult.resourceType).toEqual('Parameters');
  expect(lookupResult.parameter).toBeDefined();
  expect(lookupResult.parameter.find((p: any) => p.name === 'code')).toEqual({
    name: 'code',
    valueCode: 'female'
  });
  expect(lookupResult.parameter.find((p: any) => p.name === 'display')).toEqual({
    name: 'display',
    valueString: 'Female'
  });
});
