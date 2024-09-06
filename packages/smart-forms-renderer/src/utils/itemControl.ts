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

import type { Coding, Extension, QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { RegexValidation } from '../interfaces/regex.interface';
import { structuredDataCapture } from 'fhir-sdc-helpers';

function hasDisplayCategory(qItem: QuestionnaireItem): boolean {
  return !!qItem.extension?.some(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  );
}

function hasItemControl(qItem: QuestionnaireItem): boolean {
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
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );
  if (itemControl) {
    const code = itemControl.valueCodeableConcept?.coding?.find(
      (coding: Coding) => coding.code === itemControlCode
    );
    if (code) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the extension has an displayCategory code equal to the given displayCategory
 *
 * @author Sean Fong
 */
export function isSpecificDisplayCategory(
  qItem: QuestionnaireItem,
  itemControlCode: string
): boolean {
  const displayCategory = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  );
  if (displayCategory) {
    const code = displayCategory.valueCodeableConcept?.coding?.find(
      (coding: Coding) => coding.code === itemControlCode
    );
    if (code) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the extension has url for items that use shortText
 *
 * @author Sean Fong
 */
export function getShortText(qItem: QuestionnaireItem): string | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText'
  );
  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }
  return null;
}

/**
 * Check if the extension has url for hidden questions
 *
 * @author Sean Fong
 */
export function hasHiddenExtension(qItem: QuestionnaireItem): boolean {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
  );

  if (itemControl) {
    if (itemControl.valueBoolean) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the extension has url for items that use open label
 *
 * @author Sean Fong
 */
export function getOpenLabelText(qItem: QuestionnaireItem): string | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel'
  );
  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }
  return null;
}

/**
 * Check if the decimal value has a quantity precision for the decimal value
 *
 * @author Sean Fong
 */
export function getDecimalPrecision(qItem: QuestionnaireItem): number | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/quantity-precision'
  );
  if (itemControl) {
    if (itemControl.valueInteger) {
      return itemControl.valueInteger;
    }
  }
  return null;
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

export function getXHtmlStringFromExtension(extensions: Extension[]): string | null {
  const itemControl = extensions?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
  );

  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }

  return null;
}

/**
 * Check if the item label (text) has a valueMarkdown extension
 *
 * @author Sean Fong
 */
export function getMarkdownString(qItem: QuestionnaireItem): string | null {
  const itemControl = qItem._text?.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/rendering-markdown'
  );

  if (itemControl) {
    if (itemControl.valueMarkdown) {
      return itemControl.valueMarkdown;
    }
  }
  return null;
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
 * @author Sean Fong
 */
export function getQuantityUnit(qItem: QuestionnaireItem): QuestionnaireItemAnswerOption | null {
  // Otherwise, check if the item has a unit extension
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
  );
  if (itemControl && itemControl.valueCoding) {
    return itemControl;
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
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'unit')) {
        return `${childItem.text}`;
      }
    }
  }

  // Otherwise, check if the item has a unit extension
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
  );
  if (itemControl && itemControl.valueCoding) {
    return itemControl.valueCoding.display ?? '';
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
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'lower')) {
        return `${childItem.text}`;
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
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'upper')) {
        return `${childItem.text}`;
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
      if (childItem.type === 'display' && isSpecificDisplayCategory(childItem, 'instructions')) {
        return `${childItem.text}`;
      }
    }
  }
  return '';
}

/**
 * Get text display flyover for items with itemControlCode flyover and has an flyover childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayFlyover(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'flyover')) {
        return `${childItem.text}`;
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
  const itemControl = qItem.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/regex'
  );

  if (itemControl) {
    const extensionString = itemControl.valueString;
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

export function getMinValue(qItem: QuestionnaireItem) {
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

export function getMaxValue(qItem: QuestionnaireItem) {
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
