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

import type { OperationOutcomeIssue } from 'fhir/r4';
import { fhirPathEvaluate } from '../utils/fhirpathEvaluate';

describe('fhirPathEvaluate', () => {
  const patient = {
    resourceType: 'Patient',
    gender: 'female',
    birthDate: '1980-01-01',
    name: [
      {
        family: 'Doe',
        given: ['Jane']
      }
    ]
  };

  it('evaluates a valid FHIRPath expression', () => {
    const warnings: OperationOutcomeIssue[] = [];
    const result = fhirPathEvaluate({
      fhirData: patient,
      path: 'gender',
      envVars: {},
      warnings
    });

    expect(result).toEqual(['female']);
    expect(warnings).toHaveLength(0);
  });

  it('evaluates an expression returning an array of strings', () => {
    const warnings: OperationOutcomeIssue[] = [];
    const result = fhirPathEvaluate({
      fhirData: patient,
      path: 'name.given.first()',
      envVars: {},
      warnings
    });

    expect(result).toEqual(['Jane']);
    expect(warnings).toHaveLength(0);
  });

  it('returns empty array and adds warning for invalid FHIRPath', () => {
    const warnings: OperationOutcomeIssue[] = [];
    const result = fhirPathEvaluate({
      fhirData: patient,
      path: 'name.invalidFunction()',
      envVars: {},
      warnings
    });

    expect(result).toEqual([]);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings?.[0]?.details?.text).toMatch(/invalidFunction/);
  });

  it('returns empty array for syntactically broken path', () => {
    const warnings: OperationOutcomeIssue[] = [];
    const result = fhirPathEvaluate({
      fhirData: patient,
      path: 'name[',
      envVars: {},
      warnings
    });

    expect(result).toEqual([]);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings?.[0]?.details?.text).toMatch(/mismatched input/);
  });
});
