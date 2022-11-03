import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import React, { useEffect } from 'react';
import { oauth2 } from 'fhirclient';
import { FhirClientContext } from '../../custom-contexts/FhirClientContext';
import QRenderer from './QRenderer';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QAuth(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const fhirClientContext = React.useContext(FhirClientContext);

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        fhirClientContext.setFhirClient(client);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <QRenderer
      questionnaireProvider={questionnaireProvider}
      questionnaireResponseProvider={questionnaireResponseProvider}
    />
  );
}

export default QAuth;
