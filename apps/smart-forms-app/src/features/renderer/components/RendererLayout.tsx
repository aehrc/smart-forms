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
import RendererEmbeddedSpeedDial from './RendererEmbeddedSpeedDial/RendererEmbeddedSpeedDial.tsx';
import useResponsive from '../../../hooks/useResponsive.ts';
import usePopulate from '../../prepopulate/hooks/usePopulate.tsx';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import type { RendererSpinner } from '../types/rendererSpinner.ts';
import RepopulateBackdrop from '../../repopulate/components/RepopulateBackdrop.tsx';

function RendererLayout() {
  const { smartClient, patient, user } = useSmartClient();

  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);

  // Init population spinner
  let initialSpinner: RendererSpinner = { isSpinning: false, status: 'prepopulate', message: '' };
  if (smartClient && patient && user && !sourceResponse.id) {
    initialSpinner = {
      isSpinning: true,
      status: 'prepopulate',
      message: 'Populating form'
    };
  }
  const [spinner, setSpinner] = useState<RendererSpinner>(initialSpinner);

  // Page blocker
  const [dialogOpen, setDialogOpen] = useState(false);
  const leavePageBlocker = useLeavePageBlocker();
  if (leavePageBlocker.state === 'blocked' && !dialogOpen) {
    setDialogOpen(true);
  }

  const isDesktop = useResponsive('up', 'lg');

  useBackToTop();

  usePopulate(spinner, () => setSpinner({ isSpinning: false, status: null, message: '' }));

  const isPrepopulating = spinner.isSpinning && spinner.status === 'prepopulate';
  const isRepopulateWriting = spinner.isSpinning && spinner.status === 'repopulate-write';

  return (
    <StyledRoot>
      <RendererHeader
        onOpenMobileNav={() => setMobileNavOpen(true)}
        desktopNavCollapsed={desktopNavCollapsed}
      />

      <RendererNavWrapper
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
        desktopNavCollapsed={desktopNavCollapsed}
        onCollapseDesktopNav={() => setDesktopNavCollapsed(true)}
        spinner={spinner}
        onSpinnerChange={(newSpinner) => setSpinner(newSpinner)}
      />
      <Main>
        {isPrepopulating || isRepopulateWriting ? (
          <PopulationProgressSpinner message={spinner.message} />
        ) : (
          <Outlet />
        )}
      </Main>

      {/* Dialogs and FABs */}
      {leavePageBlocker.state === 'blocked' ? (
        <BlockerUnsavedFormDialog
          blocker={leavePageBlocker}
          open={dialogOpen}
          closeDialog={() => setDialogOpen(false)}
        />
      ) : null}

      <NavExpandButton
        desktopNavCollapsed={desktopNavCollapsed}
        onExpandNav={() => setDesktopNavCollapsed(false)}
      />

      {isDesktop ? (
        <BackToTopButton>
          <Fab size="medium">
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>
      ) : (
        <RendererEmbeddedSpeedDial
          spinner={spinner}
          onSpinnerChange={(newSpinner) => setSpinner(newSpinner)}
        />
      )}

      <RepopulateBackdrop
        spinner={spinner}
        onSpinnerChange={(newSpinner) => setSpinner(newSpinner)}
      />
    </StyledRoot>
  );
}

export default RendererLayout;
