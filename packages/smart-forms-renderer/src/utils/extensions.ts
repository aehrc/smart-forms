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

import type {
  Coding,
  Element,
  Extension,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption
} from 'fhir/r4';
import type { RegexValidation } from '../interfaces/regex.interface';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { default as htmlParse } from 'html-react-parser';
import type { JSX } from 'react';
import { getInitialExpression } from './getExpressionsFromItem';

export function hasDisplayCategory(qItem: QuestionnaireItem): boolean {
  return !!qItem.extension?.some(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  );
}

export function hasItemControl(qItem: QuestionnaireItem): boolean {
  return !!qItem.extension?.some(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );
}

// If all nested items are of type display and have itemControl, then they should not be rendered
export function shouldRenderNestedItems(qItem: QuestionnaireItem): boolean {
  return !qItem.item?.every(
    (childItem) =>
      childItem.type === 'display' && (hasDisplayCategory(childItem) || hasItemControl(childItem))
  );
}

/**
 * Check if the extension has an itemControl code equal to the given itemControlCode
 *
 * @author Sean Fong
 */
export function isSpecificItemControl(qItem: QuestionnaireItem, itemControlCode: string): boolean {
  const extension = qItem?.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );

  return !!extension?.valueCodeableConcept?.coding?.some(
    (coding: Coding) => coding.code === itemControlCode
  );
}

/**
 * Check if the extension has an displayCategory code equal to the given displayCategory
 *
 * @author Sean Fong
 */
export function isSpecificDisplayCategory(
  qItem: QuestionnaireItem,
  displayCategoryCode: string
): boolean {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  );

  return !!extension?.valueCodeableConcept?.coding?.some(
    (coding: Coding) => coding.code === displayCategoryCode
  );
}

/**
 * Check if the extension has url for items that use shortText
 *
 * @author Sean Fong
 */
export function getShortText(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText'
  );

  return extension?.valueString ?? null;
}

/**
 * Check if the extension has url for items that use open label
 * Default open label text to "Other"
 *
 * @author Sean Fong
 */
export function getOpenLabelText(qItem: QuestionnaireItem): string {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel'
  );

  return extension?.valueString ?? 'Other';
}

/**
 * Check if the decimal value has a quantity precision for the decimal value
 *
 * @author Sean Fong
 */
export function getDecimalPrecision(qItem: QuestionnaireItem): number | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/quantity-precision'
  );

  return extension?.valueInteger ?? null;
}

export function getXHtmlStringFromExtension(extensions: Extension[]): string | null {
  const extension = extensions?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
  );

  return extension?.valueString ?? null;
}

/**
 * Check if the extension has a url for xhtml rendering
 *
 * @author Sean Fong
 */
export function getXHtmlString(qItem: QuestionnaireItem): string | null {
  let xHtmlString = null;
  if (qItem.extension) {
    xHtmlString = getXHtmlStringFromExtension(qItem.extension);
    if (xHtmlString) {
      return xHtmlString;
    }
  }

  if (qItem._text?.extension) {
    xHtmlString = getXHtmlStringFromExtension(qItem._text?.extension);
    if (xHtmlString) {
      return xHtmlString;
    }
  }

  return null;
}

/**
 * Check if the item label (text) has a valueMarkdown extension
 *
 * @author Sean Fong
 */
export function getMarkdownString(element: Element | undefined): string | null {
  const extension = element?.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/rendering-markdown'
  );

  return extension?.valueMarkdown ?? null;
}

/**
 * Get text display prompt for items with itemControlCode prompt and has a prompt childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayPrompt(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'prompt')) {
        const promptText = `${childItem.text}`;
        return promptText[0].toUpperCase() + promptText.substring(1);
      }
    }
  }

  return '';
}

/**
 * Get Quantity unit for items with itemControlCode unit and has a unit childItem
 *
 * Example extension:
 * {
 *   "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
 *   "valueCoding": {
 *     "system": "http://unitsofmeasure.org",
 *     "code": "kg",
 *     "display": "kg"
 *   }
 * }
 *
 * Example Output (omit the url):
 *  {
 *   "valueCoding": {
 *     "system": "http://unitsofmeasure.org",
 *     "code": "kg",
 *     "display": "kg"
 *   }
 * }
 *
 * @author Sean Fong
 */
export function getQuantityUnit(qItem: QuestionnaireItem): QuestionnaireItemAnswerOption | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
  );

  // Return as { valueCoding } for QuestionnaireItemAnswerOption, omitting url
  if (extension?.valueCoding) {
    return { valueCoding: extension.valueCoding };
  }

  return null;
}

