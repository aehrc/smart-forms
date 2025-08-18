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

import type { Questionnaire, QuestionnaireItem, QuestionnaireItemEnableWhen } from 'fhir/r4';
import {
  extractOtherExtensions,
  initialiseEnableWhenItemProperties,
  initialiseEnableWhenRepeatItemProperties,
  initialiseEnableWhenSingleItemProperties
} from '../utils/questionnaireStoreUtils/extractOtherExtensions';

// Mock all the utility dependencies
jest.mock('../utils/valueSet', () => ({
  getValueSetPromise: jest.fn()
}));

jest.mock('../utils/questionnaireStoreUtils/extractVariables', () => ({
  getFhirPathVariables: jest.fn(),
  getXFhirQueryVariables: jest.fn()
}));

jest.mock('../utils/misc', () => ({
  getRepeatGroupParentItem: jest.fn()
}));

jest.mock('../utils/enableWhen', () => ({
  checkItemIsEnabledRepeat: jest.fn()
}));

jest.mock('../utils/emptyResource', () => ({
  emptyResponse: {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: []
  }
}));

jest.mock('../utils/enableWhenExpression', () => ({
  evaluateEnableWhenRepeatExpressionInstance: jest.fn()
}));

jest.mock('../utils/getExpressionsFromItem', () => ({
  getAnswerExpression: jest.fn(),
  getAnswerOptionsToggleExpressions: jest.fn(),
  getCalculatedExpressions: jest.fn(),
  getEnableWhenExpression: jest.fn(),
  getInitialExpression: jest.fn()
}));

jest.mock('../utils/parameterisedValueSets', () => ({
  addBindingParametersToValueSetUrl: jest.fn(),
  getBindingParameters: jest.fn()
}));

jest.mock('../utils/preferredTerminologyServer', () => ({
  getItemTerminologyServerToUse: jest.fn()
}));

import { getValueSetPromise } from '../utils/valueSet';
import { getFhirPathVariables, getXFhirQueryVariables } from '../utils/questionnaireStoreUtils/extractVariables';
import { getRepeatGroupParentItem } from '../utils/misc';
import { checkItemIsEnabledRepeat } from '../utils/enableWhen';
import { evaluateEnableWhenRepeatExpressionInstance } from '../utils/enableWhenExpression';
import {
  getAnswerExpression,
  getAnswerOptionsToggleExpressions,
  getCalculatedExpressions,
  getEnableWhenExpression,
  getInitialExpression
} from '../utils/getExpressionsFromItem';
import { addBindingParametersToValueSetUrl, getBindingParameters } from '../utils/parameterisedValueSets';
import { getItemTerminologyServerToUse } from '../utils/preferredTerminologyServer';

const mockGetValueSetPromise = getValueSetPromise as jest.MockedFunction<typeof getValueSetPromise>;
const mockGetFhirPathVariables = getFhirPathVariables as jest.MockedFunction<typeof getFhirPathVariables>;
const mockGetXFhirQueryVariables = getXFhirQueryVariables as jest.MockedFunction<typeof getXFhirQueryVariables>;
const mockGetRepeatGroupParentItem = getRepeatGroupParentItem as jest.MockedFunction<typeof getRepeatGroupParentItem>;
const mockCheckItemIsEnabledRepeat = checkItemIsEnabledRepeat as jest.MockedFunction<typeof checkItemIsEnabledRepeat>;
const mockEvaluateEnableWhenRepeatExpressionInstance = evaluateEnableWhenRepeatExpressionInstance as jest.MockedFunction<typeof evaluateEnableWhenRepeatExpressionInstance>;
const mockGetAnswerExpression = getAnswerExpression as jest.MockedFunction<typeof getAnswerExpression>;
const mockGetAnswerOptionsToggleExpressions = getAnswerOptionsToggleExpressions as jest.MockedFunction<typeof getAnswerOptionsToggleExpressions>;
const mockGetCalculatedExpressions = getCalculatedExpressions as jest.MockedFunction<typeof getCalculatedExpressions>;
const mockGetEnableWhenExpression = getEnableWhenExpression as jest.MockedFunction<typeof getEnableWhenExpression>;
const mockGetInitialExpression = getInitialExpression as jest.MockedFunction<typeof getInitialExpression>;
const mockAddBindingParametersToValueSetUrl = addBindingParametersToValueSetUrl as jest.MockedFunction<typeof addBindingParametersToValueSetUrl>;
const mockGetBindingParameters = getBindingParameters as jest.MockedFunction<typeof getBindingParameters>;
const mockGetItemTerminologyServerToUse = getItemTerminologyServerToUse as jest.MockedFunction<typeof getItemTerminologyServerToUse>;

