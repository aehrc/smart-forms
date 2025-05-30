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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { isSpecificItemControl } from '@aehrc/smart-forms-renderer';
import { getAnswerValueAsString } from './answerFormatters';

export interface ChangeEntry {
  fieldLabelQItem: QuestionnaireItem; // e.g., The "Weight" group item, or "Systolic Blood Pressure" for a simple item
  qSubItem: QuestionnaireItem; // e.g., The "Value" item under "Weight", or same as fieldLabelQItem for simple items
  serverValue: string | null;
  userFormValue: string | null;
  rowIndex?: number;
  rowLabelForRow?: string; // For repeating table row context (e.g., "Condition: CKD")
}

export interface DetectChangesParams {
  qItem: QuestionnaireItem;
  serverSuggestedQRItem?: QuestionnaireResponseItem;
  currentUserFormQRItem?: QuestionnaireResponseItem;
  serverSuggestedQRItems?: QuestionnaireResponseItem[];
  currentUserFormQRItems?: QuestionnaireResponseItem[];
}

/**
 * Detects changes between server suggested values and current user form values
 * This function was extracted from SimplifiedRepopulateItemSwitcher to improve maintainability
 * and fix infinite loop issues caused by recreating the function on every render.
 */
export function detectChanges(params: DetectChangesParams): ChangeEntry[] {
  const {
    qItem,
    serverSuggestedQRItem,
    currentUserFormQRItem,
    serverSuggestedQRItems,
    currentUserFormQRItems
  } = params;

  const changes: ChangeEntry[] = [];

  function findChangesRecursive(
    currentQItemDefinition: QuestionnaireItem,
    parentFieldGroupQItem: QuestionnaireItem,
    currentServerQRItem?: QuestionnaireResponseItem,
    currentClientQRItem?: QuestionnaireResponseItem,
    rowIndex?: number,
    rowContextLabel?: string
  ) {
    const isSimpleType = currentQItemDefinition.type !== 'group';
    const isChoiceGroup =
      currentQItemDefinition.type === 'group' &&
      currentQItemDefinition.answerOption &&
      currentQItemDefinition.answerOption.length > 0;

    if (isSimpleType || isChoiceGroup) {
      const serverAnswer = currentServerQRItem?.answer?.[0];
      const userAnswer = currentClientQRItem?.answer?.[0];
      const serverValStr = serverAnswer ? getAnswerValueAsString(serverAnswer) : null;
      const userValStr = userAnswer ? getAnswerValueAsString(userAnswer) : null;

      if (serverValStr !== userValStr) {
        changes.push({
          fieldLabelQItem: parentFieldGroupQItem,
          qSubItem: currentQItemDefinition,
          serverValue: serverValStr,
          userFormValue: userValStr,
          rowIndex,
          rowLabelForRow: rowIndex !== undefined ? rowContextLabel : undefined
        });
      }
    }

    if (currentQItemDefinition.item && currentQItemDefinition.item.length > 0) {
      currentQItemDefinition.item.forEach((subQItemDef) => {
        const serverSubQRItem = currentServerQRItem?.item?.find(
          (i) => i.linkId === subQItemDef.linkId
        );
        const clientSubQRItem = currentClientQRItem?.item?.find(
          (i) => i.linkId === subQItemDef.linkId
        );

        let nextParentFieldGroup = parentFieldGroupQItem;
        if (
          currentQItemDefinition.type === 'group' &&
          !currentQItemDefinition.repeats &&
          !isSpecificItemControl(currentQItemDefinition, 'grid') &&
          currentQItemDefinition.linkId !== qItem.linkId
        ) {
          nextParentFieldGroup = currentQItemDefinition;
        }

        findChangesRecursive(
          subQItemDef,
          nextParentFieldGroup,
          serverSubQRItem,
          clientSubQRItem,
          rowIndex,
          rowContextLabel
        );
      });
    }
  }

  // Handle repeating items (like medical history tables)
  if (qItem.repeats && serverSuggestedQRItems && currentUserFormQRItems) {
    const maxRows = Math.max(serverSuggestedQRItems.length, currentUserFormQRItems.length);
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
      const serverRow = serverSuggestedQRItems[rowIdx];
      const userRow = currentUserFormQRItems[rowIdx];

      let dynamicRowLabel = `Row ${rowIdx + 1}`;
      if (qItem.item && qItem.item.length > 0) {
        const firstColForLabel = qItem.item[0];
        const serverCellForLabel = serverRow?.item?.find(
          (i) => i.linkId === firstColForLabel.linkId
        );
        const userCellForLabel = userRow?.item?.find((i) => i.linkId === firstColForLabel.linkId);
        const cellForLabelValue = (serverCellForLabel || userCellForLabel)?.answer?.[0];
        if (cellForLabelValue) {
          dynamicRowLabel = `${firstColForLabel.text || firstColForLabel.linkId}: ${getAnswerValueAsString(cellForLabelValue)}`;
        }
      }

      (qItem.item || []).forEach((columnQItemDefinition) => {
        const serverCellItem = serverRow?.item?.find(
          (i) => i.linkId === columnQItemDefinition.linkId
        );
        const userCellItem = userRow?.item?.find(
          (i) => i.linkId === columnQItemDefinition.linkId
        );
        findChangesRecursive(
          columnQItemDefinition,
          columnQItemDefinition,
          serverCellItem,
          userCellItem,
          rowIdx,
          dynamicRowLabel
        );
      });
    }
  } else {
    // Handle single items
    findChangesRecursive(qItem, qItem, serverSuggestedQRItem, currentUserFormQRItem);
  }

  return changes;
}

/**
 * Groups changes by row for repeating items (medical history tables)
 */
export function groupChangesByRow(changes: ChangeEntry[]): Array<{
  rowIndex: number;
  rowLabelForRow: string;
  itemsInRow: ChangeEntry[];
}> {
  const groupedByRow: Array<{
    rowIndex: number;
    rowLabelForRow: string;
    itemsInRow: ChangeEntry[];
  }> = [];
  const rowMap = new Map<number, { rowLabelForRow: string; itemsInRow: ChangeEntry[] }>();

  changes.forEach((change) => {
    if (change.rowIndex !== undefined) {
      if (!rowMap.has(change.rowIndex)) {
        rowMap.set(change.rowIndex, {
          rowLabelForRow: change.rowLabelForRow || `Row ${change.rowIndex + 1}`,
          itemsInRow: []
        });
      }
      rowMap.get(change.rowIndex)!.itemsInRow.push(change);
    }
  });

  rowMap.forEach((value, key) => {
    groupedByRow.push({ rowIndex: key, ...value });
  });
  
  return groupedByRow.sort((a, b) => a.rowIndex - b.rowIndex); // Ensure rows are ordered
}

/**
 * Generates preference keys for complex fields (medical history tables)
 */
export function generatePreferenceKey(
  qItemLinkId: string,
  change: ChangeEntry
): { preferenceKeyBase: string; preferenceKeySuffix: string; fullKey: string } {
  const preferenceKeyBase =
    qItemLinkId + (change.rowIndex !== undefined ? `-row${change.rowIndex}` : '');
  const preferenceKeySuffix =
    change.fieldLabelQItem.linkId === change.qSubItem.linkId
      ? change.qSubItem.linkId
      : `${change.fieldLabelQItem.linkId}:${change.qSubItem.linkId}`;
  const fullKey = `${preferenceKeyBase}:${preferenceKeySuffix}`;

  return { preferenceKeyBase, preferenceKeySuffix, fullKey };
} 