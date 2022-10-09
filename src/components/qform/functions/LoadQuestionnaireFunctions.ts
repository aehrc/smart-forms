import { Bundle, Questionnaire } from 'fhir/r5';
import { client } from 'fhirclient';

export async function loadQuestionnairesFromServer(): Promise<Bundle> {
  const serverUrl = 'http://localhost:8080/fhir/';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(serverUrl).request({
    url: 'Questionnaire',
    method: 'GET',
    headers: headers
  });
}

export function getQuestionnairesFromBundle(bundle: Bundle): Questionnaire[] {
  if (!bundle.entry) return [];

  const list = bundle.entry.reduce((mapping: Questionnaire[], entry, i) => {
    if (entry.resource?.resourceType === 'Questionnaire') {
      mapping[i] = entry.resource as unknown as Questionnaire;
    }
    return mapping;
  }, []);

  list.push(list[0]);

  return list;
}
