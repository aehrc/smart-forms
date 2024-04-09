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

import { useLayoutEffect } from 'react';
import type { unstable_Blocker as Blocker } from 'react-router';
import { unstable_useBlocker as useBlocker } from 'react-router';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';

function useLeavePageBlocker(): Blocker {
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const isBlocked = formChangesHistory.length > 0;
  const blocker = useBlocker(isBlocked);

  useLayoutEffect(() => {
    if (
      blocker.location?.pathname === '/renderer/preview' ||
      blocker.location?.pathname === '/renderer'
    ) {
      blocker.proceed?.();
    }

    if (blocker.state === 'blocked' && !isBlocked) {
      blocker.reset();
    }
  }, [blocker, isBlocked]);

  return blocker;
}

export default useLeavePageBlocker;
