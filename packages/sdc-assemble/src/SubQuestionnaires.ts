import type { FhirResource, Questionnaire } from 'fhir/r5';
import { client } from 'fhirclient';
import { createInvalidSubquestionnairesOutcome } from './CreateOutcomes';

export function getCanonicalUrls(masterQuestionnaire: Questionnaire): string[] | null {
  if (
    !masterQuestionnaire.item ||
    !masterQuestionnaire.item[0] ||
    !masterQuestionnaire.item[0].item
  )
    return null;

  const subquestionnaireCanonicals = [];

  for (const item of masterQuestionnaire.item[0].item) {
    if (!item.extension || !item.extension[0] || !item.extension[0].valueCanonical) return null;

    subquestionnaireCanonicals.push(item.extension[0].valueCanonical);
  }
  return subquestionnaireCanonicals;
}

export async function fetchSubquestionnaires(canonicalUrls: string[]) {
  // Gather all promises to be executed at once
  const promises = [];
  for (const canonicalUrl of canonicalUrls) {
    promises.push(fetchSingleQuestionnaire(canonicalUrl));
  }

  const resources = await Promise.all(promises);

  const subquestionnaires = [];
  for (const resource of resources) {
    if (resource.resourceType !== 'Questionnaire') {
      return resource.resourceType === 'OperationOutcome'
        ? resource
        : createInvalidSubquestionnairesOutcome();
    } else {
      subquestionnaires.push(resource);
    }
  }

  return subquestionnaires;
}

async function fetchSingleQuestionnaire(canoncialUrl: string): Promise<FhirResource> {
  // TODO temporarily specify form server url
  const serverUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(serverUrl).request({
    url: `Questionnaire?url=${canoncialUrl}`,
    method: 'GET',
    headers: headers
  });
}
