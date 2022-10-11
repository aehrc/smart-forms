import { QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';

export async function saveQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  return client('http://localhost:8080/fhir/').request({
    url: 'QuestionnaireResponse',
    method: 'POST',
    body: JSON.stringify(questionnaireResponse),
    headers: headers
  });
}
