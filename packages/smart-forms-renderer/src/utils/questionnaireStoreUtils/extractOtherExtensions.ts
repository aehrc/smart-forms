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

import type {
  Coding,
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemEnableWhen
} from 'fhir/r4';
import type { CalculatedExpression } from '../../interfaces/calculatedExpression.interface';
import type {
  EnableWhenExpressions,
  EnableWhenItems,
  EnableWhenRepeatExpression,
  EnableWhenRepeatItemProperties,
  EnableWhenRepeatLinkedItem,
  EnableWhenSingleExpression,
  EnableWhenSingleItemProperties,
  EnableWhenSingleLinkedItem
} from '../../interfaces/enableWhen.interface';
import type { AnswerExpression } from '../../interfaces/answerExpression.interface';
import type { ProcessedValueSet, ValueSetPromise } from '../../interfaces/valueSet.interface';
import { getTerminologyServerUrl, getValueSetPromise } from '../valueSet';
import type { Variables } from '../../interfaces/variables.interface';
import { getFhirPathVariables, getXFhirQueryVariables } from './extractVariables';
import { getRepeatGroupParentItem } from '../misc';
import { checkItemIsEnabledRepeat } from '../enableWhen';
import { emptyResponse } from '../emptyResource';
import { evaluateEnableWhenRepeatExpressionInstance } from '../enableWhenExpression';
import {
  getAnswerExpression,
  getCalculatedExpressions,
  getEnableWhenExpression,
  getInitialExpression
} from '../getExpressionsFromItem';
import type { InitialExpression } from '../../interfaces/initialExpression.interface';
import { addBindingParametersToValueSetUrl, getBindingParameters } from '../parameterisedValueSets';

interface ReturnParamsRecursive {
  variables: Variables;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  valueSetPromises: Record<string, ValueSetPromise>;
  processedValueSets: Record<string, ProcessedValueSet>;
  cachedValueSetCodings: Record<string, Coding[]>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
}

export async function extractOtherExtensions(
  questionnaire: Questionnaire,
  variables: Variables,
  valueSetPromises: Record<string, ValueSetPromise>,
  processedValueSets: Record<string, ProcessedValueSet>,
  cachedValueSetCodings: Record<string, Coding[]>,
  itemPreferredTerminologyServers: Record<string, string>,
  terminologyServerUrl: string
): Promise<ReturnParamsRecursive> {
  const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
  const enableWhenExpressions: EnableWhenExpressions = {
    singleExpressions: {},
    repeatExpressions: {}
  };
  const calculatedExpressions: Record<string, CalculatedExpression[]> = {};
  const initialExpressions: Record<string, InitialExpression> = {};
  const answerExpressions: Record<string, AnswerExpression> = {};
  const answerOptions: Record<string, QuestionnaireItemAnswerOption[]> = {};

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {
      variables: variables,
      enableWhenItems: { singleItems: {}, repeatItems: {} },
      enableWhenExpressions: {
        singleExpressions: {},
        repeatExpressions: {}
      },
      calculatedExpressions: {},
      initialExpressions: {},
      answerExpressions: {},
      answerOptions: {},
      valueSetPromises: valueSetPromises,
      processedValueSets: processedValueSets,
      cachedValueSetCodings: cachedValueSetCodings
    };
  }

  for (const topLevelItem of questionnaire.item) {
    const isRepeatGroup = !!topLevelItem.repeats && topLevelItem.type === 'group';
    await extractExtensionsFromItemRecursive({
      questionnaire,
      item: topLevelItem,
      variables,
      enableWhenItems,
      enableWhenExpressions,
      calculatedExpressions,
      initialExpressions,
      answerExpressions,
      answerOptions,
      valueSetPromises,
      processedValueSets,
      cachedValueSetCodings,
      itemPreferredTerminologyServers,
      defaultTerminologyServerUrl: terminologyServerUrl,
      parentRepeatGroupLinkId: isRepeatGroup ? topLevelItem.linkId : undefined
    });
  }

  return {
    variables,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions,
    valueSetPromises,
    processedValueSets,
    cachedValueSetCodings
  };
}

