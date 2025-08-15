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
import { getCanonicalUrls } from '../utils/canonical';

describe('getCanonicalUrls', () => {
  const mockParentQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'parent-questionnaire',
    status: 'draft',
    url: 'http://example.com/parent-questionnaire',
    item: [
      {
        linkId: 'root',
        type: 'group',
        item: [
          {
            linkId: 'item1',
            type: 'display',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: 'http://example.com/sub-questionnaire-1|1.0.0'
              }
            ]
          },
          {
            linkId: 'item2',
            type: 'display',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: 'http://example.com/sub-questionnaire-2|2.0.0'
              }
            ]
          },
          {
            linkId: 'item3',
            type: 'display'
            // No subQuestionnaire extension
          }
        ]
      }
    ]
  };

  it('should extract canonical URLs from subquestionnaire extensions', () => {
    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([
      'http://example.com/sub-questionnaire-1|1.0.0',
      'http://example.com/sub-questionnaire-2|2.0.0'
    ]);
  });

  it('should return error if root questionnaire does not have valid item structure', () => {
    const invalidQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'invalid',
      status: 'draft'
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(invalidQuestionnaire, totalCanonicals);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: 'Root questionnaire does not have a valid item.' }
        }
      ]
    });
  });

  it('should return error if root questionnaire item has no child items', () => {
    const emptyItemQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'empty-items',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group'
          // No item array
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(emptyItemQuestionnaire, totalCanonicals);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: 'Root questionnaire does not have a valid item.' }
        }
      ]
    });
  });

  it('should detect circular dependency and return error', () => {
    const totalCanonicals: string[] = [
      'http://example.com/sub-questionnaire-1|1.0.0',
      'http://example.com/other-questionnaire|1.0.0'
    ];
    const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'parent-questionnaire contains a circular dependency on the questionnaire http://example.com/sub-questionnaire-1|1.0.0'
          }
        }
      ]
    });
  });

  it('should skip items without subquestionnaire extensions', () => {
    const mixedQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'mixed',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group',
          item: [
            {
              linkId: 'item1',
              type: 'display',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                  valueCanonical: 'http://example.com/sub-questionnaire-1|1.0.0'
                }
              ]
            },
            {
              linkId: 'item2',
              type: 'string'
              // No extensions
            },
            {
              linkId: 'item3',
              type: 'display',
              extension: [
                {
                  url: 'http://other.extension',
                  valueString: 'other value'
                }
              ]
            }
          ]
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(mixedQuestionnaire, totalCanonicals);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(['http://example.com/sub-questionnaire-1|1.0.0']);
  });

  it('should return empty array when no subquestionnaire extensions are found', () => {
    const noSubquestionnairesQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'no-subquestionnaires',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group',
          item: [
            {
              linkId: 'item1',
              type: 'string'
            },
            {
              linkId: 'item2',
              type: 'display'
            }
          ]
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(noSubquestionnairesQuestionnaire, totalCanonicals);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });
});
