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

import type { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { hasHiddenExtension } from './itemControl';
import { getChoiceControlType } from './choice';
import { ChoiceItemControl, OpenChoiceItemControl } from '../interfaces/choice.enum';
import { getOpenChoiceControlType } from './openChoice';
import type { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';

interface isHiddenParams {
  questionnaireItem: QuestionnaireItem;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

/**
 * Test the given QItem on a series of checks to verify if the item should be displayed
 * Check if qItem has hidden attribute
 * Check if qItem fulfilled its enableWhen criteria
 *
 * @author Sean Fong
 */
export function isHidden(params: isHiddenParams): boolean {
  const { questionnaireItem, enableWhenIsActivated, enableWhenItems, enableWhenExpressions } =
    params;
  if (hasHiddenExtension(questionnaireItem)) {
    return true;
  }

  return isHiddenByEnableWhens({
    linkId: questionnaireItem.linkId,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}

interface isHiddenByEnableWhensParams {
  linkId: string;
  enableWhenIsActivated: boolean;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
}

export function isHiddenByEnableWhens(params: isHiddenByEnableWhensParams): boolean {
  const { linkId, enableWhenIsActivated, enableWhenItems, enableWhenExpressions } = params;

  if (enableWhenIsActivated) {
    if (enableWhenItems[linkId]) {
      return !enableWhenItems[linkId].isEnabled;
    }

    if (enableWhenExpressions[linkId]) {
      return !enableWhenExpressions[linkId].isEnabled;
    }
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
