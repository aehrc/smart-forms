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

import type { RepeatGroupSingleModel } from '../interfaces/repeatGroup.interface';

/**
 * Get the index of a rendered repeating group instance within the QuestionnaireResponse, or null if
 * the instance has no QuestionnaireResponse counterpart.
 *
 * Instances that are still empty (added via "Add Item" but never filled in) hold a null `qrItem` and
 * are dropped when RepeatGroup builds its QuestionnaireResponse items, so an instance's rendered
 * index is not its index in the QuestionnaireResponse. Validation walks the QuestionnaireResponse, so
 * instance-scoped error keys must use this index instead.
 *
 * Keep this in sync with how RepeatGroup projects `repeatGroups` into `onQrRepeatGroupChange`.
 *
 * @author Clinton Gillespie
 */
export function getQrRepeatGroupInstanceIndex(
  repeatGroups: RepeatGroupSingleModel[],
  instanceIndex: number
): number | null {
  const repeatGroup = repeatGroups[instanceIndex];
  if (!repeatGroup || !repeatGroup.qrItem) {
    return null;
  }

  return repeatGroups.slice(0, instanceIndex).filter((precedingGroup) => precedingGroup.qrItem)
    .length;
}
