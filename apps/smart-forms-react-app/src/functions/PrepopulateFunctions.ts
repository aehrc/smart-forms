import {
  Bundle,
  FhirResource,
  Parameters,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import populate, { isPopulateInputParameters } from 'sdc-populate';

/**
 * Prepopulate form from CMS patient data
 *
 * @author Sean Fong
 */
export function prepopulate(
  client: Client,
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner,
  populateForm: {
    (questionnaireResponse: QuestionnaireResponse, batchResponse: Bundle): void;
  },
  exitSpinner: { (): void }
) {
  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    exitSpinner();
    return;
  }

  let prePopQueryBundle = getPrePopQueryBundle(questionnaire.contained);
  if (!prePopQueryBundle) {
    exitSpinner();
    return;
  }

  // replace all instances of launchPatientId placeholder with patient id
  prePopQueryBundle = replaceLaunchPatientIdInstances(prePopQueryBundle, patient);

  // perform batch query to CMS FHIR API
  const batchResponsePromise = batchQueryRequest(client, prePopQueryBundle);
  batchResponsePromise
    .then((batchResponse) => {
      const parameters = definePopulationParameters(questionnaire, patient, batchResponse);
      const populatedResponse = getPopulatedResponse(parameters);
      if (populatedResponse) {
        populateForm(populatedResponse, batchResponse);
      } else {
        exitSpinner();
      }
    })
    .catch((error) => {
      console.log(error);
      exitSpinner();
    });
}

/**
 * Get prepopulation query bundle from the questionnaire
 *
 * @author Sean Fong
 */
export function getPrePopQueryBundle(contained: FhirResource[]): Bundle | null {
  for (const entry of contained) {
    if (entry.resourceType === 'Bundle' && entry.id === 'PrePopQuery') {
      return entry as Bundle;
    }
  }

  return null;
}

/**
 * Replace LaunchPatientId variable instances in questionnaire with CMS Patient ID
 *
 * @author Sean Fong
 */
function replaceLaunchPatientIdInstances(batchQuery: Bundle, patient: Patient): Bundle {
  // console.log(batchQuery);
  if (batchQuery.entry) {
    batchQuery.entry.forEach((entry) => {
      if (entry.request && patient.id)
        entry.request.url = entry.request.url.replace('{{%LaunchPatient.id}}', patient.id);
    });
  }
  return { ...batchQuery };
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
function definePopulationParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  batchResponse: Bundle
): Parameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      },
      {
        name: 'subject',
        valueReference: {
          type: 'Patient',
          reference: 'Patient/' + patient.id
        }
      },
      {
        name: 'context',
        part: [
          {
            name: 'patient',
            resource: patient
          },
          {
            name: 'query',
            resource: batchResponse
          }
        ]
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
    process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://launch.smarthealthit.org/v/r4/fhir';

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

function getPopulatedResponse(parameters: Parameters): QuestionnaireResponse | null {
  if (isPopulateInputParameters(parameters)) {
    const outputPopParams = populate(parameters);
    return outputPopParams.parameter[0].resource;
  }

  return null;
}
