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
import type { ValueSetPromise } from '../../interfaces/valueSet.interface';
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

interface ReturnParamsRecursive {
  variables: Variables;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  calculatedExpressions: Record<string, CalculatedExpression[]>;
  initialExpressions: Record<string, InitialExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  valueSetPromises: Record<string, ValueSetPromise>;
  answerOptions: Record<string, QuestionnaireItemAnswerOption[]>;
}

export function extractOtherExtensions(
  questionnaire: Questionnaire,
  variables: Variables,
  valueSetPromises: Record<string, ValueSetPromise>,
  itemPreferredTerminologyServers: Record<string, string>,
  terminologyServerUrl: string
): ReturnParamsRecursive {
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
      valueSetPromises: valueSetPromises
    };
  }

  for (const topLevelItem of questionnaire.item) {
    const isRepeatGroup = !!topLevelItem.repeats && topLevelItem.type === 'group';
    extractExtensionsFromItemRecursive({
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
    valueSetPromises
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
  itemPreferredTerminologyServers: Record<string, string>;
  defaultTerminologyServerUrl: string;
  parentRepeatGroupLinkId?: string;
}

function extractExtensionsFromItemRecursive(
  params: extractExtensionsFromItemRecursiveParams
): ReturnParamsRecursive {
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
    itemPreferredTerminologyServers,
    defaultTerminologyServerUrl,
    parentRepeatGroupLinkId
  } = params;

  const items = item.item;
  const isRepeatGroup = !!item.repeats && item.type === 'group';
  if (items && items.length > 0) {
    // iterate through items of item recursively
    for (const childItem of items) {
      extractExtensionsFromItemRecursive({
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

  const initialisedEnableWhenExpressions = initialiseEnableWhenExpression(
    item,
    questionnaire,
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

  const valueSetUrl = item.answerValueSet;
  if (valueSetUrl) {
    if (!valueSetPromises[valueSetUrl] && !valueSetUrl.startsWith('#')) {
      const preferredTerminologyServerUrl = itemPreferredTerminologyServers[item.linkId];
      const terminologyServerUrl =
        getTerminologyServerUrl(item) ??
        preferredTerminologyServerUrl ??
        defaultTerminologyServerUrl;

      valueSetPromises[valueSetUrl] = {
        promise: getValueSetPromise(valueSetUrl, terminologyServerUrl)
      };
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
    valueSetPromises
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

function initialiseEnableWhenExpression(
  qItem: QuestionnaireItem,
  questionnaire: Questionnaire,
  parentLinkId?: string
): {
  enableWhenExpressionType: 'single' | 'repeat';
  enableWhenExpression: EnableWhenSingleExpression | EnableWhenRepeatExpression;
} | null {
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

      const { isEnabled } = evaluateEnableWhenRepeatExpressionInstance(
        qItem.linkId,
        { resource: structuredClone(emptyResponse) },
        enableWhenRepeatExpression,
        enableWhenRepeatExpression.expression.lastIndexOf('.where(linkId'),
        0
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
