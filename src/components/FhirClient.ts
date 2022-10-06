import { Bundle, Patient, Questionnaire, Parameters, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';

export default class FhirClient {
  private fhirClient: Client;

  constructor(client: Client) {
    this.fhirClient = client;
  }

  populate(
    questionnaire: Questionnaire,
    patient: Patient,
    getPrepopulationData: {
      (questionnaireResponse: QuestionnaireResponse, batchResponse: Bundle): void;
    }
  ) {
    if (questionnaire.contained && questionnaire.contained.length > 0) {
      let batchQuery: Bundle = questionnaire.contained[0] as Bundle;

      // replace all instances of launchPatientId placeholder with patient id
      batchQuery = this.replaceLaunchPatientIdInstances(batchQuery, patient);

      // perform batch query to CMS FHIR API
      const batchResponsePromise = this.batchQueryRequest(batchQuery);
      batchResponsePromise
        .then((batchResponse) => {
          // get questionnaireResponse from population parameters
          const parameters = this.definePopulationParameters(patient, batchResponse);
          const qrPromise = this.questionnaireResponseQuery(questionnaire, parameters);
          qrPromise
            .then((qResponse) => {
              // set questionnaireResponse in callback function
              getPrepopulationData(qResponse, batchResponse);
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    }
  }

  private batchQueryRequest(bundle: Bundle): Promise<Bundle> {
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json+fhir; charset=UTF-8'
    };

    return this.fhirClient.request({
      url: '',
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: headers
    });
  }

  private replaceLaunchPatientIdInstances(containedQuery: Bundle, patient: Patient): Bundle {
    if (containedQuery.entry) {
      containedQuery.entry.forEach((entry) => {
        if (entry.request && patient.id)
          entry.request.url = entry.request.url.replace('{{%LaunchPatient.id}}', patient.id);
      });
    }
    return containedQuery;
  }

  private definePopulationParameters(patient: Patient, batchResponse: Bundle): Parameters {
    return {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'subject',
          valueReference: {
            reference: '',
            display: ''
          }
        },
        {
          name: 'LaunchPatient',
          resource: patient
        },
        {
          name: 'PrePopQuery',
          resource: batchResponse
        }
      ]
    };
  }

  private questionnaireResponseQuery(
    questionnaire: Questionnaire,
    parameters: Parameters
  ): Promise<QuestionnaireResponse> {
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json+fhir; charset=UTF-8',
      Accept: 'application/json+fhir; charset=utf-8'
    };
    const operation = 'Questionnaire/' + questionnaire.id + '/$populate';

    return client('https://sqlonfhir-r4.azurewebsites.net/fhir/').request({
      url: operation,
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: headers
    });
  }

  saveQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json+fhir; charset=UTF-8'
    };

    return this.fhirClient.request({
      url: 'QuestionnaireResponse',
      method: 'POST',
      body: JSON.stringify(questionnaireResponse),
      headers: headers
    });
  }
}
