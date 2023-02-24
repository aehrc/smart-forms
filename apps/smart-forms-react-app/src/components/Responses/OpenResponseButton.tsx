// @mui
import { Button } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';
import Iconify from '../Iconify';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';
import { SelectedResponse } from '../../interfaces/Interfaces';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { useQuery } from '@tanstack/react-query';
import { Bundle, Questionnaire } from 'fhir/r5';
import {
  getBundleOrQuestionnairePromise,
  getQuestionnairePromise,
  getReferencedQuestionnaire
} from '../../functions/DashboardFunctions';
import { SourceContext } from '../../layouts/dashboard/DashboardLayout';

interface Props {
  selectedResponse: SelectedResponse | null;
}
function OpenResponseButton(props: Props) {
  const { selectedResponse } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);
  const { source } = useContext(SourceContext);

  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  // search questionnaire from selected response
  const endpointUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  // create a use query to fetch the questionnaire from the response
  // define conditions at usequery hook

  // reference could either be a canonical or an id
  const questionnaireRef = selectedResponse?.resource.questionnaire;

  let queryUrl = '/Questionnaire?_sort=-date&';
  if (questionnaireRef) {
    queryUrl += questionnaireRef?.startsWith('http')
      ? `url=${questionnaireRef}`
      : `/${questionnaireRef}`;
  }

  // search referenced questionnaire
  const { data, error } = useQuery<Bundle | Questionnaire>(
    ['referencedQuestionnaire', queryUrl],
    () => getBundleOrQuestionnairePromise(endpointUrl, queryUrl),
    {
      enabled: !!selectedResponse && !!questionnaireRef
    }
  );

  if (error) {
    console.error(error);
  }

  let referencedQuestionnaire: Questionnaire | null = useMemo(
    () => getReferencedQuestionnaire(data),
    [data]
  );

  async function handleClick() {
    if (!selectedResponse || !referencedQuestionnaire) return;
    setIsLoading(true);

    // get assembled version of questionnaire if assembledFrom extension exists
    const assembledFrom = referencedQuestionnaire.extension?.find(
      (e) =>
        e.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembledFrom'
    );

    if (assembledFrom && assembledFrom.valueCanonical) {
      const queryUrl = '/Questionnaire?url=' + assembledFrom.valueCanonical;
      referencedQuestionnaire = await getQuestionnairePromise(endpointUrl, queryUrl);
    }

    // Assign questionnaire to questionnaire provider
    await questionnaireProvider.setQuestionnaire(
      referencedQuestionnaire,
      source === 'local',
      fhirClient
    );

    // Assign questionnaireResponse to questionnaireResponse provider
    questionnaireResponseProvider.setQuestionnaireResponse(selectedResponse.resource);
    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedResponse}
      endIcon={
        isLoading ? (
          <WhiteCircularProgress size={20} />
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
      onClick={handleClick}>
      Open Response
    </Button>
  );
}

export default OpenResponseButton;