interface extractExtensionsFromItemRecursiveParams {
  questionnaire: Questionnaire;
  item: QuestionnaireItem;
  variables: Variables;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
  valueSetPromises: Record<string, ValueSetPromise>;
  processedValueSets: Record<string, ProcessedValueSet>;
  cachedValueSetCodings: Record<string, Coding[]>;
  itemPreferredTerminologyServers: Record<string, string>;
  defaultTerminologyServerUrl: string;
  parentRepeatGroupLinkId?: string;
}

async function extractExtensionsFromItemRecursive(
  params: extractExtensionsFromItemRecursiveParams
): Promise<ReturnParamsRecursive> {
  const {
    questionnaire,
    item,
    variables,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions,
    valueSetPromises,
    processedValueSets,
    cachedValueSetCodings,
    itemPreferredTerminologyServers,
    defaultTerminologyServerUrl,
    parentRepeatGroupLinkId
  } = params;

  const items = item.item;
  const isRepeatGroup = !!item.repeats && item.type === 'group';
  if (items && items.length > 0) {
    // iterate through items of item recursively
    for (const childItem of items) {
      await extractExtensionsFromItemRecursive({
        ...params,
        item: childItem,
        parentRepeatGroupLinkId: isRepeatGroup ? item.linkId : parentRepeatGroupLinkId
      });
    }
  }

  // Read enable when items, enableWhen/calculated/answer expressions, valueSets and variables from qItem
  const initialisedEnableWhenItemProperties = initialiseEnableWhenItemProperties(
    item,
    questionnaire,
    parentRepeatGroupLinkId
  );
  if (initialisedEnableWhenItemProperties) {
    const { enableWhenItemType, enableWhenItemProperties } = initialisedEnableWhenItemProperties;
    if (enableWhenItemType === 'single') {
      enableWhenItems.singleItems[item.linkId] =
        enableWhenItemProperties as EnableWhenSingleItemProperties;
    } else if (enableWhenItemType === 'repeat') {
      enableWhenItems.repeatItems[item.linkId] =
        enableWhenItemProperties as EnableWhenRepeatItemProperties;
    }
  }

  // Get preferred terminology server URL of the item
  const preferredTerminologyServerUrl = itemPreferredTerminologyServers[item.linkId];
  const terminologyServerUrl =
    getTerminologyServerUrl(item) ?? preferredTerminologyServerUrl ?? defaultTerminologyServerUrl;

  const initialisedEnableWhenExpressions = await initialiseEnableWhenExpression(
    item,
    questionnaire,
    terminologyServerUrl,
    parentRepeatGroupLinkId
  );
  if (initialisedEnableWhenExpressions) {
    const { enableWhenExpressionType, enableWhenExpression } = initialisedEnableWhenExpressions;

    if (enableWhenExpressionType === 'single') {
      enableWhenExpressions.singleExpressions[item.linkId] =
        enableWhenExpression as EnableWhenSingleExpression;
    } else if (enableWhenExpressionType === 'repeat') {
      enableWhenExpressions.repeatExpressions[item.linkId] =
        enableWhenExpression as EnableWhenRepeatExpression;
    }
  }

  // Get calculatedExpressions
  const calculatedExpressionsOfItem = getCalculatedExpressions(item);
  if (calculatedExpressionsOfItem.length > 0) {
    calculatedExpressions[item.linkId] = calculatedExpressionsOfItem;
  }

  // Get initialExpressions
  const initialExpression = getInitialExpression(item);
  if (initialExpression) {
    initialExpressions[item.linkId] = {
      expression: `${initialExpression.expression}`
    };
  }

  // Get answerExpressions
  const answerExpression = getAnswerExpression(item);
  if (answerExpression) {
    answerExpressions[item.linkId] = {
      expression: `${answerExpression.expression}`
    };
  }

  // Get answerOptions
  const options = item.answerOption ?? null;
  if (options) {
    answerOptions[item.linkId] = options;
  }

  const initialValueSetUrl = item.answerValueSet;
  if (initialValueSetUrl) {
    const bindingParameters = getBindingParameters(item, initialValueSetUrl);
    const fixedBindingParameters = bindingParameters.filter((param) => !param.fhirPathExpression);
    const isDynamic = bindingParameters.length !== fixedBindingParameters.length;
    const valueSetUrlWithParams = addBindingParametersToValueSetUrl(
      initialValueSetUrl,
      fixedBindingParameters
    );

    // Only continue to process if answerValueSetUrl is not a reference, because we have already processed it earlier
    if (!initialValueSetUrl.startsWith('#')) {
      // Get valueSet promise to be resolved
      // Note: this entry uses valueSetUrlWithParams as the key
      if (!valueSetPromises[initialValueSetUrl]) {
        valueSetPromises[valueSetUrlWithParams] = {
          promise: getValueSetPromise(valueSetUrlWithParams, terminologyServerUrl)
        };
      }

      // Create entries in processedValueSets and cachedValueSetCodings
      // Note: initialValueSetUrl is key for processedValueSets, while valueSetUrlWithParams is key for cachedValueSetCodings
      processedValueSets[initialValueSetUrl] = {
        initialValueSetUrl: initialValueSetUrl,
        updatableValueSetUrl: valueSetUrlWithParams,
        bindingParameters: bindingParameters,
        isDynamic: isDynamic
      };
      cachedValueSetCodings[valueSetUrlWithParams] = [];
    }
  }

  if (item.extension) {
    variables.fhirPathVariables[item.linkId] = getFhirPathVariables(item.extension);

    for (const expression of getXFhirQueryVariables(item.extension)) {
      if (expression.name) {
        variables.xFhirQueryVariables[expression.name] = {
          valueExpression: expression
        };
      }
    }
  }

  return {
    variables,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions,
    valueSetPromises,
    processedValueSets,
    cachedValueSetCodings
  };
}

