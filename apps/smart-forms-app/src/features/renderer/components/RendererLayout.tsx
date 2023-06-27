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
import RendererHeader from './RendererHeader/RendererHeader.tsx';
import RendererNav from './RendererNav/RendererNav.tsx';
import { StyledRoot } from '../../../components/Layout/Layout.styles.ts';
import { Main } from './RendererLayout.styles.ts';
import {
  QuestionnaireProviderContext,
  QuestionnaireResponseProviderContext
} from '../../../App.tsx';
import { SmartAppLaunchContext } from '../../smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import { createQuestionnaireResponse, removeNoAnswerQrItem } from '../utils/qrItem.ts';
import { populateQuestionnaire } from '../../prepopulate/utils/populate.ts';
import type { QuestionnaireResponse } from 'fhir/r4';
import EnableWhenContextProvider from '../../enableWhen/contexts/EnableWhenContext.tsx';
import EnableWhenExpressionContextProvider from '../../enableWhenExpression/contexts/EnableWhenExpressionContext.tsx';
import CalculatedExpressionContextProvider from '../../calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import CachedQueriedValueSetContextProvider from '../../valueSet/contexts/CachedQueriedValueSetContext.tsx';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../../backToTop/components/BackToTopButton.tsx';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BlockerUnsavedFormDialog from './RendererNav/BlockerUnsavedFormDialog.tsx';
import { useSnackbar } from 'notistack';
import NavExpandButton from './NavCollapseButton.tsx';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import type { Renderer } from '../types/renderer.interface.ts';
import useLeavePageBlocker from '../hooks/useBlocker.ts';
import { RendererContext } from '../contexts/RendererContext.ts';
import { CurrentTabIndexContext } from '../contexts/CurrentTabIndexContext.ts';
import useBackToTop from '../../backToTop/hooks/useBackToTop.ts';

function RendererLayout() {
  const [open, setOpen] = useState(false);
  const [navIsCollapsed, setNavIsCollapsed] = useState(false);

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient, patient, user, encounter } = useContext(SmartAppLaunchContext);

  // Fill questionnaireResponse with questionnaire details if questionnaireResponse is in a clean state
  let initialResponse: QuestionnaireResponse;
  if (questionnaireProvider.questionnaire.item && !questionnaireResponseProvider.response.item) {
    initialResponse = createQuestionnaireResponse(
      questionnaireProvider.questionnaire.id,
      questionnaireProvider.questionnaire.item[0]
    );
    questionnaireResponseProvider.setQuestionnaireResponse(initialResponse);
  } else {
    initialResponse = questionnaireResponseProvider.response;
  }

  const [renderer, setRenderer] = useState<Renderer>({
    response: initialResponse,
    hasChanges: false
  });
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  useBackToTop();

  // Init population spinner
  const initialSpinner =
    fhirClient && patient && user && !renderer.response.id
      ? {
          isLoading: true,
          message: 'Populating form'
        }
      : { isLoading: false, message: '' };

  const [spinner, setSpinner] = useState(initialSpinner);

  const leavePageBlocked = renderer.hasChanges;
  const leavePageBlocker = useLeavePageBlocker(leavePageBlocked);

  if (leavePageBlocker.state === 'blocked' && !dialogOpen) {
    setDialogOpen(true);
  }

  /*
   * Update response state if response is updated from the server
   * introduces two-way binding
   * TODO prompt user that there are changes from the server
   *  overwrite prompt - to implement in next phase
   */
  useEffect(
    () => {
      const responseFromProvider = questionnaireResponseProvider.response;
      if (!responseFromProvider.item || responseFromProvider.item.length === 0) return;

      let shouldUpdateResponse = false;
      const updatedTopLevelQRItems = responseFromProvider.item.map((topLevelQRItem) => {
        const topLevelQRItemCleaned = removeNoAnswerQrItem(topLevelQRItem);

        if (topLevelQRItemCleaned) {
          shouldUpdateResponse = true;
          return topLevelQRItemCleaned;
        } else {
          return topLevelQRItem;
        }
      });

      if (shouldUpdateResponse) {
        setRenderer({
          ...renderer,
          response: { ...questionnaireResponseProvider.response, item: updatedTopLevelQRItems }
        });
      }
    },
    // init update renderer response only when server-side changes occur, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionnaireResponseProvider.response]
  );

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of questionnaire-level extensions or contained resources
   * 3. QuestionnaireResponse does not have answer items
   * 4. QuestionnaireResponse is not from a saved draft response
   */
  const responseHasNoAnswers: boolean =
    !initialResponse.item?.[0].item || initialResponse.item?.[0].item.length === 0;

  if (
    fhirClient &&
    patient &&
    user &&
    spinner.isLoading &&
    (questionnaireProvider.questionnaire.contained ||
      questionnaireProvider.questionnaire.extension) &&
    responseHasNoAnswers &&
    !questionnaireResponseProvider.response.id
  ) {
    // obtain questionnaireResponse for pre-population
    populateQuestionnaire(
      questionnaireProvider.questionnaire,
      fhirClient,
      patient,
      user,
      encounter,
      (populated: QuestionnaireResponse, hasWarnings: boolean) => {
        questionnaireResponseProvider.setQuestionnaireResponse(populated);
        setRenderer({ ...renderer, response: populated });
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
    <RendererContext.Provider value={{ renderer, setRenderer }}>
      <StyledRoot>
        <RendererHeader onOpenNav={() => setOpen(true)} navIsCollapsed={navIsCollapsed} />
        <RendererNav
          openNav={open}
          onCloseNav={() => setOpen(false)}
          navCollapsed={navIsCollapsed}
          setNavCollapsed={() => setNavIsCollapsed(true)}
        />

        <Main>
          <EnableWhenContextProvider>
            <CalculatedExpressionContextProvider>
              <EnableWhenExpressionContextProvider>
                <CachedQueriedValueSetContextProvider>
                  <CurrentTabIndexContext.Provider value={{ currentTabIndex, setCurrentTabIndex }}>
                    {spinner.isLoading ? (
                      <PopulationProgressSpinner message={spinner.message} />
                    ) : (
                      <Outlet />
                    )}
                  </CurrentTabIndexContext.Provider>
                </CachedQueriedValueSetContextProvider>
              </EnableWhenExpressionContextProvider>
            </CalculatedExpressionContextProvider>
          </EnableWhenContextProvider>
        </Main>

        {/* Dialogs and FABs */}
        {leavePageBlocker.state === 'blocked' ? (
          <BlockerUnsavedFormDialog
            blocker={leavePageBlocker}
            open={dialogOpen}
            closeDialog={() => setDialogOpen(false)}
          />
        ) : null}

        <NavExpandButton navCollapsed={navIsCollapsed} expandNav={() => setNavIsCollapsed(false)} />

        <BackToTopButton>
          <Fab size="medium" sx={{ backgroundColor: 'pale.primary' }}>
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>
      </StyledRoot>
    </RendererContext.Provider>
  );
}

export default RendererLayout;
