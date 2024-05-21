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

import type {
  QuestionnaireItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';

/**
 * EnableWhenExpressions interface
 *
 * @property singleExpressions - Key-value pair of non-repeat group enableWhen expressions `Record<linkId, enableWhenExpression properties>`
 * @property repeatExpressions - Key-value pair of repeat group enableWhen expressions `Record<linkId, enableWhenExpression properties>`
 */
export interface EnableWhenExpressions {
  singleExpressions: Record<string, EnableWhenSingleExpression>;
  repeatExpressions: Record<string, EnableWhenRepeatExpression>;
}

export interface EnableWhenSingleExpression {
  expression: string;
  isEnabled?: boolean;
}

export interface EnableWhenRepeatExpression {
  expression: string;
  parentLinkId: string;
  enabledIndexes: boolean[];
}

/**
 * EnableWhenItems interface
 *
 * @property singleItems - Key-value pair of non-repeat group enableWhen items `Record<linkId, enableWhen properties>`
 * @property repeatItems - Key-value pair of repeat group enableWhen items `Record<linkId, enableWhen properties>`
 */
export interface EnableWhenItems {
  singleItems: Record<string, EnableWhenSingleItemProperties>;
  repeatItems: Record<string, EnableWhenRepeatItemProperties>;
}

export interface EnableWhenSingleItemProperties {
  linked: EnableWhenSingleLinkedItem[];
  isEnabled: boolean;
  enableBehavior?: QuestionnaireItem['enableBehavior'];
}

export interface EnableWhenRepeatItemProperties {
  linked: EnableWhenRepeatLinkedItem[];
  parentLinkId: string;
  enabledIndexes: boolean[];
  enableBehavior?: QuestionnaireItem['enableBehavior'];
}

// For non-repeat groups
export interface EnableWhenSingleLinkedItem {
  enableWhen: QuestionnaireItemEnableWhen;
  answer?: QuestionnaireResponseItemAnswer[];
}

// For repeat groups
export interface EnableWhenRepeatLinkedItem {
  enableWhen: QuestionnaireItemEnableWhen;
  parentLinkId: string;
  answers: QuestionnaireResponseItemAnswer[];
}