/**
 * Get decimal text display unit for items with itemControlCode unit and has a unit childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayUnit(qItem: QuestionnaireItem): string {
  // Check if the item has a display unit childItem
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (
        childItem.type === 'display' &&
        isSpecificItemControl(childItem, 'unit') &&
        typeof childItem.text === 'string'
      ) {
        return childItem.text;
      }
    }
  }

  // Otherwise, check if the item has a unit extension
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
  );

  if (extension?.valueCoding) {
    return extension.valueCoding.display ?? extension.valueCoding.code ?? '';
  }

  return '';
}

/**
 * Get text display lower bound for items with itemControlCode "lower" and has a "lower" childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayLower(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (
        childItem.type === 'display' &&
        isSpecificItemControl(childItem, 'lower') &&
        typeof childItem.text === 'string'
      ) {
        return childItem.text;
      }
    }
  }

  return '';
}

/**
 * Get text display upper bound for items with itemControlCode "upper" and has a "upper" childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayUpper(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (
        childItem.type === 'display' &&
        isSpecificItemControl(childItem, 'upper') &&
        typeof childItem.text === 'string'
      ) {
        return childItem.text;
      }
    }
  }

  return '';
}

/**
 * Get text display instructions for items with itemControlCode instructions and has an instructions childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayInstructions(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (
        childItem.type === 'display' &&
        isSpecificDisplayCategory(childItem, 'instructions') &&
        typeof childItem.text === 'string'
      ) {
        return childItem.text;
      }
    }
  }

  return '';
}

/**
 * Get text display flyover for items with itemControlCode flyover and has an flyover childItem
 * Also works for XHTML rendering as a bonus
 *
 * @author Sean Fong
 */
export function getTextDisplayFlyover(
  qItem: QuestionnaireItem
): string | JSX.Element | JSX.Element[] {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'flyover')) {
        const xHtmlString = getXHtmlString(childItem);
        if (xHtmlString) {
          return htmlParse(xHtmlString);
        }

        if (typeof childItem.text === 'string') {
          return childItem.text;
        }
      }
    }
  }

  return '';
}

/**
 * Get regex validation for items with regex extensions
 *
 * @author Sean Fong
 */
export function getRegexValidation(qItem: QuestionnaireItem): RegexValidation | undefined {
  // Get regex expression from extension
  const regexString = getRegexString(qItem);
  if (regexString) {
    return { expression: new RegExp(regexString), feedback: null };
  }

  // Get regex expression from item types if regex extensions not present
  if (qItem.type === 'url') {
    return { expression: new RegExp(/^\S*$/), feedback: 'URLs should not contain any whitespaces' };
  }

  return undefined;
}

export function getRegexString(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/regex'
  );

  if (extension) {
    const extensionString = extension.valueString;
    if (extensionString) {
      let regexString;
      if (extensionString.includes('matches(')) {
        regexString = extensionString.substring(
          extensionString.indexOf("matches('") + "matches('".length,
          extensionString.lastIndexOf("')")
        );
      } else {
        regexString = extensionString;
      }

      return regexString;
    }
  }

  return null;
}

export function getMinValue(qItem: QuestionnaireItem): string | number | undefined {
  switch (qItem.type) {
    case 'integer':
      return structuredDataCapture.getMinValueAsInteger(qItem);
    case 'decimal':
      // In the case for decimals, permit minValue to be a decimal or integer
      return (
        structuredDataCapture.getMinValueAsDecimal(qItem) ??
        structuredDataCapture.getMinValueAsInteger(qItem)
      );
    case 'date':
      return structuredDataCapture.getMinValueAsDate(qItem);
    case 'dateTime':
      // In the case for dateTime, permit minValue to be a dateTime or date
      return (
        structuredDataCapture.getMinValueAsDateTime(qItem) ??
        structuredDataCapture.getMinValueAsDate(qItem)
      );
    default:
      return undefined;
  }
}

// Probably should use targetConstraint instead of this, but we can't deprecate it yet
export function getMinValueFeedback(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'https://smartforms.csiro.au/docs/custom-extension/minValue-feedback' ||
      extension.url === 'https://smartforms.csiro.au/ig/StructureDefinition/minValue-feedback'
  );

  return extension?.valueString ?? null;
}

export function getMaxValue(qItem: QuestionnaireItem): string | number | undefined {
  switch (qItem.type) {
    case 'integer':
      return structuredDataCapture.getMaxValueAsInteger(qItem);
    case 'decimal':
      // In the case for decimals, permit maxValue to be a decimal or integer
      return (
        structuredDataCapture.getMaxValueAsDecimal(qItem) ??
        structuredDataCapture.getMaxValueAsInteger(qItem)
      );
    case 'date':
      return structuredDataCapture.getMaxValueAsDate(qItem);
    case 'dateTime':
      // In the case for dateTime, permit maxValue to be a dateTime or date
      return (
        structuredDataCapture.getMaxValueAsDateTime(qItem) ??
        structuredDataCapture.getMaxValueAsDate(qItem)
      );
    default:
      return undefined;
  }
}

// Probably should use targetConstraint instead of this, but we can't deprecate it yet
export function getMaxValueFeedback(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'https://smartforms.csiro.au/docs/custom-extension/maxValue-feedback' ||
      extension.url === 'https://smartforms.csiro.au/ig/StructureDefinition/maxValue-feedback'
  );

  return extension?.valueString ?? null;
}

