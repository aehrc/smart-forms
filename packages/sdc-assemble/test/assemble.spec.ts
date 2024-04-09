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

import type { InputParameters } from '../src';
import { assemble } from '../src';
import assembleInputParams from './resources/assemble-input-params.json';
import assembledExpectation from './resources/assembled.json';
import axios from 'axios';

test('assemble should return the expected value', async () => {
  const inputParams = assembleInputParams as unknown as InputParameters;
  const assembled = await assemble(inputParams, (canonicalUrl) => {
    return axios.get(`https://api.smartforms.io/fhir/Questionnaire?url=${canonicalUrl}`, {
      method: 'GET',
      headers: { Accept: 'application/json;charset=utf-8' }
    });
  });

  expect(assembled).toEqual(assembledExpectation);
});
