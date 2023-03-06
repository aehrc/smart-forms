import SaveIcon from '@mui/icons-material/Save';
import React, { useContext, useEffect, useState } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { RendererContext } from '../RendererLayout';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { OperationItem } from './RendererOperationSection';
import { useSnackbar } from 'notistack';

function RendererSaveAsDraft() {
  const { fhirClient, patient, user } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const { response, hasChanges } = renderer;

  const { enqueueSnackbar } = useSnackbar();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, [response]);

  return (
    <OperationItem
      title={'Save as Draft'}
      icon={<SaveIcon />}
      disabled={!hasChanges || !fhirClient || isUpdating}
      onClick={() => {
        if (!(fhirClient && patient && user)) return;

        let responseToSave = JSON.parse(JSON.stringify(response));
        responseToSave = removeHiddenAnswers(
          questionnaireProvider.questionnaire,
          responseToSave,
          enableWhenContext
        );

        responseToSave.status = 'in-progress';
        saveQuestionnaireResponse(
          fhirClient,
          patient,
          user,
          questionnaireProvider.questionnaire,
          responseToSave
        )
          .then((savedResponse) => {
            responseProvider.setQuestionnaireResponse(savedResponse);
            setRenderer({ response: savedResponse, hasChanges: false });
            enqueueSnackbar('Response saved as draft', { variant: 'success' });
          })
          .catch((error) => {
            console.error(error);
            enqueueSnackbar('An error occurred while saving. Try again later.', {
              variant: 'error'
            });
          });
      }}
    />
  );
}

export default RendererSaveAsDraft;
