import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient } from './functions/LaunchFunctions';
import { Patient, QuestionnaireResponse } from 'fhir/r5';
import FhirClient from '../FhirClient';
import { QuestionnaireService } from './QuestionnaireService';

function QPage() {
  const questionnaire = new QuestionnaireService();

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: questionnaire.item[0].linkId,
        text: questionnaire.item[0].text,
        item: []
      }
    ]
  });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        const fhirClient = new FhirClient(client);
        getPatient(client)
          .then((patient) => {
            setPatient(patient);

            // obtain questionnaireResponse for prepopulation
            fhirClient.populate(questionnaire, patient, (qResponse) => {
              setQuestionnaireResponse(qResponse);
              setLoading(false);
            });

            // TODO do calculations and enablewhen
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const renderQPage = loading ? (
    <ProgressSpinner message={'Loading questionnaire form'} />
  ) : (
    <QForm questionnaire={questionnaire} qrResponse={questionnaireResponse} />
  );

  return (
    <div>
      <NavBar patient={patient} />
      {renderQPage}
    </div>
  );
}

export default QPage;
