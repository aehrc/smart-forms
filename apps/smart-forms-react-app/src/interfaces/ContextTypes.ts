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

import {
  Coding,
  Expression,
  Patient,
  Practitioner,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import {
  CalculatedExpression,
  EnableWhenItemProperties,
  EnableWhenItems,
  Renderer
} from './Interfaces';
import { PageType } from './Enums';
import { MutableRefObject } from 'react';

export type EnableWhenContextType = {
  items: Record<string, EnableWhenItemProperties>;
  linkMap: Record<string, string[]>;
  isActivated: boolean;
  setItems: (
    enableWhenItems: EnableWhenItems,
    questionnaireResponseForm: QuestionnaireResponseItem
  ) => unknown;
  updateItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => unknown;
  toggleActivation: (toggled: boolean) => unknown;
};

export type LaunchContextType = {
  fhirClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  setFhirClient: (client: Client) => unknown;
  setPatient: (patient: Patient) => unknown;
  setUser: (user: Practitioner) => unknown;
};

export type PageSwitcherContextType = {
  currentPage: PageType;
  goToPage: (page: PageType) => unknown;
};

export type CachedQueriedValueSetContextType = {
  cachedValueSetCodings: Record<string, Coding[]>;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => unknown;
};

export type CalculatedExpressionContextType = {
  calculatedExpressions: Record<string, CalculatedExpression>;
  updateCalculatedExpressions: (
    questionnaireResponse: QuestionnaireResponse,
    variables: Expression[]
  ) => unknown;
};

export type SourceContextType = {
  source: 'local' | 'remote';
  setSource: (updatedSource: 'local' | 'remote') => unknown;
};

export type RendererContextType = {
  renderer: Renderer;
  setRenderer: (updatedRenderer: Renderer) => unknown;
};

export type CurrentTabIndexContextType = {
  currentTabIndex: number;
  setCurrentTabIndex: (updatedIndex: number) => unknown;
};

export type PrintComponentRefContextType = {
  componentRef: MutableRefObject<null> | null;
  setComponentRef: (componentRef: MutableRefObject<null>) => unknown;
};