// Probably should use targetConstraint instead of this, but we can't deprecate it yet
export function getRequiredFeedback(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'https://smartforms.csiro.au/docs/custom-extension/required-feedback' ||
      extension.url === 'https://smartforms.csiro.au/ig/StructureDefinition/required-feedback'
  );

  return extension?.valueString ?? null;
}

/**
 * Check if the item has a sdc-questionnaire-minQuantity and minQuantity extension
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {number | undefined} The numeric value of the minQuantity extension, if present.
 *
 * @author Janardhan Vignarajan
 */
export function getMinQuantityValue(qItem: QuestionnaireItem): number | undefined {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity'
  );

  // Check if valueQuantity exists and if value is a "number" type
  if (extension?.valueQuantity) {
    if (typeof extension.valueQuantity.value === 'number') {
      return extension.valueQuantity.value;
    }
  }

  return undefined;
}

/**
 * Check if the item has a sdc-questionnaire-minQuantity feedback extension
 * Probably should use targetConstraint instead of this, but we can't deprecate it yet
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {string | null} The value of the extension if found, otherwise null.
 *
 * @author Janardhan Vignarajan
 */
export function getMinQuantityValueFeedback(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback' ||
      extension.url ===
        'https://smartforms.csiro.au/ig/StructureDefinition/minQuantityValue-feedback'
  );

  return extension?.valueString ?? null;
}

/**
 * Check if the item has a sdc-questionnaire-maxQuantity extension
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {number | undefined} The numeric value of the maxQuantity extension, if present.
 *
 * @author Janardhan Vignarajan
 */
export function getMaxQuantityValue(qItem: QuestionnaireItem): number | undefined {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity'
  );

  // Check if valueQuantity exists and if value is a "number" type
  if (extension?.valueQuantity) {
    if (typeof extension.valueQuantity.value === 'number') {
      return extension.valueQuantity.value;
    }
  }

  return undefined;
}

/**
 * Check if the item has a sdc-questionnaire-maxQuantity feedback extension
 * Probably should use targetConstraint instead of this, but we can't deprecate it yet
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {string | null} The value of the extension if found, otherwise null.
 *
 * @author Janardhan Vignarajan
 */
export function getMaxQuantityValueFeedback(qItem: QuestionnaireItem): string | null {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback' ||
      extension.url ===
        'https://smartforms.csiro.au/ig/StructureDefinition/maxQuantityValue-feedback'
  );

  return extension?.valueString ?? null;
}

/**
 * Check if the QuestionnaireItem has a 'item.text hidden' extension on the '_text' field.
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {boolean} True if the item text is hidden, otherwise false.
 */
export function isItemTextHidden(qItem: QuestionnaireItem): boolean {
  const extension = qItem._text?.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'https://smartforms.csiro.au/docs/custom-extension/QuestionnaireItemTextHidden' ||
      extension.url ===
        'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden'
  );

  return !!extension?.valueBoolean;
}

/**
 * Check if the QuestionnaireItem has a 'GroupHideAddItemButton' extension to hide the Add Item button for group tables.
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {boolean} True if the Add Item button should be hidden, otherwise false.
 */
export function isGroupAddItemButtonHidden(qItem: QuestionnaireItem): boolean {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'https://smartforms.csiro.au/docs/custom-extension/GroupHideAddItemButton' ||
      extension.url === 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton'
  );

  return !!extension?.valueBoolean;
}

/**
 * Check if the item has a sdc-questionnaire-width extension
 *
 * @param {QuestionnaireItem} qItem - The QuestionnaireItem to check.
 * @returns {number | undefined} The numeric value of the columnWidth extension, if present.
 *
 * @author Janardhan Vignarajan
 */
export function getColumnWidth(qItem: QuestionnaireItem): string | undefined {
  const extension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-width'
  );

  // Check if valueQuantity exists and if value is a "number" type
  if (extension?.valueQuantity) {
    if (typeof extension.valueQuantity.value === 'number') {
      // if the extension.valueQuantity.code exists then return value + code, else return value + 'px'
      // See http://hl7.org/fhir/uv/sdc/rendering.html#width.
      if (extension.valueQuantity.code) {
        return `${extension.valueQuantity.value}${extension.valueQuantity.code}`;
      } else {
        return `${extension.valueQuantity.value}px`;
      }
    }
  }

  return undefined;
}

/**
 * Check if the QuestionnaireItem has a 'showRepopulateButton' extension to show a sync button for granular repopulation.
 */
export function isItemRepopulatable(qItem: QuestionnaireItem): boolean {
  // Get questionnaire-initialExpression-repopulatable button extension
  // Currently fixed to 'manual' repopulation only.
  // See https://chat.fhir.org/#narrow/channel/179255-questionnaire/topic/Granular.20Repopulate.20button/with/533937578 for more details.
  const isRepopulatableExtension = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable' &&
      extension.valueCode === 'manual'
  );

  // Also need to check if the item has an initialExpression, because this button depends on it
  const initialExpression = getInitialExpression(qItem);
  if (!initialExpression) {
    return false;
  }

  return !!isRepopulatableExtension;
}
