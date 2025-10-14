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

import type { Expression, Extension, QuestionnaireItem } from 'fhir/r4';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';
import { type RestrictedAnswerOption } from '../interfaces/answerOptionsToggleExpression.interface';
import { optionIsAnswerOptionsToggleExpressionOption } from './questionnaireStoreUtils/extractAnswerOptionsToggleExpressions';

/**
 * Get enableWhenExpression.valueExpression if its present in item
 *
 * @author Sean Fong
 */
export function getInitialExpression(qItem: QuestionnaireItem): Expression | null {
  const initialExpression = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );

  if (initialExpression?.valueExpression) {
    return initialExpression.valueExpression;
  }
  return null;
}

/**
 * Get enableWhenExpression.valueExpression if its present in item
 *
 * @author Sean Fong
 */
export function getEnableWhenExpression(qItem: QuestionnaireItem): Expression | null {
  const enableWhenExpression = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );

  if (enableWhenExpression?.valueExpression) {
    return enableWhenExpression.valueExpression;
  }
  return null;
}

/**
 * Get calculatedExpression.valueExpression if its present in item or item._text
 *
 * @author Sean Fong
 */
export function getCalculatedExpressions(qItem: QuestionnaireItem): CalculatedExpression[] {
  // For questions - calculatedExpressions
  const calculatedExpressionsInItem = findCalculatedExpressionsInExtensions(qItem.extension ?? [])
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  // For item._text - cqfExpressions and calculatedExpressions (for backwards compatibility)
  const calculatedAndCqfExpressionsInText = [
    ...findCqfExpressionsInExtensions(qItem._text?.extension ?? []),
    ...findCalculatedExpressionsInExtensions(qItem._text?.extension ?? [])
  ]
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item._text'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  // For item._text.aria-label - ItemTextAriaLabelExpression
  const itemTextAriaLabelExpressionInText = findItemTextAriaLabelExpressionInExtensions(
    qItem._text?.extension ?? []
  )
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item._text.aria-label'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  // For item._answerValueSet - cqfExpressions
  const cqfExpressionsInAnswerValueSet = [
    ...findCqfExpressionsInExtensions(qItem._answerValueSet?.extension ?? [])
  ]
    .map(
      (calculatedExpression): CalculatedExpression => ({
        expression: calculatedExpression.valueExpression?.expression ?? '',
        from: 'item._answerValueSet'
      })
    )
    .filter((calculatedExpression) => calculatedExpression.expression !== '');

  return [
    ...calculatedExpressionsInItem,
    ...calculatedAndCqfExpressionsInText,
    ...itemTextAriaLabelExpressionInText,
    ...cqfExpressionsInAnswerValueSet
  ];
}

export function findCalculatedExpressionsInExtensions(extensions: Extension[]): Extension[] {
  return extensions.filter(
    (extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
}

function findCqfExpressionsInExtensions(extensions: Extension[]): Extension[] {
  return extensions.filter(
    (extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/cqf-expression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
}

/**
 * Find all FHIRPath aria-label expression custom extensions within a list of extensions.
 *
 * This looks for extensions with the custom
 * `QuestionnaireItemTextAriaLabelExpression` URL and ensures their
 * `valueExpression.language` is `text/fhirpath`.
 *
 * @param {Extension[]} extensions - The list of extensions to search.
 * @returns {Extension[]} An array of matching extensions (empty if none found).
 */
function findItemTextAriaLabelExpressionInExtensions(extensions: Extension[]): Extension[] {
  return extensions.filter(
    (extension) =>
      extension.url ===
        'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextAriaLabelExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
}

/**
 * Get answerExpression.valueExpression if its present in item
 *
 * @author Sean Fong
 */
export function getAnswerExpression(qItem: QuestionnaireItem): Expression | null {
  const answerExpressionExtension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression' &&
      extension.valueExpression?.language === 'text/fhirpath'
  );
  if (answerExpressionExtension) {
    if (answerExpressionExtension.valueExpression) {
      return answerExpressionExtension.valueExpression;
    }
  }
  return null;
}

/**
 * Get answerOptionsToggleExpressions if its present in item
 *
 * @author Sean Fong
 */
export function getAnswerOptionsToggleExpressions(
  qItem: QuestionnaireItem
): AnswerOptionsToggleExpression[] | null {
  const answerOptionsToggleExpressionExtensions = qItem.extension?.filter(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerOptionsToggleExpression' &&
      extension.extension &&
      extension.extension.length > 0
  );

  if (answerOptionsToggleExpressionExtensions) {
    const answerOptionsToggleExpressions: AnswerOptionsToggleExpression[] = [];
    for (const answerOptionsToggleExpressionExtension of answerOptionsToggleExpressionExtensions) {
      const optionExtensions = answerOptionsToggleExpressionExtension.extension?.filter(
        (ext) => ext.url === 'option'
      );
      const expressionExtension = answerOptionsToggleExpressionExtension.extension?.find(
        (ext) => ext.url === 'expression' && ext.valueExpression
      );

      if (
        optionExtensions &&
        optionExtensions.length > 0 &&
        expressionExtension &&
        expressionExtension.valueExpression
      ) {
        const options: RestrictedAnswerOption[] = [];
        for (const optionExtension of optionExtensions) {
          // Check if optionExtension has valueCoding, valueString or valueInteger
          if (optionIsAnswerOptionsToggleExpressionOption(optionExtension)) {
            const option: RestrictedAnswerOption = {};
            if (optionExtension.valueCoding !== undefined) {
              option.valueCoding = optionExtension.valueCoding;
            }
            if (optionExtension.valueString !== undefined) {
              option.valueString = optionExtension.valueString;
            }
            if (optionExtension.valueInteger !== undefined) {
              option.valueInteger = optionExtension.valueInteger;
            }

            options.push(option);
          }
        }

        // If there are any options, create an answerOptionsToggleExpression
        if (options.length > 0) {
          answerOptionsToggleExpressions.push({
            linkId: qItem.linkId,
            options: options,
            valueExpression: expressionExtension.valueExpression
          });
        }
      }
    }

    // If there are any answerOptionsToggleExpressions, return them
    if (answerOptionsToggleExpressions.length > 0) {
      return answerOptionsToggleExpressions;
    }
  }

  return null;
}
