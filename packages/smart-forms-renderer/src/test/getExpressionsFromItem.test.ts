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

import { describe, expect, test } from '@jest/globals';
import {
  getInitialExpression,
  getEnableWhenExpression,
  getCalculatedExpressions,
  findCalculatedExpressionsInExtensions,
  getAnswerExpression,
  getAnswerOptionsToggleExpressions
} from '../utils/getExpressionsFromItem';
import type { QuestionnaireItem, Extension } from 'fhir/r4';

describe('getExpressionsFromItem utils', () => {
  describe('getInitialExpression', () => {
    test('should return initialExpression when present with correct URL and language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.name[0].given[0]'
            }
          }
        ]
      };

      const result = getInitialExpression(qItem);

      expect(result).toEqual({
        language: 'text/fhirpath',
        expression: 'Patient.name[0].given[0]'
      });
    });

    test('should return null when extension with correct URL exists but wrong language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
            valueExpression: {
              language: 'text/cql',
              expression: 'Patient.name[0].given[0]'
            }
          }
        ]
      };

      const result = getInitialExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when extension with wrong URL exists', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://example.com/wrong-url',
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.name[0].given[0]'
            }
          }
        ]
      };

      const result = getInitialExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when no extensions exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      const result = getInitialExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when extension exists but no valueExpression', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression'
          }
        ]
      };

      const result = getInitialExpression(qItem);

      expect(result).toBeNull();
    });
  });

  describe('getEnableWhenExpression', () => {
    test('should return enableWhenExpression when present with correct URL and language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: '%age > 18'
            }
          }
        ]
      };

      const result = getEnableWhenExpression(qItem);

      expect(result).toEqual({
        language: 'text/fhirpath',
        expression: '%age > 18'
      });
    });

    test('should return null when extension with correct URL exists but wrong language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
            valueExpression: {
              language: 'text/cql',
              expression: '%age > 18'
            }
          }
        ]
      };

      const result = getEnableWhenExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when no matching extensions exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://example.com/other-extension',
            valueExpression: {
              language: 'text/fhirpath',
              expression: '%age > 18'
            }
          }
        ]
      };

      const result = getEnableWhenExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when item has no extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      const result = getEnableWhenExpression(qItem);

      expect(result).toBeNull();
    });
  });

  describe('getCalculatedExpressions', () => {
    test('should return calculated expressions from item extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'decimal',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: '%weight / (%height * %height)'
            }
          }
        ]
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        expression: '%weight / (%height * %height)',
        from: 'item'
      });
    });

    test('should return calculated expressions from item._text extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: 'Patient.name.given.first()'
              }
            }
          ]
        }
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        expression: 'Patient.name.given.first()',
        from: 'item._text'
      });
    });

    test('should return cqf expressions from item._text extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%total + 10'
              }
            }
          ]
        }
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        expression: '%total + 10',
        from: 'item._text'
      });
    });

    test('should return cqf expressions from item._answerValueSet extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        _answerValueSet: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: 'ValueSet.where(id = %valueSetId)'
              }
            }
          ]
        }
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        expression: 'ValueSet.where(id = %valueSetId)',
        from: 'item._answerValueSet'
      });
    });

    test('should combine expressions from multiple sources', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'decimal',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: '%weight * 2.2'
            }
          }
        ],
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: 'Patient.name.family'
              }
            }
          ]
        }
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        expression: '%weight * 2.2',
        from: 'item'
      });
      expect(result[1]).toEqual({
        expression: 'Patient.name.family',
        from: 'item._text'
      });
    });

    test('should filter out expressions with empty expression strings', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: ''
            }
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'valid expression'
            }
          }
        ]
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('valid expression');
    });

    test('should return empty array when no calculated expressions found', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://example.com/other-extension',
            valueString: 'not a calculated expression'
          }
        ]
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(0);
    });

    test('should handle missing valueExpression gracefully', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression'
          }
        ]
      };

      const result = getCalculatedExpressions(qItem);

      expect(result).toHaveLength(0);
    });
  });

  describe('findCalculatedExpressionsInExtensions', () => {
    test('should find extensions with correct URL and language', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'test expression'
          }
        },
        {
          url: 'http://example.com/other-extension',
          valueString: 'not a calculated expression'
        }
      ];

      const result = findCalculatedExpressionsInExtensions(extensions);

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression');
    });

    test('should filter out extensions with wrong URL', () => {
      const extensions: Extension[] = [
        {
          url: 'http://example.com/wrong-url',
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'test expression'
          }
        }
      ];

      const result = findCalculatedExpressionsInExtensions(extensions);

      expect(result).toHaveLength(0);
    });

    test('should filter out extensions with wrong language', () => {
      const extensions: Extension[] = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/cql',
            expression: 'test expression'
          }
        }
      ];

      const result = findCalculatedExpressionsInExtensions(extensions);

      expect(result).toHaveLength(0);
    });

    test('should return empty array for empty input', () => {
      const result = findCalculatedExpressionsInExtensions([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAnswerExpression', () => {
    test('should return answerExpression when present with correct URL and language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.gender'
            }
          }
        ]
      };

      const result = getAnswerExpression(qItem);

      expect(result).toEqual({
        language: 'text/fhirpath',
        expression: 'Patient.gender'
      });
    });

    test('should return null when extension with correct URL exists but wrong language', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
            valueExpression: {
              language: 'text/cql',
              expression: 'Patient.gender'
            }
          }
        ]
      };

      const result = getAnswerExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when no matching extensions exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://example.com/other-extension',
            valueExpression: {
              language: 'text/fhirpath',
              expression: 'Patient.gender'
            }
          }
        ]
      };

      const result = getAnswerExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when extension exists but no valueExpression', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression'
          }
        ]
      };

      const result = getAnswerExpression(qItem);

      expect(result).toBeNull();
    });

    test('should return null when item has no extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string'
      };

      const result = getAnswerExpression(qItem);

      expect(result).toBeNull();
    });
  });

  describe('getAnswerOptionsToggleExpressions', () => {
    test('should return answerOptionsToggleExpressions when properly configured', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
            extension: [
              {
                url: 'option',
                valueCoding: {
                  system: 'http://test.com',
                  code: 'option1',
                  display: 'Option 1'
                }
              },
              {
                url: 'option',
                valueString: 'option2'
              },
              {
                url: 'expression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '%condition = true'
                }
              }
            ]
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual({
        linkId: 'test-item',
        options: [
          {
            valueCoding: {
              system: 'http://test.com',
              code: 'option1',
              display: 'Option 1'
            }
          },
          {
            valueString: 'option2'
          }
        ],
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%condition = true'
        }
      });
    });

    test('should handle multiple answerOptionsToggleExpression extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
            extension: [
              {
                url: 'option',
                valueInteger: 1
              },
              {
                url: 'expression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '%condition1 = true'
                }
              }
            ]
          },
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
            extension: [
              {
                url: 'option',
                valueString: 'option2'
              },
              {
                url: 'expression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '%condition2 = true'
                }
              }
            ]
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toHaveLength(2);
    });

    test('should return null when no answerOptionsToggleExpression extensions exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://example.com/other-extension',
            valueString: 'not an answer options toggle expression'
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toBeNull();
    });

    test('should return null when extension exists but has no sub-extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression'
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toBeNull();
    });

    test('should return null when extension has sub-extensions but no valid options or expression', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
            extension: [
              {
                url: 'invalid',
                valueString: 'invalid extension'
              }
            ]
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toBeNull();
    });

    test('should filter out invalid option extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression',
            extension: [
              {
                url: 'option',
                valueString: 'valid-option'
              },
              {
                url: 'option',
                valueBoolean: true // This should be filtered out by optionIsAnswerOptionsToggleExpressionOption
              },
              {
                url: 'expression',
                valueExpression: {
                  language: 'text/fhirpath',
                  expression: '%condition = true'
                }
              }
            ]
          }
        ]
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toHaveLength(1);
      expect(result![0].options).toHaveLength(1);
      expect(result![0].options[0]).toEqual({ valueString: 'valid-option' });
    });

    test('should return null when item has no extensions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice'
      };

      const result = getAnswerOptionsToggleExpressions(qItem);

      expect(result).toBeNull();
    });
  });
});
