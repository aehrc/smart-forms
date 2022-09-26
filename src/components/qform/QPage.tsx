import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient } from './functions/LaunchFunctions';
import { Expression, Patient, QuestionnaireResponse } from 'fhir/r5';
import FhirClient from '../FhirClient';
import { QuestionnaireProvider } from './QuestionnaireProvider';
import { createQuestionnaireResponse } from './functions/QrItemFunctions';

const questionnaireProvider = new QuestionnaireProvider();
questionnaireProvider.readCalculatedExpressions();
questionnaireProvider.readVariables();

export const CalculatedExpressionsContext = React.createContext<
  Record<string, { expression: string; value?: any }>
>({});
export const VariablesContext = React.createContext<Expression[]>([]);

function QPage() {
  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) return null;

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    createQuestionnaireResponse(questionnaire.item[0])
  );
  const [patient, setPatient] = useState<Patient | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: 'Retrieving patient'
  });

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        const fhirClient = new FhirClient(client);
        getPatient(client)
          .then((patient) => {
            setPatient(patient);
            setSpinner({ ...spinner, message: 'Loading questionnaire form' });

            // obtain questionnaireResponse for prepopulation
            fhirClient.populate(questionnaire, patient, (qResponse) => {
              setQuestionnaireResponse(qResponse);
              setSpinner({ ...spinner, isLoading: false });
            });

            // TODO do calculations and enablewhen
          })
          .catch((error) => {
            console.error(error);
            setSpinner({ ...spinner, isLoading: false });
          });
      })
      .catch((error) => {
        console.error(error);
        setSpinner({ ...spinner, isLoading: false });
      });
  }, []);

  const renderQPage = spinner.isLoading ? (
    <ProgressSpinner message={spinner.message} />
  ) : (
    <CalculatedExpressionsContext.Provider value={questionnaireProvider.calculatedExpressions}>
      <VariablesContext.Provider value={questionnaireProvider.variables}>
        <QForm questionnaire={questionnaire} qrResponse={questionnaireResponse} />
      </VariablesContext.Provider>
    </CalculatedExpressionsContext.Provider>
  );

  return (
    <div>
      <NavBar patient={patient} />
      {renderQPage}
    </div>
  );
}

export default QPage;
