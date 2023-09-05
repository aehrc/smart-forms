/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { Expression, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type { CalculatedExpression } from '../../interfaces/calculatedExpression.interface';
import type {
  EnableWhenExpression,
  EnableWhenItemProperties,
  EnableWhenLinkedItem
} from '../../interfaces/enableWhen.interface';
import type { AnswerExpression } from '../../interfaces/answerExpression.interface';
import type { ValueSetPromise } from '../../interfaces/valueSet.interface';
import { getAnswerExpression } from '../itemControl';
import { getTerminologyServerUrl, getValueSetPromise } from '../valueSet';
import type { Variables } from '../../interfaces/variables.interface';
import { getFhirPathVariables, getXFhirQueryVariables } from './extractVariables';

interface ReturnParamsRecursive {
  variables: Variables;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  valueSetPromises: Record<string, ValueSetPromise>;
}

export function extractOtherExtensions(
  questionnaire: Questionnaire,
  variables: Variables,
  valueSetPromises: Record<string, ValueSetPromise>,
  terminologyServerUrl: string
): ReturnParamsRecursive {
  const enableWhenItems: Record<string, EnableWhenItemProperties> = {};
  const enableWhenExpressions: Record<string, EnableWhenExpression> = {};
  const calculatedExpressions: Record<string, CalculatedExpression> = {};
  const answerExpressions: Record<string, AnswerExpression> = {};

  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {
      variables: variables,
      enableWhenItems: {},
      enableWhenExpressions: {},
      calculatedExpressions: {},
      answerExpressions: {},
      valueSetPromises: valueSetPromises
    };
  }

  for (const topLevelItem of questionnaire.item) {
    extractExtensionsFromItemRecursive({
      item: topLevelItem,
      variables,
      enableWhenItems,
      enableWhenExpressions,
      calculatedExpressions,
      answerExpressions,
      valueSetPromises,
      defaultTerminologyServerUrl: terminologyServerUrl
    });
  }

  return {
    variables,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    answerExpressions,
    valueSetPromises
  };
}

interface extractExtensionsFromItemRecursiveParams {
  item: QuestionnaireItem;
  variables: Variables;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  valueSetPromises: Record<string, ValueSetPromise>;
  defaultTerminologyServerUrl: string;
}

function extractExtensionsFromItemRecursive(
  params: extractExtensionsFromItemRecursiveParams
): ReturnParamsRecursive {
  const {
    item,
    variables,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    answerExpressions,
    valueSetPromises,
    defaultTerminologyServerUrl
  } = params;

  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    for (const childItem of items) {
      extractExtensionsFromItemRecursive({
        ...params,
        item: childItem
      });
    }
  }

  // Read enable when items, enablehen/calculated/answer expressions, valueSets and variables from qItem
  const enableWhenItemProperties = getEnableWhenItemProperties(item);
  if (enableWhenItemProperties) {
    enableWhenItems[item.linkId] = enableWhenItemProperties;
  }

  const enableWhenExpression = getEnableWhenExpression(item);
  if (enableWhenExpression) {
    enableWhenExpressions[item.linkId] = {
      expression: `${enableWhenExpression.expression}`
    };
  }

  const calculatedExpression = getCalculatedExpression(item);
  if (calculatedExpression) {
    calculatedExpressions[item.linkId] = {
      expression: `${calculatedExpression.expression}`
    };
  }

  const answerExpression = getAnswerExpression(item);
  if (answerExpression) {
    answerExpressions[item.linkId] = {
      expression: `${answerExpression.expression}`
    };
  }

  const valueSetUrl = item.answerValueSet;
  if (valueSetUrl) {
    if (!valueSetPromises[valueSetUrl] && !valueSetUrl.startsWith('#')) {
      const terminologyServerUrl = getTerminologyServerUrl(item) ?? defaultTerminologyServerUrl;
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
    answerExpressions,
    valueSetPromises
  };
}

/**
 * Get enableWhen items' linked items and enableBehaviour attribute and save them in an EnableWhenItemProperties object
 *
 * @author Sean Fong
 */
export function getEnableWhenItemProperties(
  qItem: QuestionnaireItem
): EnableWhenItemProperties | null {
  const enableWhen = qItem.enableWhen;
  if (enableWhen) {
    const enableWhenItemProperties: EnableWhenItemProperties = { linked: [], isEnabled: false };
    enableWhenItemProperties.linked = enableWhen.map((linkedItem): EnableWhenLinkedItem => {
      return { enableWhen: linkedItem };
    });

    if (qItem.enableBehavior) {
      enableWhenItemProperties.enableBehavior = qItem.enableBehavior;
    }

    return enableWhenItemProperties;
  }
  return null;
}

/**
 * Check if an enableWhenExpression extension is present
 *
 * @author Sean Fong
 */
export function getEnableWhenExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}

/**
 * Check if an calculatedExpression extension is present
 *
 * @author Sean Fong
 */
export function getCalculatedExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}
