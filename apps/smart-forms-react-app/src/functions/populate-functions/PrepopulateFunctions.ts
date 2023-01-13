import {
  Bundle,
  FhirResource,
  Parameters,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import populate, { isPopulateInputParameters } from 'sdc-populate';
import { getXFhirQueryVariables } from './PopulateXFhirQueryFunctions';

/**
 * Prepopulate form from CMS patient data
 *
 * @author Sean Fong
 */
export function populateQuestionnaire(
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

  const xFhirQueryVariables = getXFhirQueryVariables(questionnaire);

  let prePopQueryBundle = getPrePopQueryBundle(questionnaire.contained);
  if (!prePopQueryBundle) {
    exitSpinner();
    return;
  }

  // replace all instances of patientId placeholder with patient id
  prePopQueryBundle = replacePatientIdInstances(prePopQueryBundle, patient);

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
 * Replace patientId variable instances in questionnaire with CMS Patient ID
 *
 * @author Sean Fong
 */
function replacePatientIdInstances(batchQuery: Bundle, patient: Patient): Bundle {
  // console.log(batchQuery);
  if (batchQuery.entry) {
    batchQuery.entry.forEach((entry) => {
      if (entry.request && patient.id)
        entry.request.url = entry.request.url.replace('{{%patient.id}}', patient.id);
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
            name: 'name',
            valueString: 'LaunchPatient'
          },
          {
            name: 'content',
            resource: patient
          }
        ]
      },
      {
        name: 'context',
        part: [
          {
            name: 'name',
            valueString: 'PrePopQuery'
          },
          {
            name: 'content',
            resource: batchResponse
          }
        ]
      }
    ]
  };
}

/**
 * Attempt population request to obtain populated questionnaireResponse
 *
 * @author Sean Fong
 */
function getPopulatedResponse(parameters: Parameters): QuestionnaireResponse | null {
  if (isPopulateInputParameters(parameters)) {
    const outputPopParams = populate(parameters);
    return outputPopParams.parameter[0].resource;
  }

  return null;
}
