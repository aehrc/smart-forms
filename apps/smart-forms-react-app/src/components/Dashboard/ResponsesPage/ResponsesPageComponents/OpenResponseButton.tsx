// @mui
import { Button, CircularProgress } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';
import Iconify from '../../../Misc/Iconify';
import type { SelectedResponse } from '../../../../interfaces/Interfaces';
import {
  QuestionnaireProviderContext,
  QuestionnaireResponseProviderContext
} from '../../../../App';
import { useQuery } from '@tanstack/react-query';
import type { Bundle, Questionnaire } from 'fhir/r5';
import {
  getFormsServerBundleOrQuestionnairePromise,
  getReferencedQuestionnaire
} from '../../../../functions/DashboardFunctions';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { assembleIfRequired } from '../../../../functions/LoadServerResourceFunctions';
import { postQuestionnaireToSMARTHealthIT } from '../../../../functions/SaveQrFunctions';
import { LaunchContext } from '../../../../custom-contexts/LaunchContext';

interface Props {
  selectedResponse: SelectedResponse | null;
}
function OpenResponseButton(props: Props) {
  const { selectedResponse } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // reference could either be a canonical or an id
  const questionnaireRef = selectedResponse?.resource.questionnaire;

  let queryUrl = '';
  if (questionnaireRef) {
    queryUrl += questionnaireRef?.startsWith('http')
      ? `/Questionnaire?_sort=-date&url=${questionnaireRef}`
      : `/${questionnaireRef}`;
  }

  // search referenced questionnaire
  const { data, error } = useQuery<Bundle | Questionnaire>(
    ['referencedQuestionnaire', queryUrl],
    () => getFormsServerBundleOrQuestionnairePromise(queryUrl),
    {
      enabled: !!selectedResponse && !!questionnaireRef
    }
  );

  if (error) {
    console.error(error);
    enqueueSnackbar('There might be an issue with this response', { variant: 'warning' });
  }

  let referencedQuestionnaire: Questionnaire | null = useMemo(
    () => getReferencedQuestionnaire(data),
    [data]
  );

  async function handleClick() {
    if (!selectedResponse) {
      enqueueSnackbar('No response selected.', { variant: 'error' });
      return;
    }

    if (!referencedQuestionnaire) {
      enqueueSnackbar('Referenced questionnaire of selected response not found', {
        variant: 'error'
      });
      return;
    }
    setIsLoading(true);

    // assemble questionnaire if selected response is linked to an assemble-root questionnaire
    referencedQuestionnaire = await assembleIfRequired(referencedQuestionnaire);

    // return early if assembly cannot be performed
    if (!referencedQuestionnaire) {
      console.error(error);
      enqueueSnackbar('Referenced questionnaire not found. Unable to open response', {
        variant: 'error'
      });
      setIsLoading(false);
      return;
    }

    // Post questionnaire to client if it is SMART Health IT
    if (fhirClient?.state.serverUrl === 'https://launch.smarthealthit.org/v/r4/fhir') {
      referencedQuestionnaire.id = referencedQuestionnaire.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(fhirClient, referencedQuestionnaire);
    }

    // Assign questionnaire to questionnaire provider
    await questionnaireProvider.setQuestionnaire(referencedQuestionnaire);

    // Assign questionnaireResponse to questionnaireResponse provider
    questionnaireResponseProvider.setQuestionnaireResponse(selectedResponse.resource);

    navigate('/viewer');
    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedResponse}
      endIcon={
        isLoading ? (
          <CircularProgress size={20} sx={{ color: 'common.white' }} />
        ) : (
          <Iconify icon="material-symbols:open-in-new" />
        )
      }
      sx={{
        px: 2.5,
        backgroundColor: 'secondary.main',
        '&:hover': {
          backgroundColor: 'secondary.dark'
        }
      }}
      data-test="button-open-response"
      onClick={handleClick}>
      Open Response
    </Button>
  );
}

export default OpenResponseButton;
