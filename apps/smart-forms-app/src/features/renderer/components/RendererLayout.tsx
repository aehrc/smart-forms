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

import { useState } from 'react';
import RendererHeader from './RendererHeader/RendererHeader.tsx';
import RendererNavWrapper from './RendererNav/RendererNavWrapper.tsx';
import { StyledRoot } from '../../../components/Layout/Layout.styles.ts';
import { Main } from './RendererLayout.styles.ts';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../../backToTop/components/BackToTopButton.tsx';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BlockerUnsavedFormDialog from './RendererNav/BlockerUnsavedFormDialog.tsx';
import NavExpandButton from './NavCollapseButton.tsx';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import useLeavePageBlocker from '../hooks/useBlocker.ts';
import useBackToTop from '../../backToTop/hooks/useBackToTop.ts';
import useConfigStore from '../../../stores/useConfigStore.ts';
import RendererEmbeddedSpeedDial from './RendererEmbeddedSpeedDial.tsx';
import useResponsive from '../../../hooks/useResponsive.ts';
import usePopulate from '../../prepopulate/hooks/usePopulate.tsx';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';

function RendererLayout() {
  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const user = useConfigStore((state) => state.user);

  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);
  const hasChanges = useQuestionnaireResponseStore((state) => state.hasChanges);

  const [open, setOpen] = useState(false);
  const [navIsCollapsed, collapseNav] = useState(false);

  // Init population spinner
  let initialSpinner = { isLoading: false, message: '' };
  if (smartClient && patient && user && !sourceResponse.id) {
    initialSpinner = {
      isLoading: true,
      message: 'Populating form'
    };
  }
  const [spinner, setSpinner] = useState(initialSpinner);

  // Page blocker
  const [dialogOpen, setDialogOpen] = useState(false);
  const leavePageBlocker = useLeavePageBlocker(hasChanges);
  if (leavePageBlocker.state === 'blocked' && !dialogOpen) {
    setDialogOpen(true);
  }

  const isDesktop = useResponsive('up', 'lg');

  useBackToTop();

  usePopulate(spinner.isLoading, () => setSpinner({ ...spinner, isLoading: false }));

  return (
    <StyledRoot>
      <RendererHeader onOpenNav={() => setOpen(true)} navIsCollapsed={navIsCollapsed} />

      <RendererNavWrapper
        openNav={open}
        onCloseNav={() => setOpen(false)}
        navCollapsed={navIsCollapsed}
        setNavCollapsed={() => collapseNav(true)}
      />

      <Main>
        {spinner.isLoading ? <PopulationProgressSpinner message={spinner.message} /> : <Outlet />}
      </Main>

      {/* Dialogs and FABs */}
      {leavePageBlocker.state === 'blocked' ? (
        <BlockerUnsavedFormDialog
          blocker={leavePageBlocker}
          open={dialogOpen}
          closeDialog={() => setDialogOpen(false)}
        />
      ) : null}

      <NavExpandButton navCollapsed={navIsCollapsed} expandNav={() => collapseNav(false)} />

      {isDesktop ? (
        <BackToTopButton>
          <Fab size="medium">
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>
      ) : (
        <RendererEmbeddedSpeedDial isPopulating={spinner.isLoading} />
      )}
    </StyledRoot>
  );
}

export default RendererLayout;
