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

import type { QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from './useRenderingExtensions';
import { useRendererConfigStore } from '../stores/rendererConfigStore';
import { isHiddenByEnableWhen } from '../utils/qItem';
import { useQuestionnaireStore } from '../stores';

function useReadOnly(
  qItem: QuestionnaireItem,
  parentIsReadOnly: boolean | undefined,
  parentRepeatGroupIndex?: number
): boolean {
  let { readOnly } = useRenderingExtensions(qItem);

  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  const enableWhenAsReadOnly = useRendererConfigStore.use.enableWhenAsReadOnly();

  // If enableWhenAsReadOnly is true, then items hidden by enableWhen should be displayed, but set as readOnly
  // If enableWhenAsReadOnly is a Set, all item types in the set should be displayed, but set as readOnly
  if (!readOnly) {
    if (
      enableWhenAsReadOnly === true ||
      (enableWhenAsReadOnly instanceof Set && enableWhenAsReadOnly.has(qItem.type))
    ) {
      readOnly = isHiddenByEnableWhen({
        linkId: qItem.linkId,
        enableWhenIsActivated,
        enableWhenItems,
        enableWhenExpressions,
        parentRepeatGroupIndex
      });
    }
  }

  if (typeof parentIsReadOnly === 'boolean' && parentIsReadOnly) {
    readOnly = parentIsReadOnly;
  }

  return readOnly;
}

export default useReadOnly;
