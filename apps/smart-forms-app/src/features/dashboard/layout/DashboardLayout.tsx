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

import { useContext, useEffect, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader.tsx';
import DashboardNav from '../components/DashboardNav/DashboardNav.tsx';
import { Main, StyledRoot } from '../../../components/Layout/Layout.styles.ts';
import { Outlet, useNavigate } from 'react-router-dom';
import SelectedQuestionnaireContextProvider from '../contexts/SelectedQuestionnaireContext.tsx';
import { DebugModeContext } from '../../debug/contexts/DebugModeContext.tsx';
import DashboardDebugFooter from '../components/DashboardDebugFooter/DashboardDebugFooter.tsx';
import { SmartAppLaunchContext } from '../../smartAppLaunch/contexts/SmartAppLaunchContext.tsx';

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const { fhirClient } = useContext(SmartAppLaunchContext);
  const { isDebugMode } = useContext(DebugModeContext);

  const navigate = useNavigate();

  const isNotLaunched = !fhirClient;

  useEffect(() => {
    // check if fhirClient is not present but app was previously authorised - happens when user refreshes the page
    // redirects user to authorisation page to be authorised again
    if (isNotLaunched && sessionStorage.getItem('authorised') === 'true') {
      navigate('/');
    }
  });

  return (
    <StyledRoot>
      <DashboardHeader onOpenNav={() => setOpen(true)} />
      <DashboardNav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        <SelectedQuestionnaireContextProvider>
          <Outlet />
        </SelectedQuestionnaireContextProvider>
      </Main>
      {isDebugMode ? <DashboardDebugFooter /> : null}
    </StyledRoot>
  );
}

export default DashboardLayout;
