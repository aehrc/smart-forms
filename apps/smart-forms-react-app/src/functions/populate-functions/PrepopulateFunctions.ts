import {
  Bundle,
  Parameters,
  ParametersParameter,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import populate, { isPopulateInputParameters } from 'sdc-populate';
import {
  constructVariablesContextParameters,
  getXFhirQueryVariables
} from './VariablePopulateFunctions';
import {
  constructPrePopQueryContextParameters,
  getPrePopQuery
} from './PrePopQueryPopulateFunctions';

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
    (questionnaireResponse: QuestionnaireResponse): void;
  },
  exitSpinner: { (): void }
) {
  const prePopQuery = getPrePopQuery(questionnaire);
  const variables = getXFhirQueryVariables(questionnaire);

  if (!(prePopQuery || variables)) {
    exitSpinner();
    return;
  }

  // Define population input parameters from PrePopQuery and x-fhir-query variables
  const inputParameters = definePopulationParameters(questionnaire, patient);

  if (prePopQuery) {
    const prePopQueryContext = await constructPrePopQueryContextParameters(
      client,
      patient,
      prePopQuery
    );
    inputParameters.parameter?.push(prePopQueryContext);
  }

  if (variables) {
    const variablesContext = await constructVariablesContextParameters(client, patient, variables);
    inputParameters.parameter?.push(variablesContext);
  }

  // Perform population if parameters satisfies input parameters
  if (isPopulateInputParameters(inputParameters)) {
    const outputParameters = populate(inputParameters);
    const questionnaireResponse = outputParameters.parameter[0].resource;

    if (outputParameters.parameter[1]) {
      console.error(outputParameters.parameter[1].resource);
    }
    populateForm(questionnaireResponse);
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
 * Define population input parameters without any batch response contexts
 *
 * @author Sean Fong
 */
function definePopulationParameters(questionnaire: Questionnaire, patient: Patient): Parameters {
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
      }
    ]
  };
}

export function constructContextParameters(name: string, resource: Bundle): ParametersParameter {
  return {
    name: 'context',
    part: [
      {
        name: 'name',
        valueString: name
      },
      {
        name: 'content',
        resource: resource
      }
    ]
  };
}
