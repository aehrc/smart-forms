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

import { useContext } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { hasHiddenExtension } from '../utils/itemControl.ts';
import { EnableWhenContext } from '../../enableWhen/contexts/EnableWhenContext.tsx';
import { EnableWhenExpressionContext } from '../../enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';

function useHidden(qItem: QuestionnaireItem): boolean {
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenExpressionContext = useContext(EnableWhenExpressionContext);

  if (hasHiddenExtension(qItem)) return true;

  if (enableWhenContext.isActivated) {
    if (enableWhenContext.items[qItem.linkId]) {
      return !enableWhenContext.items[qItem.linkId].isEnabled;
    }

    if (enableWhenExpressionContext.enableWhenExpressions[qItem.linkId]) {
      return !enableWhenExpressionContext.enableWhenExpressions[qItem.linkId].isEnabled;
    }
  }

  // Questionnaire item not hidden by default
  return false;
}

export default useHidden;
