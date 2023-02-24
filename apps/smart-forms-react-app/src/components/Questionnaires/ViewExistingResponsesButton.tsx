// @mui
import { Button, CircularProgress } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import Iconify from '../Iconify';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { getBundlePromise, getResponsesFromBundle } from '../../functions/DashboardFunctions';
import { useQuery } from '@tanstack/react-query';
import { Bundle, QuestionnaireResponse } from 'fhir/r5';
import { SelectedQuestionnaireContext } from '../../custom-contexts/SelectedQuestionnaireContext';
import { useNavigate } from 'react-router-dom';
import { SourceContext } from '../../layouts/dashboard/DashboardLayout';

function ViewExistingResponsesButton() {
  const { selectedQuestionnaire, setExistingResponses } = useContext(SelectedQuestionnaireContext);
  const { patient } = useContext(LaunchContext);
  const { source } = useContext(SourceContext);

  const navigate = useNavigate();

  // search responses from selected questionnaire
  const endpointUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  const questionnaireIdParam = selectedQuestionnaire?.resource?.id
    ? `questionnaire=${selectedQuestionnaire?.resource?.id}&`
    : '';
  const patientIdParam = patient?.id ? `patient=${patient?.id}&` : '';
  const queryUrl = '/QuestionnaireResponse?' + questionnaireIdParam + patientIdParam;
  const { data, isInitialLoading, error } = useQuery<Bundle>(
    ['existingResponses', queryUrl],
    () => getBundlePromise(endpointUrl, queryUrl),
    {
      enabled:
        !!selectedQuestionnaire &&
        questionnaireIdParam !== '' &&
        patientIdParam !== '' &&
        source === 'remote'
    }
  );

  if (error) {
    console.error(error);
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
      disabled={!selectedQuestionnaire || existingResponses.length === 0}
      endIcon={
        isInitialLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : data && existingResponses.length === 0 ? null : (
          <Iconify icon="material-symbols:arrow-forward" />
        )
      }
      sx={{ width: 198 }}
      onClick={handleClick}>
      {data && existingResponses.length === 0 ? 'No Responses Found' : 'View Responses'}
    </Button>
  );
}

export default ViewExistingResponsesButton;

/*

    // get assembled version of questionnaire if assembledFrom extension exists
    const assembledFrom = questionnaire.extension?.find(
      (e) =>
        e.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembledFrom'
    );

    if (assembledFrom && assembledFrom.valueCanonical) {
      const queryUrl = '/Questionnaire?url=' + assembledFrom.valueCanonical;
      return await getQuestionnairePromise(endpointUrl, queryUrl);
    }
 */
