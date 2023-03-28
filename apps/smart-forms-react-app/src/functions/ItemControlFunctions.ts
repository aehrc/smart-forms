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

import type {
  Coding,
  Expression,
  Extension,
  QuestionnaireItem,
  QuestionnaireResponse
} from 'fhir/r5';

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
 * Check if the extension has url for calculated expressions
 *
 * @author Sean Fong
 */
export function getCalculatedExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression'
  );
  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
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
  const itemControl = qItem.extension?.find(
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
 * Get questionnaire name from questionnaireResponse
 * If questionnaireResponse does not have a name, fallback to questionnaireResponse questionnaireId
 *
 * @author Sean Fong
 */
export function getQuestionnaireNameFromResponse(
  questionnaireResponse: QuestionnaireResponse
): string {
  const itemControl = questionnaireResponse._questionnaire?.extension?.find(
    (extension: Extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/display'
  );

  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }

  return questionnaireResponse.id ?? 'Unnamed Response';
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
 * Check if item is readonly
 *
 * @author Sean Fong
 */
export function getReadOnly(qItem: QuestionnaireItem): boolean {
  return !!qItem.readOnly;
}

/**
 * Get decimal text display unit for items with itemControlCode unit and has a unit childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayUnit(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    for (const childItem of qItem.item) {
      if (childItem.type === 'display' && isSpecificItemControl(childItem, 'unit')) {
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
 * Get entry format if its extension is present
 * i.e. DD-MM-YYYY for dates, HH:MM for times etc.
 *
 * @author Sean Fong
 */
export function getEntryFormat(qItem: QuestionnaireItem): string {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/entryFormat'
  );

  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }
  return '';
}
