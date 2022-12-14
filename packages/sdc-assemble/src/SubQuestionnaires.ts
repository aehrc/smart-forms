import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
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

export function fetchSubquestionnaires(
  canonicalUrls: string[],
  assembleSubquestionnaires: { (questionnaires: Questionnaire[]): void },
  outputError: { (error: OperationOutcome): void }
) {
  const promises = [];
  for (const canonicalUrl of canonicalUrls) {
    promises.push(fetchSingleQuestionnaire(canonicalUrl));
  }

  Promise.all(promises).then((resources: Awaited<FhirResource>[]) => {
    const subquestionnaires = [];
    for (const resource of resources) {
      if (resource.resourceType === 'Questionnaire') {
        subquestionnaires.push(resource);
      } else {
        if (resource.resourceType === 'OperationOutcome') {
          outputError(resource);
        }
        outputError(createInvalidSubquestionnairesOutcome());
      }
    }

    // Proceed to assemble questionnaires if no errors occur
    assembleSubquestionnaires(subquestionnaires);
  });
}

async function fetchSingleQuestionnaire(canoncialUrl: string): Promise<Questionnaire> {
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
