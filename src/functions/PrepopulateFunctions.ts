import { Bundle, Parameters, Patient, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';

/**
 * Prepopulate form from CMS patient data
 *
 * @author Sean Fong
 */
export function populate(
  client: Client,
  questionnaire: Questionnaire,
  patient: Patient,
  prepopulateForm: {
    (questionnaireResponse: QuestionnaireResponse, batchResponse: Bundle): void;
  }
) {
  if (questionnaire.contained && questionnaire.contained.length > 0) {
    let batchQuery: Bundle = questionnaire.contained[0] as Bundle;

    // replace all instances of launchPatientId placeholder with patient id
    batchQuery = replaceLaunchPatientIdInstances(batchQuery, patient);

    // perform batch query to CMS FHIR API
    const batchResponsePromise = batchQueryRequest(client, batchQuery);
    batchResponsePromise
      .then((batchResponse) => {
        // get questionnaireResponse from population parameters
        const parameters = definePopulationParameters(patient, batchResponse);
        const qrPromise = prepopulationQueryRequest(questionnaire, parameters);
        qrPromise
          .then((qResponse) => {
            // set questionnaireResponse in callback function
            prepopulateForm(qResponse, batchResponse);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  }
}

/**
 * Replace LaunchPatientId variable instances in questionnaire with CMS Patient ID
 *
 * @author Sean Fong
 */
function replaceLaunchPatientIdInstances(containedQuery: Bundle, patient: Patient): Bundle {
  if (containedQuery.entry) {
    containedQuery.entry.forEach((entry) => {
      if (entry.request && patient.id)
        entry.request.url = entry.request.url.replace('{{%LaunchPatient.id}}', patient.id);
    });
  }
  return containedQuery;
}

/**
 * Perform batch query request to CMS FHIR API server to obtain patient data bundle
 *
 * @author Sean Fong
 */
function batchQueryRequest(client: Client, bundle: Bundle): Promise<Bundle> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  return client.request({
    url: '',
    method: 'POST',
    body: JSON.stringify(bundle),
    headers: headers
  });
}

/**
 * Define prepopulation request parameters
 *
 * @author Sean Fong
 */
function definePopulationParameters(patient: Patient, batchResponse: Bundle): Parameters {
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

/**
 * Perform prepopulation query request to Telstra Forms server to obtain questionnaireResponse
 *
 * @author Sean Fong
 */
function prepopulationQueryRequest(
  questionnaire: Questionnaire,
  parameters: Parameters
): Promise<QuestionnaireResponse> {
  const serverUrl =
    process.env.REACT_APP_PREPOPULATE_SERVER_URL ?? 'https://sqlonfhir-r4.azurewebsites.net/fhir/';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };
  const operation = 'Questionnaire/' + questionnaire.id + '/$populate';

  return client(serverUrl).request({
    url: operation,
    method: 'POST',
    body: JSON.stringify(parameters),
    headers: headers
  });
}
