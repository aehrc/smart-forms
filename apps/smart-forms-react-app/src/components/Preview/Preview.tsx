import React from 'react';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';

function Preview() {
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);

  const questionnaire = questionnaireProvider.questionnaire;
  const qResponse = questionnaireResponseProvider.questionnaireResponse;

  const test = qrToHTML(questionnaire, qResponse);
  const parsed = parse(test);

  return <>{parsed}</>;
}

export default Preview;
