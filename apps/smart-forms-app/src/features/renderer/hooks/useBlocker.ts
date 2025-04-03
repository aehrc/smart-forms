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

import { useCallback, useLayoutEffect } from 'react';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import type { Blocker, BlockerFunction } from 'react-router-dom';
import { useBlocker } from 'react-router-dom';

function useLeavePageBlocker(): Blocker {
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const hasChanges = formChangesHistory.length > 0;

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      // this blocker is buggy, ensure it does not block when switching between preview and renderer
      const switchingBetweenPreviewAndRenderer =
        (currentLocation.pathname === '/renderer/preview' &&
          nextLocation.pathname === '/renderer') ||
        (currentLocation.pathname === '/renderer/preview' && nextLocation.pathname === '/renderer');

      return (
        hasChanges &&
        !switchingBetweenPreviewAndRenderer &&
        currentLocation.pathname !== nextLocation.pathname
      );
    },
    [hasChanges]
  );

  const blocker = useBlocker(shouldBlock);

  useLayoutEffect(() => {
    if (
      blocker.location?.pathname === '/renderer/preview' ||
      blocker.location?.pathname === '/renderer'
    ) {
      blocker.proceed?.();
    }

    if (blocker.state === 'blocked' && !hasChanges) {
      blocker.reset();
    }
  }, [blocker, hasChanges]);

  return blocker;
}

export default useLeavePageBlocker;