/**
 * Get enableWhen items' linked items and enableBehaviour attribute and save them in an EnableWhenItemProperties object
 *
 * @author Sean Fong
 */
export function initialiseEnableWhenItemProperties(
  qItem: QuestionnaireItem,
  questionnaire: Questionnaire,
  parentLinkId?: string
): {
  enableWhenItemType: 'single' | 'repeat';
  enableWhenItemProperties: EnableWhenSingleItemProperties | EnableWhenRepeatItemProperties;
} | null {
  const enableWhen = qItem.enableWhen;
  if (!enableWhen) {
    return null;
  }

  // Parent repeat group linkId exist, try to classify this item as a repeat enableWhen item
  if (parentLinkId) {
    const enableWhenRepeatItemProperties = initialiseEnableWhenRepeatItemProperties(
      qItem,
      enableWhen,
      questionnaire,
      parentLinkId
    );

    if (enableWhenRepeatItemProperties) {
      return {
        enableWhenItemType: 'repeat',
        enableWhenItemProperties: enableWhenRepeatItemProperties
      };
    }
  }

  // If parentLinkId is not provided or item cannot be classified as a repeat enableWhen item, classify it as a single enableWhen item
  const enableWhenSingleItemProperties = initialiseEnableWhenSingleItemProperties(
    qItem,
    enableWhen
  );
  return {
    enableWhenItemType: 'single',
    enableWhenItemProperties: enableWhenSingleItemProperties
  };
}

export function initialiseEnableWhenRepeatItemProperties(
  qItem: QuestionnaireItem,
  enableWhen: QuestionnaireItemEnableWhen[],
  questionnaire: Questionnaire,
  parentLinkId: string
): EnableWhenRepeatItemProperties | null {
  const linkedItemsNullable = enableWhen.map((linkedItem): EnableWhenRepeatLinkedItem | null => {
    const linkedParentItem = getRepeatGroupParentItem(questionnaire, linkedItem.question);
    // Check if parentLinkId match the linked item's parent linkId
    if (parentLinkId === linkedParentItem?.linkId) {
      return { enableWhen: linkedItem, parentLinkId: linkedParentItem.linkId, answers: [] };
    }

    // Otherwise, this linked item is not a valid repeat enableWhen linked item
    return null;
  });

  // If any linked item is not valid, exit early
  if (linkedItemsNullable.some((linkedItem) => linkedItem === null)) {
    return null;
  }

  const linkedItems = linkedItemsNullable as EnableWhenRepeatLinkedItem[];
  const enableWhenRepeatItemProperties = {
    linked: linkedItems as EnableWhenRepeatLinkedItem[],
    parentLinkId: parentLinkId,
    enabledIndexes: [false],
    enableBehavior: qItem.enableBehavior
  };

  enableWhenRepeatItemProperties.enabledIndexes[0] = checkItemIsEnabledRepeat(
    enableWhenRepeatItemProperties,
    0
  );

  return enableWhenRepeatItemProperties;
}

