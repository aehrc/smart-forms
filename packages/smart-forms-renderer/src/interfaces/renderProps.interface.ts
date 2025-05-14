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

import type { QrRepeatGroup } from './repeatGroup.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { RenderingExtensions } from '../hooks/useRenderingExtensions';

export interface PropsWithQrItemChangeHandler {
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown;
}

export interface PropsWithQrRepeatGroupChangeHandler {
  onQrRepeatGroupChange: (qrRepeatGroup: QrRepeatGroup) => unknown;
}

export interface PropsWithRenderingExtensionsAttribute {
  renderingExtensions: RenderingExtensions;
}

export interface PropsWithIsRepeatedAttribute {
  isRepeated: boolean;
}

export interface PropsWithIsTabledAttribute {
  isTabled: boolean;
}

export interface PropsWithIsTabledRequiredAttribute {
  isTabled: boolean;
}

export interface PropsWithShowMinimalViewAttribute {
  showMinimalView?: boolean;
}

export interface PropsWithParentIsReadOnlyAttribute {
  parentIsReadOnly?: boolean;
}

export interface PropsWithFeedbackFromParentAttribute {
  feedbackFromParent?: string;
}

export interface PropsWithParentIsRepeatGroupAttribute {
  parentIsRepeatGroup?: boolean;
  parentRepeatGroupIndex?: number;
}

export interface PropsWithParentStylesAttribute {
  parentStyles?: Record<string, string>;
}

export interface BaseItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}
