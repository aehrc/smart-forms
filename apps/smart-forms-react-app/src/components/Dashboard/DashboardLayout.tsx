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

import React, { useContext, useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DashboardNav from './DashboardNav/DashboardNav';
import { Main, StyledRoot } from '../StyledComponents/Layout.styles';
import { Outlet } from 'react-router-dom';
import SelectedQuestionnaireContextProvider from '../../custom-contexts/SelectedQuestionnaireContext';
import { DebugModeContext } from '../../custom-contexts/DebugModeContext';
import DashboardDebugFooter from './DashboardDebugFooter/DashboardDebugFooter';

function DashboardLayout() {
  const { debugMode } = useContext(DebugModeContext);
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <DashboardHeader onOpenNav={() => setOpen(true)} />
      <DashboardNav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        <SelectedQuestionnaireContextProvider>
          <Outlet />
        </SelectedQuestionnaireContextProvider>
      </Main>
      {debugMode ? <DashboardDebugFooter /> : null}
    </StyledRoot>
  );
}

export default DashboardLayout;
