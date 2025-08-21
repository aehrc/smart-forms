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

import { rendererPropsList } from '../standaloneList';

describe('standaloneList', () => {
  it('exports rendererPropsList as an array', () => {
    expect(Array.isArray(rendererPropsList)).toBe(true);
    expect(rendererPropsList.length).toBeGreaterThan(0);
  });

  it('contains expected questionnaire entries', () => {
    const ids = rendererPropsList.map((item) => item.id);

    expect(ids).toContain('AboriginalTorresStraitIslanderHealthCheck');
    expect(ids).toContain('TestGrid');
    expect(ids).toContain('CVDRiskCalculator');
    expect(ids).toContain('DemoAnswerExpression');
    expect(ids).toContain('BitOfEverything');
  });

  it('all entries have required properties', () => {
    rendererPropsList.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('questionnaire');
      expect(item).toHaveProperty('response');
      expect(item).toHaveProperty('additionalVars');
      expect(item).toHaveProperty('terminologyServerUrl');
      expect(item).toHaveProperty('readOnly');

      expect(typeof item.id).toBe('string');
      expect(typeof item.questionnaire).toBe('object');
      expect(typeof item.readOnly).toBe('boolean');
    });
  });

  it('questionnaires have resourceType of Questionnaire', () => {
    rendererPropsList.forEach((item) => {
      expect(item.questionnaire.resourceType).toBe('Questionnaire');
    });
  });

  it('responses have correct resourceType when not null', () => {
    rendererPropsList.forEach((item) => {
      if (item.response !== null) {
        expect(item.response.resourceType).toBe('QuestionnaireResponse');
      }
    });
  });

  it('readOnly is false for all entries', () => {
    rendererPropsList.forEach((item) => {
      expect(item.readOnly).toBe(false);
    });
  });
});
