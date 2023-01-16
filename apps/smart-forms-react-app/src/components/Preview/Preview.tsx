import React from 'react';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { removeHiddenAnswers } from '../../functions/SaveQrFunctions';

function Preview() {
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);

  const questionnaire = questionnaireProvider.questionnaire;
  let qResponse = questionnaireResponseProvider.questionnaireResponse;
  qResponse = removeHiddenAnswers(questionnaire, qResponse);
  const parsedHTML = parse(qrToHTML(questionnaire, qResponse));

  return <>{parsedHTML}</>;
}

export default Preview;
