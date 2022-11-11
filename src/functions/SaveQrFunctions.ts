import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { constructName } from './LaunchContextFunctions';
import dayjs from 'dayjs';

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export async function saveQuestionnaireResponse(
  client: Client,
  patient: Patient,
  user: Practitioner,
  questionnaireResponse: QuestionnaireResponse
) {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  let requestUrl = 'QuestionnaireResponse';
  let method = 'POST';
  let questionnaireResponseBody = { ...questionnaireResponse };

  if (questionnaireResponse.id) {
    requestUrl += '/' + questionnaireResponse.id;
    method = 'PUT';
  } else {
    questionnaireResponseBody = {
      ...questionnaireResponse,
      subject: {
        reference: `Patient/${patient.id}`,
        type: 'Patient',
        display: constructName(patient.name)
      },
      author: {
        reference: `Practitioner/${user.id}`,
        type: 'Practitioner',
        display: constructName(user.name)
      },
      authored: dayjs().format()
    };
  }

  return client.request({
    url: requestUrl,
    method: method,
    body: JSON.stringify(questionnaireResponseBody),
    headers: headers
  });
}

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export async function updateExistingQuestionnaireResponse(
  client: Client,
  questionnaireResponse: QuestionnaireResponse
) {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  return client.request({
    url: 'QuestionnaireResponse',
    method: 'POST',
    body: JSON.stringify(questionnaireResponse),
    headers: headers
  });
}
