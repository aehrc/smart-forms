// @mui
import { Button, CircularProgress } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import Iconify from '../../../Misc/Iconify';
import { LaunchContext } from '../../../../custom-contexts/LaunchContext';
import {
  getClientBundlePromise,
  getResponsesFromBundle
} from '../../../../functions/DashboardFunctions';
import { useQuery } from '@tanstack/react-query';
import { Bundle, QuestionnaireResponse } from 'fhir/r5';
import { SelectedQuestionnaireContext } from '../../../../custom-contexts/SelectedQuestionnaireContext';
import { useNavigate } from 'react-router-dom';
import { SourceContext } from '../../../../Router';
import { useSnackbar } from 'notistack';

function ViewExistingResponsesButton() {
  const { selectedQuestionnaire, setExistingResponses } = useContext(SelectedQuestionnaireContext);
  const { fhirClient, patient } = useContext(LaunchContext);
  const { source } = useContext(SourceContext);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // search responses from selected questionnaire
  let questionnaireRefParam = '';

  // Have different questionnaireRef config due to SMART Health IT limitation
  if (fhirClient) {
    const questionnaireRef =
      fhirClient?.state.serverUrl === 'https://launch.smarthealthit.org/v/r4/fhir'
        ? selectedQuestionnaire?.resource?.id
        : selectedQuestionnaire?.resource?.url;

    if (questionnaireRef) {
      questionnaireRefParam = `questionnaire=${questionnaireRef}&`;
    }
  }

  const patientIdParam = patient?.id ? `patient=${patient?.id}&` : '';
  const queryUrl = '/QuestionnaireResponse?' + questionnaireRefParam + patientIdParam;

  const { data, isInitialLoading, error } = useQuery<Bundle>(
    ['existingResponses', queryUrl],
    () => getClientBundlePromise(fhirClient!, queryUrl),
    {
      enabled:
        !!selectedQuestionnaire &&
        questionnaireRefParam !== '' &&
        patientIdParam !== '' &&
        source === 'remote' &&
        !!fhirClient
    }
  );

  if (error) {
    console.error(error);
    enqueueSnackbar('An error occurred while fetching existing responses', {
      variant: 'error',
      preventDuplicate: true
    });
  }

  const existingResponses: QuestionnaireResponse[] = useMemo(
    () => getResponsesFromBundle(data),
    [data]
  );

  function handleClick() {
    setExistingResponses(existingResponses);
    navigate('/responses');
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedQuestionnaire || existingResponses.length === 0 || source === 'local'}
      endIcon={
        isInitialLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : data && existingResponses.length === 0 ? null : (
          <Iconify icon="material-symbols:arrow-forward" />
        )
      }
      sx={{ width: 175 }}
      onClick={handleClick}>
      {data && existingResponses.length === 0 ? 'No Responses Found' : 'View Responses'}
    </Button>
  );
}

export default ViewExistingResponsesButton;
