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

import type { QuestionnaireItem } from 'fhir/r4';
import { hasHiddenExtension } from '../utils/itemControl.ts';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore.ts';
import { isHiddenByEnableWhens } from '../utils/qItem.ts';

function useHidden(qItem: QuestionnaireItem): boolean {
  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  if (hasHiddenExtension(qItem)) {
    return true;
  }

  return isHiddenByEnableWhens({
    linkId: qItem.linkId,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}

export default useHidden;
