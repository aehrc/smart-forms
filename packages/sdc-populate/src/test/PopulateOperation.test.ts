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

import { fetchResourceCallbackTest, requestConfigTest } from './fetchResourceCallbackTest';
import type { InputParameters } from '../SDCPopulateQuestionnaireOperation';
import { populate } from '../SDCPopulateQuestionnaireOperation';
// @ts-ignore
import InputParams from './resources/input-params-sample.json';
// @ts-ignore
import InputParamsResolved from './resources/input-params-sample-resolved.json';
import { expect } from '@jest/globals';

test('populate operation test', async () => {
  const outputParameters = await populate(
    InputParams as unknown as InputParameters,
    fetchResourceCallbackTest,
    requestConfigTest
  );

  expect(outputParameters).toBeDefined();
  expect(outputParameters.resourceType).toEqual('Parameters');

  // @ts-ignore
  const outputParamArray = outputParameters.parameter;
  expect(outputParamArray).toBeDefined();

  const questionnaireResource = outputParamArray.find((p: any) => p.name === 'response');
  expect(questionnaireResource).toBeDefined();
  expect(questionnaireResource.resource).toBeDefined();
  expect(questionnaireResource.resource.questionnaire).toContain(
    'http://www.health.gov.au/assessments/mbs/715|0.1.0'
  );
  expect(questionnaireResource.resource.subject).toEqual({
    type: 'Patient',
    reference: 'Patient/pat-sf'
  });

  // Check if blood pressure values are pre-populated
  const questionnaireItemString = JSON.stringify(questionnaireResource.resource.item);

  expect(questionnaireItemString).toContain('705f6d04-acab-4d14-baab-98f9bfc4808e');
  expect(questionnaireItemString).toContain('Blood pressure');

  expect(questionnaireItemString).toContain('e68b660d-cfd2-4b89-957a-c96a4c73a5fd');
  expect(questionnaireItemString).toContain('Systolic');
  expect(questionnaireItemString).toContain('165');

  expect(questionnaireItemString).toContain('867b0022-f812-4f80-b287-79686c972b15');
  expect(questionnaireItemString).toContain('Diastolic');
  expect(questionnaireItemString).toContain('95');
});

test('populate operation - input params with resolved resources', async () => {
  const outputParameters = await populate(
    InputParamsResolved as unknown as InputParameters,
    fetchResourceCallbackTest,
    requestConfigTest
  );

  expect(outputParameters).toBeDefined();
  expect(outputParameters.resourceType).toEqual('Parameters');

  // @ts-ignore
  const outputParamArray = outputParameters.parameter;
  expect(outputParamArray).toBeDefined();

  const questionnaireResource = outputParamArray.find((p: any) => p.name === 'response');
  expect(questionnaireResource).toBeDefined();
  expect(questionnaireResource.resource).toBeDefined();
  expect(questionnaireResource.resource.questionnaire).toContain(
    'http://www.health.gov.au/assessments/mbs/715|0.1.0'
  );
  expect(questionnaireResource.resource.subject).toEqual({
    type: 'Patient',
    reference: 'Patient/pat-sf'
  });

  // Check if blood pressure values are pre-populated
  const questionnaireItemString = JSON.stringify(questionnaireResource.resource.item);

  expect(questionnaireItemString).toContain('705f6d04-acab-4d14-baab-98f9bfc4808e');
  expect(questionnaireItemString).toContain('Blood pressure');

  expect(questionnaireItemString).toContain('e68b660d-cfd2-4b89-957a-c96a4c73a5fd');
  expect(questionnaireItemString).toContain('Systolic');
  expect(questionnaireItemString).toContain('165');

  expect(questionnaireItemString).toContain('867b0022-f812-4f80-b287-79686c972b15');
  expect(questionnaireItemString).toContain('Diastolic');
  expect(questionnaireItemString).toContain('95');
});
