import { QuestionnaireResponse } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export async function saveQuestionnaireResponse(
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
