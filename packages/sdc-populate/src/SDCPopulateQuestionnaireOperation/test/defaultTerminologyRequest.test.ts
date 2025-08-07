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

import { defaultTerminologyRequest } from '../api/defaultTerminologyRequest';
import { expect } from '@jest/globals';

describe('defaultTerminologyRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle $expand requests and return a ValueSet', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        resourceType: 'ValueSet',
        url: 'http://hl7.org/fhir/ValueSet/administrative-gender',
        expansion: {
          contains: [
            { code: 'male', display: 'Male' },
            { code: 'female', display: 'Female' },
            { code: 'other', display: 'Other' },
            { code: 'unknown', display: 'Unknown' }
          ]
        }
      })
    });

    const result = await defaultTerminologyRequest(
      'ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender'
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://tx.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender',
      expect.any(Object)
    );
    expect(result.resourceType).toEqual('ValueSet');
    expect(result.url).toEqual('http://hl7.org/fhir/ValueSet/administrative-gender');
    expect(result.expansion.contains).toHaveLength(4);
  });

  it('should handle $lookup requests and return Parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        resourceType: 'Parameters',
        parameter: [
          { name: 'code', valueCode: 'female' },
          { name: 'display', valueString: 'Female' }
        ]
      })
    });

    const result = await defaultTerminologyRequest(
      'CodeSystem/$lookup?system=http://hl7.org/fhir/administrative-gender&code=female'
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://tx.ontoserver.csiro.au/fhir/CodeSystem/$lookup?system=http://hl7.org/fhir/administrative-gender&code=female',
      expect.any(Object)
    );
    expect(result.resourceType).toEqual('Parameters');
    expect(result.parameter.find((p: any) => p.name === 'code')).toEqual({
      name: 'code',
      valueCode: 'female'
    });
    expect(result.parameter.find((p: any) => p.name === 'display')).toEqual({
      name: 'display',
      valueString: 'Female'
    });
  });

  it('should throw an error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({})
    });

    const failingQuery = 'ValueSet/$expand?url=http://bad-url';

    await expect(defaultTerminologyRequest(failingQuery)).rejects.toEqual(
      'HTTP error when performing https://tx.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://bad-url. Status: 500'
    );
  });
});
