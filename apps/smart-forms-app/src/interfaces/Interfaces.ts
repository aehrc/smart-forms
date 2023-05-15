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
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet
} from 'fhir/r4';

export interface PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export interface PropsWithQrRepeatGroupChangeHandler {
  onQrRepeatGroupChange: (qrRepeatGroup: QrRepeatGroup) => unknown;
}

export interface PropsWithIsRepeatedAttribute {
  isRepeated: boolean;
}

export interface PropsWithIsTabledAttribute {
  isTabled: boolean;
}

export interface CalculatedExpression {
  expression: string;
  value?: number | string;
}

export interface AnswerExpression {
  expression: string;
  value?: QuestionnaireItemAnswerOption;
}

export type EnableWhenItems = Record<string, EnableWhenItemProperties>;

export interface EnableWhenItemProperties {
  linked: EnableWhenLinkedItem[];
  isEnabled: boolean;
  enableBehavior?: QuestionnaireItem['enableBehavior'];
}

export interface EnableWhenLinkedItem {
  enableWhen: QuestionnaireItemEnableWhen;
  answer?: QuestionnaireResponseItemAnswer[];
}

export interface AuthFailDialog {
  dialogOpen: boolean | null;
  errorMessage: string;
}

export interface QrRepeatGroup {
  linkId: string;
  qrItems: QuestionnaireResponseItem[];
}

export interface ValueSetPromise {
  promise: Promise<ValueSet>;
  valueSet?: ValueSet;
}

export interface TableAttributes {
  id: string;
  label: string;
  alignRight: boolean;
}

export interface QuestionnaireListItem {
  id: string;
  title: string;
  avatarColor: string;
  publisher: string;
  date: string;
  status: Questionnaire['status'];
}

export interface ResponseListItem {
  id: string;
  title: string;
  avatarColor: string;
  author: string;
  authored: string;
  status: QuestionnaireResponse['status'];
}

export type ListItem = QuestionnaireListItem | ResponseListItem;

export type ListItemWithIndex = [number, QuestionnaireListItem | ResponseListItem];

export interface SelectedQuestionnaire {
  listItem: QuestionnaireListItem;
  resource: Questionnaire;
}

export interface SelectedResponse {
  listItem: ResponseListItem;
  resource: QuestionnaireResponse;
}

export interface Renderer {
  response: QuestionnaireResponse;
  hasChanges: boolean;
}

export interface Variables {
  fhirPathVariables: Record<string, Expression[]>;
  xFhirQueryVariables: Record<string, VariableXFhirQuery>;
}

export interface VariableXFhirQuery {
  valueExpression: Expression;
  result?: QuestionnaireItemAnswerOption;
}