describe('extractOtherExtensions - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractOtherExtensions', () => {
    it('should return empty structures when questionnaire has no items', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result).toEqual({
        variables: variables,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        valueSetPromises: valueSetPromises,
        processedValueSets: processedValueSets,
        cachedValueSetCodings: cachedValueSetCodings
      });
    });

    it('should return empty structures when questionnaire has empty items array', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result).toEqual({
        variables: variables,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        calculatedExpressions: {},
        initialExpressions: {},
        answerExpressions: {},
        answerOptions: {},
        answerOptionsToggleExpressions: {},
        valueSetPromises: valueSetPromises,
        processedValueSets: processedValueSets,
        cachedValueSetCodings: cachedValueSetCodings
      });
    });

    it('should process single questionnaire item with basic expressions', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'test-item',
            type: 'string',
            text: 'Test Question'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock basic function returns
      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result.variables).toEqual(variables);
      expect(result.enableWhenItems).toEqual({ singleItems: {}, repeatItems: {} });
      expect(result.enableWhenExpressions).toEqual({ singleExpressions: {}, repeatExpressions: {} });
      expect(result.calculatedExpressions).toEqual({});
      expect(result.initialExpressions).toEqual({});
      expect(result.answerExpressions).toEqual({});
      expect(result.answerOptions).toEqual({});
      expect(result.answerOptionsToggleExpressions).toEqual({});

      expect(mockGetItemTerminologyServerToUse).toHaveBeenCalledWith(
        questionnaire.item![0],
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );
    });

    it('should process questionnaire item with calculated expressions', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'calc-item',
            type: 'decimal',
            text: 'Calculated Field'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock calculated expressions
      const mockCalculatedExpressions = [
        { expression: 'calculation1', from: 'item' as const },
        { expression: 'calculation2', from: 'item' as const }
      ];

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue(mockCalculatedExpressions);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result.calculatedExpressions).toEqual({
        'calc-item': mockCalculatedExpressions
      });

      expect(mockGetCalculatedExpressions).toHaveBeenCalledWith(questionnaire.item![0]);
    });

    it('should process questionnaire item with initial expression', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'initial-item',
            type: 'string',
            text: 'Initial Value Field'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock initial expression
      const mockInitialExpression = { expression: 'initial-value', language: 'text/fhirpath' };

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(mockInitialExpression);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result.initialExpressions).toEqual({
        'initial-item': { expression: 'initial-value' }
      });

      expect(mockGetInitialExpression).toHaveBeenCalledWith(questionnaire.item![0]);
    });

    it('should process questionnaire item with answer expression', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'answer-item',
            type: 'choice',
            text: 'Answer Expression Field'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock answer expression
      const mockAnswerExpression = { expression: 'answer-expression', language: 'text/fhirpath' };

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(mockAnswerExpression);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result.answerExpressions).toEqual({
        'answer-item': { expression: 'answer-expression' }
      });

      expect(mockGetAnswerExpression).toHaveBeenCalledWith(questionnaire.item![0]);
    });

    it('should process questionnaire item with answerValueSet', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'valueset-item',
            type: 'choice',
            text: 'ValueSet Choice',
            answerValueSet: 'http://example.com/ValueSet/colors'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock ValueSet processing
      const mockBindingParameters = [{ name: 'param1', value: 'value1' }];
      const mockValueSetUrl = 'http://example.com/ValueSet/colors?param1=value1';
      const mockValueSetPromise = Promise.resolve({
        resourceType: 'ValueSet' as const,
        status: 'active' as const,
        url: 'http://example.com/ValueSet/colors'
      });

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);
      mockGetBindingParameters.mockReturnValue(mockBindingParameters);
      mockAddBindingParametersToValueSetUrl.mockReturnValue(mockValueSetUrl);
      mockGetValueSetPromise.mockReturnValue(mockValueSetPromise);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(mockGetBindingParameters).toHaveBeenCalledWith(
        questionnaire.item![0],
        'http://example.com/ValueSet/colors'
      );
      expect(mockAddBindingParametersToValueSetUrl).toHaveBeenCalledWith(
        'http://example.com/ValueSet/colors',
        mockBindingParameters
      );
      expect(mockGetValueSetPromise).toHaveBeenCalledWith(mockValueSetUrl, terminologyServerUrl);

      expect(result.valueSetPromises).toEqual({
        [mockValueSetUrl]: {
          promise: mockValueSetPromise
        }
      });
      expect(result.processedValueSets).toEqual({
        'http://example.com/ValueSet/colors': {
          initialValueSetUrl: 'http://example.com/ValueSet/colors',
          updatableValueSetUrl: mockValueSetUrl,
          bindingParameters: mockBindingParameters,
          isDynamic: false,
          linkIds: ['valueset-item']
        }
      });
      expect(result.cachedValueSetCodings).toEqual({
        [mockValueSetUrl]: []
      });
    });

    it('should process questionnaire item with dynamic ValueSet (with dynamic binding parameters)', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'dynamic-valueset-item',
            type: 'choice',
            text: 'Dynamic ValueSet Choice',
            answerValueSet: 'http://example.com/ValueSet/dynamic'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      // Mock dynamic ValueSet processing with FHIRPath expressions
      const mockBindingParameters = [
        { name: 'static-param', value: 'static-value' },
        { name: 'dynamic-param', value: '', fhirPathExpression: 'Patient.name' }
      ] as any[];
      const mockFixedBindingParameters = [{ name: 'static-param', value: 'static-value' }];
      const mockValueSetUrl = 'http://example.com/ValueSet/dynamic?static-param=static-value';
      const mockValueSetPromise = Promise.resolve({
        resourceType: 'ValueSet' as const,
        status: 'active' as const
      });

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);
      mockGetBindingParameters.mockReturnValue(mockBindingParameters);
      mockAddBindingParametersToValueSetUrl.mockReturnValue(mockValueSetUrl);
      mockGetValueSetPromise.mockReturnValue(mockValueSetPromise);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      expect(result.processedValueSets).toEqual({
        'http://example.com/ValueSet/dynamic': {
          initialValueSetUrl: 'http://example.com/ValueSet/dynamic',
          updatableValueSetUrl: mockValueSetUrl,
          bindingParameters: mockBindingParameters,
          isDynamic: true, // Should be true because of dynamic binding parameters
          linkIds: ['dynamic-valueset-item']
        }
      });
    });

    it('should process questionnaire item with referenced ValueSet (starts with #)', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'ref-valueset-item',
            type: 'choice',
            text: 'Referenced ValueSet Choice',
            answerValueSet: '#local-valueset'
          }
        ]
      };

      const variables = { fhirPathVariables: { 'QuestionnaireLevel': [] }, xFhirQueryVariables: {} };
      const valueSetPromises = {};
      const processedValueSets = {};
      const cachedValueSetCodings = {};
      const itemPreferredTerminologyServers = {};
      const terminologyServerUrl = 'http://terminology.hl7.org/fhir';

      mockGetItemTerminologyServerToUse.mockReturnValue(terminologyServerUrl);
      mockGetCalculatedExpressions.mockReturnValue([]);
      mockGetInitialExpression.mockReturnValue(null);
      mockGetAnswerExpression.mockReturnValue(null);
      mockGetAnswerOptionsToggleExpressions.mockReturnValue(null);
      mockGetEnableWhenExpression.mockReturnValue(null);
      mockGetFhirPathVariables.mockReturnValue([]);
      mockGetXFhirQueryVariables.mockReturnValue([]);

      const result = await extractOtherExtensions(
        questionnaire,
        variables,
        valueSetPromises,
        processedValueSets,
        cachedValueSetCodings,
        itemPreferredTerminologyServers,
        terminologyServerUrl
      );

      // Referenced ValueSets (starting with #) are processed for binding parameters but no promises created
      expect(result.valueSetPromises).toEqual({});
      expect(result.processedValueSets).toEqual({});
      expect(result.cachedValueSetCodings).toEqual({});

      // Binding parameters are still called to check for dynamic parameters
      expect(mockGetBindingParameters).toHaveBeenCalledWith(
        questionnaire.item![0],
        '#local-valueset'
      );
      expect(mockGetValueSetPromise).not.toHaveBeenCalled();
    });
  });

  describe('initialiseEnableWhenSingleItemProperties', () => {
    it('should create single enable when properties', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'other-item',
          operator: 'exists',
          answerBoolean: true
        }
      ];

      const result = initialiseEnableWhenSingleItemProperties(qItem, enableWhen);

      expect(result).toEqual({
        linked: [
          {
            enableWhen: {
              question: 'other-item',
              operator: 'exists',
              answerBoolean: true
            }
          }
        ],
        isEnabled: false,
        enableBehavior: undefined
      });
    });

    it('should handle multiple enableWhen conditions', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question',
        enableBehavior: 'all'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'item1',
          operator: '=',
          answerString: 'yes'
        },
        {
          question: 'item2',
          operator: 'exists',
          answerBoolean: true
        }
      ];

      const result = initialiseEnableWhenSingleItemProperties(qItem, enableWhen);

      expect(result).toEqual({
        linked: [
          {
            enableWhen: {
              question: 'item1',
              operator: '=',
              answerString: 'yes'
            }
          },
          {
            enableWhen: {
              question: 'item2',
              operator: 'exists',
              answerBoolean: true
            }
          }
        ],
        isEnabled: false,
        enableBehavior: 'all'
      });
    });
  });

  describe('initialiseEnableWhenRepeatItemProperties', () => {
    beforeEach(() => {
      mockGetRepeatGroupParentItem.mockClear();
      mockCheckItemIsEnabledRepeat.mockClear();
    });

    it('should return null when no linked parent item matches', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'other-item',
          operator: 'exists',
          answerBoolean: true
        }
      ];

      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const parentLinkId = 'parent-group';

      mockGetRepeatGroupParentItem.mockReturnValue(null);

      const result = initialiseEnableWhenRepeatItemProperties(
        qItem,
        enableWhen,
        questionnaire,
        parentLinkId
      );

      expect(result).toBeNull();
      expect(mockGetRepeatGroupParentItem).toHaveBeenCalledWith(questionnaire, 'other-item');
    });

    it('should return null when parent linkId does not match', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'other-item',
          operator: 'exists',
          answerBoolean: true
        }
      ];

      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const parentLinkId = 'parent-group';

      // Mock different parent linkId
      mockGetRepeatGroupParentItem.mockReturnValue({
        linkId: 'different-parent',
        type: 'group',
        text: 'Different Parent'
      });

      const result = initialiseEnableWhenRepeatItemProperties(
        qItem,
        enableWhen,
        questionnaire,
        parentLinkId
      );

      expect(result).toBeNull();
    });

    it('should create repeat enable when properties when parent linkId matches', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question',
        enableBehavior: 'any'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'other-item',
          operator: '=',
          answerString: 'yes'
        }
      ];

      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const parentLinkId = 'parent-group';

      // Mock matching parent linkId
      mockGetRepeatGroupParentItem.mockReturnValue({
        linkId: 'parent-group',
        type: 'group',
        text: 'Parent Group'
      });

      mockCheckItemIsEnabledRepeat.mockReturnValue(true);

      const result = initialiseEnableWhenRepeatItemProperties(
        qItem,
        enableWhen,
        questionnaire,
        parentLinkId
      );

      expect(result).toEqual({
        linked: [
          {
            enableWhen: {
              question: 'other-item',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent-group',
            answers: []
          }
        ],
        parentLinkId: 'parent-group',
        enabledIndexes: [true],
        enableBehavior: 'any'
      });

      expect(mockCheckItemIsEnabledRepeat).toHaveBeenCalledWith(
        expect.objectContaining({
          parentLinkId: 'parent-group',
          enableBehavior: 'any'
        }),
        0
      );
    });

    it('should handle multiple enableWhen conditions for repeat items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'string',
        text: 'Test Question'
      };

      const enableWhen: QuestionnaireItemEnableWhen[] = [
        {
          question: 'item1',
          operator: '=',
          answerString: 'yes'
        },
        {
          question: 'item2',
          operator: 'exists',
          answerBoolean: true
        }
      ];

      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const parentLinkId = 'parent-group';

      const mockParentItem = {
        linkId: 'parent-group',
        type: 'group' as const,
        text: 'Parent Group'
      };

      mockGetRepeatGroupParentItem
        .mockReturnValueOnce(mockParentItem)  // For item1
        .mockReturnValueOnce(mockParentItem); // For item2

      mockCheckItemIsEnabledRepeat.mockReturnValue(false);

      const result = initialiseEnableWhenRepeatItemProperties(
        qItem,
        enableWhen,
        questionnaire,
        parentLinkId
      );

      expect(result).toEqual({
        linked: [
          {
            enableWhen: {
              question: 'item1',
              operator: '=',
              answerString: 'yes'
            },
            parentLinkId: 'parent-group',
            answers: []
          },
          {
            enableWhen: {
              question: 'item2',
              operator: 'exists',
              answerBoolean: true
            },
            parentLinkId: 'parent-group',
            answers: []
          }
        ],
        parentLinkId: 'parent-group',
        enabledIndexes: [false],
        enableBehavior: undefined
      });

      expect(mockGetRepeatGroupParentItem).toHaveBeenCalledTimes(2);
    });
  });
});
