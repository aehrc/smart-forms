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

import type { QuestionnaireItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';
import { isHiddenByEnableWhen } from '../utils/qItem';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { useRendererStylingStore } from '../stores/rendererStylingStore';

/**
 * React hook to determine if a QuestionnaireItem is hidden via item.hidden, enableWhens, enableWhenExpressions.
 * When checking for repeating group enableWhen items, the parentRepeatGroupIndex should be provided.
 *
 * @author Sean Fong
 */
function useHidden(qItem: QuestionnaireItem, parentRepeatGroupIndex?: number): boolean {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();

  const enableWhenAsReadOnly = useRendererStylingStore.use.enableWhenAsReadOnly();

  if (structuredDataCapture.getHidden(qItem)) {
    return true;
  }

  // If enableWhenAsReadOnly is true, then items hidden by enableWhen should be displayed, but set as readOnly
  // If enableWhenAsReadOnly is a Set, all item types in the set should be displayed, but set as readOnly
  if (
    enableWhenAsReadOnly === true ||
    (enableWhenAsReadOnly instanceof Set && enableWhenAsReadOnly.has(qItem.type))
  ) {
    return false;
  }

  return isHiddenByEnableWhen({
    linkId: qItem.linkId,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions,
    parentRepeatGroupIndex
  });
}

export default useHidden;
