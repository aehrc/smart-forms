/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import type { QrRepeatGroup } from './repeatGroup.interface';
import type { RenderingExtensions } from '../hooks/useRenderingExtensions';
import type { JSX } from 'react';

export interface QItemOverrideComponentProps {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null;
  isRepeated: boolean;
  isTabled?: boolean;
  renderingExtensions?: RenderingExtensions;
  groupCardElevation?: number;
  parentIsReadOnly?: boolean;
  feedbackFromParent?: string;
  parentIsRepeatGroup?: boolean;
  parentRepeatGroupIndex?: number;
  parentStyles?: Record<string, string>;
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
  onQrRepeatGroupChange: (qrRepeatGroup: QrRepeatGroup) => unknown;
}

export interface SdcUiOverrideComponentProps {
  displayText: string | JSX.Element | JSX.Element[];
  readOnly?: boolean;
}
