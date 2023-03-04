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

import React, { useState } from 'react';
import { PageType } from '../interfaces/Enums';
import type { PageSwitcherContextType } from '../interfaces/ContextTypes';

export const PageSwitcherContext = React.createContext<PageSwitcherContextType>({
  currentPage: PageType.Renderer,
  goToPage: () => void 0
});

function PageSwitcherContextProvider(props: {
  children: React.ReactNode;
  questionnairePresent: boolean;
}) {
  const { children, questionnairePresent } = props;
  const [currentPage, goToPage] = useState<PageType>(
    questionnairePresent ? PageType.Renderer : PageType.Picker
  );

  const pageSwitcherContext: PageSwitcherContextType = {
    currentPage: currentPage,
    goToPage: goToPage
  };
  return (
    <PageSwitcherContext.Provider value={pageSwitcherContext}>
      {children}
    </PageSwitcherContext.Provider>
  );
}

export default PageSwitcherContextProvider;
