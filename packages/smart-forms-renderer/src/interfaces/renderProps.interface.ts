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

import type { QrRepeatGroup } from './repeatGroup.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { RenderingExtensions } from '../hooks/useRenderingExtensions';
import type { ItemPath } from './itemPath.interface';

/**
 * Props interface for components that emit a `QuestionnaireResponseItem` update.
 *
 * @property onQrItemChange - Callback function to handle an updated QR item.
 * - The `qrItem` represents the new or modified item.
 * - The optional `targetItemPath` identifies the item's full hierarchical location,
 *   represented as an array of path segments, each typically containing a `linkId` and (if applicable) an index.
 *
 * **Important**: If the update originates from a calculated expression,
 * `targetItemPath` must be provided so the form engine can locate and correctly update the item.
 */
export interface PropsWithQrItemChangeHandler {
  onQrItemChange: (qrItem: QuestionnaireResponseItem, targetItemPath?: ItemPath) => unknown;
}

/**
 * Props interface for components that emit a `QrRepeatGroup` update.
 *
 * @property onQrRepeatGroupChange - Callback function to handle an updated repeating group item.
 * - The `qrRepeatGroup` represents the entire repeating group structure.
 * - The optional `targetItemPath` identifies the exact repeated group instance being updated,
 *   specified as a full path of segments (e.g., each with `linkId` and repeat index).
 */
export interface PropsWithQrRepeatGroupChangeHandler {
  onQrRepeatGroupChange: (qrRepeatGroup: QrRepeatGroup, targetItemPath?: ItemPath) => unknown;
}

/**
 * Props interface for components that are aware of their position within the `QuestionnaireResponse` hierarchy.
 *
 * @property itemPath - The full path to the current item within the `QuestionnaireResponse`,
 *   represented as an array of path segments. Each segment includes the `linkId` of the item
 *   and, if applicable, a `repeatIndex` for repeating items.
 *
 * This path is used to:
 * - Precisely locate the item within the response structure.
 * - Support efficient updates to nested or repeated items.
 * - Ensure accurate context for calculated expressions, conditional logic, and user input.
 *
 * Components that render or modify QR items should receive this prop to maintain correct hierarchy tracking.
 */
export interface PropsWithItemPathAttribute {
  itemPath: ItemPath;
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

export interface PropsWithCalculatedExpressionUpdatedAttribute {
  calcExpUpdated: boolean;
}

export interface PropsWithParentStylesAttribute {
  parentStyles?: Record<string, string>;
}

export interface BaseItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithCalculatedExpressionUpdatedAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}
