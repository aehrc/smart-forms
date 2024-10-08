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

import type { BackboneElement, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { getChoiceControlType } from './choice';
import { ChoiceItemControl, OpenChoiceItemControl } from '../interfaces/choice.enum';
import { getOpenChoiceControlType } from './openChoice';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';

interface isHiddenByEnableWhensParams {
  linkId: string;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: EnableWhenExpressions;
  parentRepeatGroupIndex?: number;
}

export function isHiddenByEnableWhen(params: isHiddenByEnableWhensParams): boolean {
  const {
    linkId,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions,
    parentRepeatGroupIndex
  } = params;

  // If enableWhen is not activated, items are not hidden by enableWhen
  if (!enableWhenIsActivated) {
    return false;
  }

  // Check enableWhen items
  const { singleItems, repeatItems } = enableWhenItems;
  if (singleItems[linkId]) {
    return !singleItems[linkId].isEnabled;
  }

  if (repeatItems[linkId] && parentRepeatGroupIndex !== undefined) {
    return !repeatItems[linkId].enabledIndexes[parentRepeatGroupIndex];
  }

  // Check enableWhenExpressions
  const { singleExpressions, repeatExpressions } = enableWhenExpressions;

  if (repeatExpressions[linkId] && parentRepeatGroupIndex !== undefined) {
    return !repeatExpressions[linkId].enabledIndexes[parentRepeatGroupIndex];
  }

  if (singleExpressions[linkId]) {
    return !enableWhenExpressions.singleExpressions[linkId].isEnabled;
  }

  return false;
}

/**
 * Check if qItem is a repeat item AND if it isn't a checkbox item
 * Note: repeat checkbox items are rendered as multi-select checkbox instead of being rendered as a traditional repeat item
 *
 * @author Sean Fong
 */
export function isRepeatItemAndNotCheckbox(qItem: QuestionnaireItem): boolean {
  // Prevents form from crashing due to mismatched Q and QR
  // In reality this should never happen
  if (!qItem) {
    return false;
  }

  const isCheckbox =
    getChoiceControlType(qItem) === ChoiceItemControl.Checkbox ||
    getOpenChoiceControlType(qItem) === OpenChoiceItemControl.Checkbox;

  return !!qItem['repeats'] && !isCheckbox;
}

export function getXHtmlStringFromQuestionnaire(questionnaire: Questionnaire): string | null {
  const itemControl = questionnaire._title?.extension?.find(
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

export function getLinkIdTypeTuples(questionnaire: Questionnaire): [string, string][] {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return [];
  }

  const linkIds: [string, string][] = [];
  for (const topLevelItem of questionnaire.item) {
    linkIds.push(...getLinkIdTypeTuplesFromItemRecursive(topLevelItem));
  }

  return linkIds;
}

export function getLinkIdTypeTuplesFromItemRecursive(qItem: QuestionnaireItem): [string, string][] {
  const linkIds: [string, string][] = [];

  if (qItem.linkId) {
    linkIds.push([qItem.linkId, qItem.type]);
  }

  if (qItem.item) {
    for (const childItem of qItem.item) {
      linkIds.push(...getLinkIdTypeTuplesFromItemRecursive(childItem));
    }
  }

  return linkIds;
}

function getPreferredTerminologyServer(element: BackboneElement): string | null {
  const preferredTerminologyServerExtension = element.extension?.find(
    (ext) =>
      ext.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer'
  );

  if (preferredTerminologyServerExtension) {
    return (
      preferredTerminologyServerExtension.valueUrl ??
      preferredTerminologyServerExtension.valueString ??
      null
    );
  }

  return null;
}

export function getLinkIdPreferredTerminologyServerTuples(
  questionnaire: Questionnaire
): [string, string][] {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return [];
  }

  const preferredTerminologyServer = getPreferredTerminologyServer(questionnaire);

  const linkIds: [string, string][] = [];
  for (const topLevelItem of questionnaire.item) {
    linkIds.push(
      ...getLinkIdPreferredTerminologyServerTuplesRecursive(
        topLevelItem,
        preferredTerminologyServer
      )
    );
  }

  return linkIds;
}

function getLinkIdPreferredTerminologyServerTuplesRecursive(
  qItem: QuestionnaireItem,
  parentPreferredTerminologyServer: string | null
): [string, string][] {
  const linkIds: [string, string][] = [];

  let preferredTerminologyServer = null;
  if (qItem.linkId) {
    preferredTerminologyServer =
      getPreferredTerminologyServer(qItem) ?? parentPreferredTerminologyServer ?? null;

    if (preferredTerminologyServer) {
      linkIds.push([qItem.linkId, preferredTerminologyServer]);
    }
  }

  if (qItem.item) {
    for (const childItem of qItem.item) {
      linkIds.push(
        ...getLinkIdPreferredTerminologyServerTuplesRecursive(childItem, preferredTerminologyServer)
      );
    }
  }

  return linkIds;
}

export type CollapsibleType = 'default-open' | 'default-closed';

function valueCodeIsCollapsibleType(valueCode: string): valueCode is CollapsibleType {
  return valueCode === 'default-open' || valueCode === 'default-closed';
}

export function getGroupCollapsible(qItem: QuestionnaireItem): CollapsibleType | null {
  const collapsibleExtension = qItem.extension?.find(
    (ext) =>
      ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible'
  );

  if (collapsibleExtension) {
    if (
      collapsibleExtension.valueCode &&
      valueCodeIsCollapsibleType(collapsibleExtension.valueCode)
    ) {
      return collapsibleExtension.valueCode;
    }
  }

  return null;
}
