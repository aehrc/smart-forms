// @mui
import { Button } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';
import Iconify from '../Misc/Iconify';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';
import { SelectedResponse } from '../../interfaces/Interfaces';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { useQuery } from '@tanstack/react-query';
import { Bundle, Questionnaire } from 'fhir/r5';
import {
  getFormsServerAssembledBundlePromise,
  getFormsServerBundleOrQuestionnairePromise,
  getReferencedQuestionnaire
} from '../../functions/DashboardFunctions';
import { SourceContext } from '../../Router';

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
      // invalidate current referenced questionnaire because it requires assembly
      referencedQuestionnaire = null;

      const queryUrl = '/Questionnaire?_sort=-date&url=' + assembledFrom.valueCanonical + '';
      const questionnaireBundle = await getFormsServerAssembledBundlePromise(queryUrl);
      if (questionnaireBundle.entry && questionnaireBundle.entry.length > 0) {
        const firstQuestionnaire = questionnaireBundle.entry[0].resource;

        // assign most recently updated questionnaire
        if (firstQuestionnaire) {
          referencedQuestionnaire = firstQuestionnaire as Questionnaire;
        }
      }

      // assembled questionnaire not found
      if (!referencedQuestionnaire) {
        console.error(error);
        return;
      }
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