/**
 * Get enableWhen items' linked items and enableBehaviour attribute and save them in an EnableWhenItemProperties object
 *
 * @author Sean Fong
 */
export function initialiseEnableWhenSingleItemProperties(
  qItem: QuestionnaireItem,
  enableWhen: QuestionnaireItemEnableWhen[]
): EnableWhenSingleItemProperties {
  return {
    linked: enableWhen.map((linkedItem): EnableWhenSingleLinkedItem => {
      return { enableWhen: linkedItem };
    }),
    isEnabled: false,
    enableBehavior: qItem.enableBehavior
  };
}

function initialiseEnableWhenExpressionRepeat(
  enableWhenExpression: Expression,
  questionnaire: Questionnaire,
  parentLinkId: string
): Expression | null {
  const expression = enableWhenExpression.expression;
  if (!expression) {
    return null;
  }

  // Get the last linkId in the expression
  const regExpLinkId = /linkId\s*=\s*'([^']+)'/g;
  const matches = expression.replace(' ', '').match(regExpLinkId);
  if (!matches) {
    return null;
  }
  const linkIdMatches = matches.map((match) =>
    match.substring(match.indexOf("'") + 1, match.lastIndexOf("'"))
  );
  const lastLinkIdMatch = linkIdMatches[linkIdMatches.length - 1];

  // Use the last linkId as the linkedItem, and get it's repeat group parent item's linkId
  // If both parent linkId matches, this enableWhenExpression is a repeat enableWhenExpression
  const linkedParentItem = getRepeatGroupParentItem(questionnaire, lastLinkIdMatch);
  if (parentLinkId === linkedParentItem?.linkId) {
    return enableWhenExpression;
  }

  return null;
}

async function initialiseEnableWhenExpression(
  qItem: QuestionnaireItem,
  questionnaire: Questionnaire,
  terminologyServerUrl: string,
  parentLinkId?: string
): Promise<{
  enableWhenExpressionType: 'single' | 'repeat';
  enableWhenExpression: EnableWhenSingleExpression | EnableWhenRepeatExpression;
} | null> {
  const enableWhenExpression = getEnableWhenExpression(qItem);
  if (!enableWhenExpression) {
    return null;
  }

  // Parent repeat group linkId exist, try to classify this item as a repeat enableWhen item
  if (parentLinkId) {
    const expressionRepeat = initialiseEnableWhenExpressionRepeat(
      enableWhenExpression,
      questionnaire,
      parentLinkId
    );

    if (expressionRepeat) {
      const enableWhenRepeatExpression = {
        expression: `${expressionRepeat.expression}`,
        parentLinkId: parentLinkId,
        enabledIndexes: [false]
      };

      const { isEnabled } = await evaluateEnableWhenRepeatExpressionInstance(
        qItem.linkId,
        { resource: structuredClone(emptyResponse) },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0,
        terminologyServerUrl
      );

      if (typeof isEnabled === 'boolean') {
        enableWhenRepeatExpression.enabledIndexes[0] = isEnabled;
      }

      return {
        enableWhenExpressionType: 'repeat',
        enableWhenExpression: enableWhenRepeatExpression
      };
    }
  }

  return {
    enableWhenExpressionType: 'single',
    enableWhenExpression: {
      expression: `${enableWhenExpression.expression}`
    }
  };
}
