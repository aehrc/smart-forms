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
import RendererNav from './RendererNav/RendererNav.tsx';
import { StyledRoot } from '../../../components/Layout/Layout.styles.ts';
import { Main } from './RendererLayout.styles.ts';
import { populateQuestionnaire } from '../../prepopulate/utils/populate.ts';
import type { QuestionnaireResponse } from 'fhir/r4';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../../backToTop/components/BackToTopButton.tsx';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BlockerUnsavedFormDialog from './RendererNav/BlockerUnsavedFormDialog.tsx';
import { useSnackbar } from 'notistack';
import NavExpandButton from './NavCollapseButton.tsx';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import useLeavePageBlocker from '../hooks/useBlocker.ts';
import useBackToTop from '../../backToTop/hooks/useBackToTop.ts';
import useConfigStore from '../../../stores/useConfigStore.ts';
import useQuestionnaireResponseStore from '../../../stores/useQuestionnaireResponseStore.ts';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore.ts';
import _isEqual from 'lodash/isEqual';

function RendererLayout() {
  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );

  const sourceResponse = useQuestionnaireResponseStore((state) => state.sourceResponse);
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const hasChanges = useQuestionnaireResponseStore((state) => state.hasChanges);
  const populateResponse = useQuestionnaireResponseStore((state) => state.populateResponse);

  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const user = useConfigStore((state) => state.user);
  const encounter = useConfigStore((state) => state.encounter);

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

  const { enqueueSnackbar } = useSnackbar();
  useBackToTop();

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   * 3. QuestionnaireResponse does not have answer items
   * 4. QuestionnaireResponse is not from a saved draft response
   */
  const hasNotBeenPopulated = _isEqual(sourceResponse, updatableResponse);

  if (
    smartClient &&
    patient &&
    user &&
    spinner.isLoading &&
    (sourceQuestionnaire.contained || sourceResponse.extension) &&
    hasNotBeenPopulated &&
    !sourceResponse.id
  ) {
    // obtain questionnaireResponse for pre-population
    populateQuestionnaire(
      sourceQuestionnaire,
      smartClient,
      patient,
      user,
      encounter,
      (populated: QuestionnaireResponse, hasWarnings: boolean) => {
        populateResponse(populated);
        updatePopulatedProperties(populated);
        setSpinner({ ...spinner, isLoading: false });
        if (hasWarnings) {
          enqueueSnackbar(
            'Questionnaire form partially populated, there might be issues while populating the form. View console for details.',
            { action: <CloseSnackbar />, variant: 'warning' }
          );
        } else {
          enqueueSnackbar('Questionnaire form populated', {
            action: <CloseSnackbar />
          });
        }
      },
      () => {
        setSpinner({ ...spinner, isLoading: false });
        enqueueSnackbar('Form not populated', { action: <CloseSnackbar />, variant: 'warning' });
      }
    );
  } else {
    if (spinner.isLoading) {
      setSpinner({ ...spinner, isLoading: false });
    }
  }

  return (
    <StyledRoot>
      <RendererHeader onOpenNav={() => setOpen(true)} navIsCollapsed={navIsCollapsed} />
      <RendererNav
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

      <BackToTopButton>
        <Fab size="medium" sx={{ backgroundColor: 'pale.primary' }}>
          <KeyboardArrowUpIcon />
        </Fab>
      </BackToTopButton>
    </StyledRoot>
  );
}

export default RendererLayout;
