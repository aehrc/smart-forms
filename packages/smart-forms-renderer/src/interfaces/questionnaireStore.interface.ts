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

import type { Tabs } from './tab.interface';
import type { Variables } from './variables.interface';
import type { LaunchContext } from './populate.interface';
import type { EnableWhenExpression, EnableWhenItemProperties } from './enableWhen.interface';
import type { CalculatedExpression } from './calculatedExpression.interface';
import type { AnswerExpression } from './answerExpression.interface';
import type { Coding } from 'fhir/r4';

export interface QuestionnaireModel {
  itemTypes: Record<string, string>;
  tabs: Tabs;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
  processedValueSetUrls: Record<string, string>;
  fhirPathContext: Record<string, any>;
}
