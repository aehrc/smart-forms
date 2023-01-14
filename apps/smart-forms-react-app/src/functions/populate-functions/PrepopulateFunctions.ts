import {
  Bundle,
  Parameters,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import populate, { isPopulateInputParameters } from 'sdc-populate';
import { getXFhirQueryVariables } from './VariablePopulateFunctions';
import { getBatchResponseFromPrePopQuery, getPrePopQuery } from './PrePopQueryPopulateFunctions';

/**
 * Pre-populate questionnaire from CMS patient data to form a populated questionnaireReponse
 *
 * @author Sean Fong
 */
export async function populateQuestionnaire(
  client: Client,
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner,
  populateForm: {
    (questionnaireResponse: QuestionnaireResponse, batchResponse: Bundle): void;
  },
  exitSpinner: { (): void }
) {
  const prePopQuery = getPrePopQuery(questionnaire);
  const variables = getXFhirQueryVariables(questionnaire);

  if (!(variables && prePopQuery)) {
    exitSpinner();
    return;
  }

  // Retrieve a batch response containing the CMS data to be populated
  const batchResponse = await getBatchResponseFromPrePopQuery(client, patient, prePopQuery);

  // Define and check parameters which satisfies the inputParameters of the populate function
  const inputParameters = definePopulationParameters(questionnaire, patient, batchResponse);

  // Perform population if parameters satisfies input parameters
  if (isPopulateInputParameters(inputParameters)) {
    const outputParameters = populate(inputParameters);
    const questionnaireResponse = outputParameters.parameter[0].resource;

    if (outputParameters.parameter[1]) {
      console.error(outputParameters.parameter[1].resource);
    }
    populateForm(questionnaireResponse, batchResponse);
  } else {
    exitSpinner();
  }
}

/**
 * Perform batch query request to CMS FHIR API server to obtain patient data bundle
 *
 * @author Sean Fong
 */
export function getBatchResponse(client: Client, bundle: Bundle): Promise<Bundle> {
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
export function definePopulationParameters(
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
