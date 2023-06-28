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

import { useContext, useEffect } from 'react';
import { EnableWhenContext } from '../../enableWhen/contexts/EnableWhenContext.tsx';
import { EnableWhenExpressionContext } from '../../enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import { QuestionnaireProviderContext } from '../../../App.tsx';
import { RendererContext } from '../contexts/RendererContext.ts';
import { FormTabsContext } from '../contexts/FormTabsContext.tsx';

function useInitialiseForm() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const enableWhenContext = useContext(EnableWhenContext);
  const { initEnableWhenExpressions } = useContext(EnableWhenExpressionContext);

  const { renderer } = useContext(RendererContext);
  const { tabs, formHasTabs, switchTab } = useContext(FormTabsContext);

  useEffect(
    () => {
      const updatedEnableWhenItems = enableWhenContext.initItems(
        questionnaireProvider.enableWhenItems,
        renderer.response
      );
      const updatedEnableWhenExpressions = initEnableWhenExpressions(
        questionnaireProvider.enableWhenExpressions,
        renderer.response,
        questionnaireProvider.variables.fhirPathVariables
      );

      const hasTabs = formHasTabs();
      if (hasTabs) {
        const firstVisibleTab = Object.entries(tabs)
          .sort(([, tabA], [, tabB]) => tabA.tabIndex - tabB.tabIndex)
          .findIndex(([tabLinkId, tab]) => {
            if (tab.isHidden) {
              return false;
            }

            if (enableWhenContext.isActivated) {
              if (updatedEnableWhenItems[tabLinkId]) {
                return updatedEnableWhenItems[tabLinkId].isEnabled;
              }

              if (updatedEnableWhenExpressions[tabLinkId]) {
                return updatedEnableWhenExpressions[tabLinkId].isEnabled;
              }
            }

            return true;
          });

        // if (firstVisibleTab !== -1 && firstVisibleTab !== 0) {
        //   switchTab(firstVisibleTab);
        // }
      }
    },
    // init enableWhen items on first entry into renderer, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export default useInitialiseForm;
