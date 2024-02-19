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

import type { QuestionnaireResponse } from 'fhir/r4';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHidden } from './qItem';

export type InvalidType = 'regex' | 'minLength' | 'maxLength' | 'required' | null;

interface ValidateQuestionnaireRequiredItemsParams {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  invalidRequiredLinkIds: string[];
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

/**
 * Recursively go through the questionnaireResponse and check for un-filled required qItems
 * At the moment item.required for group items are not checked
 * FIXME will eventually be renamed to validate questionnaire
 *
 * @author Sean Fong
 */
export function validateQuestionnaireRequiredItems(
  params: ValidateQuestionnaireRequiredItemsParams
): string[] {
  const {
    questionnaire,
    questionnaireResponse,
    invalidRequiredLinkIds,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !questionnaireResponse.item ||
    questionnaireResponse.item.length === 0
  ) {
    return [];
  }

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item,
    qItemsIndexMap
  );

  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    let topLevelQRItem = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text
    };

    if (Array.isArray(topLevelQRItem)) {
      topLevelQRItem = {
        linkId: topLevelQItem.linkId,
        text: topLevelQItem.text,
        item: topLevelQRItem
      };
    }

    validateRequiredItemRecursive({
      qItem: topLevelQItem,
      qrItem: topLevelQRItem,
      invalidRequiredLinkIds,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
  }

  return invalidRequiredLinkIds;
}

interface ValidateRequiredItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  invalidRequiredLinkIds: string[];
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

function validateRequiredItemRecursive(params: ValidateRequiredItemRecursiveParams) {
  const {
    qItem,
    qrItem,
    invalidRequiredLinkIds,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (
    isHidden({
      questionnaireItem: qItem,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    })
  ) {
    return;
  }

  // FIXME repeat groups not working
  if (qItem.type === 'group' && qItem.repeats) {
    return validateRequiredRepeatGroup(qItem, qrItem, invalidRequiredLinkIds);
  }

  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItem?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    if (qItem.type === 'group' && qItem.required) {
      if (!qrItem || qrItemsByIndex.length === 0) {
        invalidRequiredLinkIds.push(qItem.linkId);
      }
    }

    for (const [index, childQItem] of childQItems.entries()) {
      let childQRItem = qrItemsByIndex[index] ?? {
        linkId: childQItem.linkId,
        text: childQItem.text
      };

      if (Array.isArray(childQRItem)) {
        childQRItem = {
          linkId: childQItem.linkId,
          text: childQItem.text,
          item: childQRItem
        };
      }

      validateRequiredItemRecursive({
        qItem: childQItem,
        qrItem: childQRItem,
        invalidRequiredLinkIds,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });
    }
  }

  validateRequiredSingleItem(qItem, qrItem, invalidRequiredLinkIds);
}

function validateRequiredSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  invalidLinkIds: string[]
) {
  // Process non-group items
  if (qItem.type !== 'display') {
    if (qItem.required && !qrItem.answer) {
      invalidLinkIds.push(qItem.linkId);
    }
  }
}

function validateRequiredRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem,
  invalidLinkIds: string[]
) {
  return;
}
