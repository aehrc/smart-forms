import SaveIcon from '@mui/icons-material/Save';
import React, { useContext } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { RendererContext } from '../Renderer/RendererLayout';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import { OperationItem } from '../Renderer/RendererNav/RendererOperationSection';

function SaveAsDraftOperation() {
  const { fhirClient, patient, user } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const { response, hasChanges } = renderer;

  return (
    <OperationItem
      title={'Save as Draft'}
      icon={<SaveIcon />}
      disabled={!hasChanges || !fhirClient}
      onClick={() => {
        if (!(fhirClient && patient && user)) return;

        let responseToSave = JSON.parse(JSON.stringify(response));
        responseToSave = removeHiddenAnswers(
          questionnaireProvider.questionnaire,
          responseToSave,
          enableWhenContext
        );

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
          })
          .catch((error) => console.error(error));
      }}
    />
  );
}

export default SaveAsDraftOperation;
