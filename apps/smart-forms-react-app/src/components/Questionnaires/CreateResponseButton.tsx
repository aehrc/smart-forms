// @mui
import { Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import { QuestionnaireListItem } from '../../interfaces/Interfaces';
import Iconify from '../Iconify';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import {
  createBasicQuestionnaire,
  getQuestionnaireById
} from '../../functions/QuestionnairePageFunctions';
import { loadQuestionnairesFromLocal } from '../../functions/LoadServerResourceFunctions';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';

interface Props {
  selectedItem: QuestionnaireListItem | undefined;
  source: 'local' | 'remote';
}

function CreateResponseButton(props: Props) {
  const { selectedItem, source } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);

  const [isLoading, setIsLoading] = useState(false);

  const endpointUrl =
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';

  async function handleClick() {
    if (!selectedItem) return;

    setIsLoading(true);

    let selectedQuestionnaire = createBasicQuestionnaire();

    if (fhirClient) {
      selectedQuestionnaire = await getQuestionnaireById(endpointUrl, selectedItem.id);
    } else {
      const questionnaires = loadQuestionnairesFromLocal();
      selectedQuestionnaire =
        questionnaires.find((q) => q.id === selectedItem.id) ?? selectedQuestionnaire;
    }

    // Assign questionnaire to questionnaire provider
    await questionnaireProvider.setQuestionnaire(
      selectedQuestionnaire,
      source === 'local',
      fhirClient
    );

    // Assign questionnaireResponse to questionnaireResponse provider
    if (selectedQuestionnaire.item && selectedQuestionnaire.item.length > 0) {
      questionnaireResponseProvider.setQuestionnaireResponse(
        createQuestionnaireResponse(selectedQuestionnaire.id, selectedQuestionnaire.item[0])
      );
    }

    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedItem}
      endIcon={
        isLoading ? (
          <WhiteCircularProgress size={20} />
        ) : (
          <Iconify icon="material-symbols:arrow-right-alt" />
        )
      }
      onClick={handleClick}>
      Create response
    </Button>
  );
}

export default CreateResponseButton;
