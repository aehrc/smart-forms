import React, { useContext } from 'react';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { removeHiddenAnswers } from '../../functions/SaveQrFunctions';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../QRenderer/Form';

function Preview() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  const questionnaire = questionnaireProvider.questionnaire;
  let qResponse = questionnaireResponseProvider.questionnaireResponse;
  qResponse = removeHiddenAnswers(
    questionnaire,
    qResponse,
    enableWhenContext,
    enableWhenChecksContext
  );
  const parsedHTML = parse(qrToHTML(questionnaire, qResponse));

  return <>{parsedHTML}</>;
}

export default Preview;
