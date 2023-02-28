import React, { createContext, useContext, useEffect, useState } from 'react';
import RendererHeader from './RendererHeader/RendererHeader';
import RendererNav from './RendererNav/RendererNav';
import { StyledRoot } from '../StyledComponents/Layout.styles';
import { Main } from './RendererLayout.styles';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { createQuestionnaireResponse, removeNoAnswerQrItem } from '../../functions/QrItemFunctions';
import { populateQuestionnaire } from '../../functions/populate-functions/PrepopulateFunctions';
import { QuestionnaireResponse } from 'fhir/r5';
import EnableWhenContextProvider from '../../custom-contexts/EnableWhenContext';
import CalculatedExpressionContextProvider from '../../custom-contexts/CalculatedExpressionContext';
import CachedQueriedValueSetContextProvider from '../../custom-contexts/CachedValueSetContext';
import ProgressSpinner from '../Misc/ProgressSpinner';
import { Outlet } from 'react-router-dom';
import { CurrentTabIndexContextType, RendererContextType } from '../../interfaces/ContextTypes';
import { Renderer } from '../../interfaces/Interfaces';
import BackToTopButton from '../Misc/BackToTopButton';
import { Fab, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ScrollToTop from '../Nav/ScrollToTop';
import { unstable_useBlocker as useBlocker } from 'react-router';
import BlockerUnsavedFormDialog from './RendererNav/BlockerUnsavedFormDialog';
import { useSnackbar } from 'notistack';

const emptyResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export const RendererContext = createContext<RendererContextType>({
  renderer: {
    response: emptyResponse,
    hasChanges: false
  },
  setRenderer: () => void 0
});

export const CurrentTabIndexContext = createContext<CurrentTabIndexContextType>({
  currentTabIndex: 0,
  setCurrentTabIndex: () => void 0
});

function RendererLayout() {
  // Hooks
  const [open, setOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient, patient, user } = useContext(LaunchContext);

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

  // Init population spinner
  const initialSpinner =
    fhirClient && patient && user && !renderer.response.id
      ? {
          isLoading: true,
          message: 'Populating questionnaire form'
        }
      : { isLoading: false, message: '' };

  const [spinner, setSpinner] = useState(initialSpinner);

  let isBlocked = renderer.hasChanges;
  const blocker = useBlocker(isBlocked);

  useEffect(() => {
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

  if (blocker.state === 'blocked' && !dialogOpen) {
    setDialogOpen(true);
  }

  /*
   * Update response state if response is updated from the server
   * introduces two-way binding
   * TODO prompt user that there are changes from the server
   *  overwrite prompt - to implement in next phase
   */
  useEffect(() => {
    if (!questionnaireResponseProvider.response.item) return;

    const qrFormCleaned = removeNoAnswerQrItem(questionnaireResponseProvider.response.item[0]);
    if (qrFormCleaned) {
      setRenderer({
        ...renderer,
        response: { ...questionnaireResponseProvider.response, item: [qrFormCleaned] }
      });
    }
  }, [questionnaireResponseProvider.response]); // init update renderer response only when server-side changes occur, leave dependency array empty

  /*
   * Perform pre-population if all the following requirements are fulfilled:
   * 1. App is connected to a CMS
   * 2. Pre-pop queries exist in the form of contained resources or extensions
   * 3. QuestionnaireResponse does not have answer items
   * 4. QuestionnaireResponse is not from a saved draft response
   */
  const qrFormItem = initialResponse.item?.[0].item;
  if (
    fhirClient &&
    patient &&
    user &&
    spinner.isLoading &&
    (questionnaireProvider.questionnaire.contained ||
      questionnaireProvider.questionnaire.extension) &&
    (!qrFormItem || qrFormItem.length === 0) &&
    !questionnaireResponseProvider.response.id
  ) {
    // obtain questionnaireResponse for pre-population
    populateQuestionnaire(
      fhirClient,
      questionnaireProvider.questionnaire,
      patient,
      user,
      (populated) => {
        questionnaireResponseProvider.setQuestionnaireResponse(populated);
        setRenderer({ ...renderer, response: populated });
        setSpinner({ ...spinner, isLoading: false });
        enqueueSnackbar('Questionnaire form populated');
      },
      () => {
        setSpinner({ ...spinner, isLoading: false });
        console.warn('Population failed');
        enqueueSnackbar('Form population failed', { variant: 'warning' });
      }
    );
  } else {
    if (spinner.isLoading) {
      setSpinner({ ...spinner, isLoading: false });
    }
  }

  return (
    <RendererContext.Provider value={{ renderer, setRenderer }}>
      <ScrollToTop />
      <StyledRoot>
        <RendererHeader onOpenNav={() => setOpen(true)} navCollapsed={navCollapsed} />
        <RendererNav
          openNav={open}
          onCloseNav={() => setOpen(false)}
          navCollapsed={navCollapsed}
          setNavCollapsed={() => setNavCollapsed(true)}
        />

        <Main>
          <EnableWhenContextProvider>
            <CalculatedExpressionContextProvider>
              <CachedQueriedValueSetContextProvider>
                <CurrentTabIndexContext.Provider value={{ currentTabIndex, setCurrentTabIndex }}>
                  {spinner.isLoading ? <ProgressSpinner message={spinner.message} /> : <Outlet />}
                </CurrentTabIndexContext.Provider>
              </CachedQueriedValueSetContextProvider>
            </CalculatedExpressionContextProvider>
          </EnableWhenContextProvider>
        </Main>

        {/* Dialogs and FABs */}
        {blocker.state === 'blocked' ? (
          <BlockerUnsavedFormDialog
            blocker={blocker}
            open={dialogOpen}
            closeDialog={() => setDialogOpen(false)}
          />
        ) : null}

        <BackToTopButton>
          <Fab size="medium" sx={{ backgroundColor: 'pale.primary' }}>
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>

        {navCollapsed ? (
          <IconButton
            onClick={() => setNavCollapsed(false)}
            sx={{ position: 'fixed', bottom: 16, left: 16 }}>
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        ) : null}
      </StyledRoot>
    </RendererContext.Provider>
  );
}

export default RendererLayout;
