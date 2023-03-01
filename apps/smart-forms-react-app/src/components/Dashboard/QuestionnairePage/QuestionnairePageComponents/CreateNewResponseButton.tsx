// @mui
import { Button, CircularProgress } from '@mui/material';
import React, { useContext, useState } from 'react';
import { SelectedQuestionnaire } from '../../../../interfaces/Interfaces';
import Iconify from '../../../Misc/Iconify';
import {
  QuestionnaireProviderContext,
  QuestionnaireResponseProviderContext
} from '../../../../App';
import { createQuestionnaireResponse } from '../../../../functions/QrItemFunctions';
import { useNavigate } from 'react-router-dom';

interface Props {
  selectedQuestionnaire: SelectedQuestionnaire | null;
}

function CreateNewResponseButton(props: Props) {
  const { selectedQuestionnaire } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!selectedQuestionnaire) return;

    setIsLoading(true);

    // Assign questionnaire to questionnaire provider
    const questionnaireResource = selectedQuestionnaire.resource;
    await questionnaireProvider.setQuestionnaire(questionnaireResource);

    // Assign questionnaireResponse to questionnaireResponse provider
    if (questionnaireResource.item && questionnaireResource.item.length > 0) {
      questionnaireResponseProvider.setQuestionnaireResponse(
        createQuestionnaireResponse(questionnaireResource.id, questionnaireResource.item[0])
      );
    }
    navigate('/renderer');

    setIsLoading(false);
  }

  return (
    <Button
      variant="contained"
      disabled={!selectedQuestionnaire?.listItem}
      endIcon={
        isLoading ? (
          <CircularProgress size={20} sx={{ color: 'common.white' }} />
        ) : (
          <Iconify icon="ant-design:form-outlined" />
        )
      }
      sx={{
        px: 2.5,
        backgroundColor: 'secondary.main',
        '&:hover': {
          backgroundColor: 'secondary.dark'
        }
      }}
      data-test="button-create-response"
      onClick={handleClick}>
      Create response
    </Button>
  );
}

export default CreateNewResponseButton;
