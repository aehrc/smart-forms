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
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import type { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';
import { isHiddenByEnableWhen } from './qItem';
import { getRegexValidation } from './itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import type { RegexValidation } from '../interfaces/regex.interface';

export type InvalidType = 'regex' | 'minLength' | 'maxLength' | 'required';

interface ValidateQuestionnaireParams {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  invalidItems: Record<string, InvalidType>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

/**
 * Recursively go through the questionnaireResponse and check for un-filled required qItems
 * At the moment item.required for group items are not checked
 *
 * @author Sean Fong
 */
export function validateQuestionnaire(
  params: ValidateQuestionnaireParams
): Record<string, InvalidType> {
  const {
    questionnaire,
    questionnaireResponse,
    invalidItems,
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
    return invalidItems;
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

    validateItemRecursive({
      qItem: topLevelQItem,
      qrItem: topLevelQRItem,
      invalidItems: invalidItems,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });
  }

  return invalidItems;
}

interface ValidateItemRecursiveParams {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  invalidItems: Record<string, InvalidType>;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

function validateItemRecursive(params: ValidateItemRecursiveParams) {
  const {
    qItem,
    qrItem,
    invalidItems,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  } = params;

  if (
    isHiddenByEnableWhen({
      linkId: qItem.linkId,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    })
  ) {
    return;
  }

  // FIXME repeat groups not working
  if (qItem.type === 'group' && qItem.repeats) {
    return;
  }

  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItem?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    if (qItem.type === 'group' && qItem.required) {
      if (!qrItem || qrItemsByIndex.length === 0) {
        invalidItems[qItem.linkId] = 'required';
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

      validateItemRecursive({
        qItem: childQItem,
        qrItem: childQRItem,
        invalidItems: invalidItems,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions
      });
    }
  }

  validateSingleItem(qItem, qrItem, invalidItems);
}

function validateSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  invalidItems: Record<string, InvalidType>
) {
  // Validate item.required
  if (qItem.type !== 'display') {
    if (qItem.required && !qrItem.answer) {
      invalidItems[qItem.linkId] = 'required';
      return invalidItems;
    }
  }

  // Validate regex, maxLength and minLength
  if (qrItem.answer) {
    for (const answer of qrItem.answer) {
      if (answer.valueString || answer.valueInteger || answer.valueDecimal || answer.valueUri) {
        const invalidInputType = getInputInvalidType(
          getInputInString(answer),
          getRegexValidation(qItem),
          structuredDataCapture.getMinLength(qItem) ?? null,
          qItem.maxLength ?? null
        );

        if (!invalidInputType) {
          continue;
        }

        // Assign invalid type and break - stop checking other answers if is a repeat item
        switch (invalidInputType) {
          case 'regex':
            invalidItems[qItem.linkId] = 'regex';
            break;
          case 'minLength':
            invalidItems[qItem.linkId] = 'minLength';
            break;
          case 'maxLength':
            invalidItems[qItem.linkId] = 'maxLength';
            break;
        }
        break;
      }
    }

    // Reached the end of the loop and no invalid input type found
    // If a required item is filled, remove the required invalid type
    if (qItem.required && invalidItems[qItem.linkId] && invalidItems[qItem.linkId] === 'required') {
      delete invalidItems[qItem.linkId];
    }
  }

  return invalidItems;
}

// function validateRepeatGroup(
//   qItem: QuestionnaireItem,
//   qrItems: QuestionnaireResponseItem,
//   invalidLinkIds: Record<string, InvalidType>
// ) {
//   return;
// }

function getInputInString(answer: QuestionnaireResponseItemAnswer) {
  if (answer.valueString) {
    return answer.valueString;
  } else if (answer.valueInteger) {
    return answer.valueInteger.toString();
  } else if (answer.valueDecimal) {
    return answer.valueDecimal.toString();
  } else if (answer.valueUri) {
    return answer.valueUri;
  }

  return '';
}

export function getInputInvalidType(
  input: string,
  regexValidation: RegexValidation | null,
  minLength: number | null,
  maxLength: number | null
): InvalidType | null {
  if (input) {
    if (regexValidation && !regexValidation.expression.test(input)) {
      return 'regex';
    }

    if (minLength && input.length < minLength) {
      return 'minLength';
    }

    if (maxLength && input.length > maxLength) {
      return 'maxLength';
    }
  }

  return null;
}
