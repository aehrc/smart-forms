import type { FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
import { client } from 'fhirclient';
import { createInvalidSubquestionnairesOutcome, createOperationOutcome } from './CreateOutcomes';

export function getCanonicalUrls(masterQuestionnaire: Questionnaire): string[] | OperationOutcome {
  if (
    !masterQuestionnaire.item ||
    !masterQuestionnaire.item[0] ||
    !masterQuestionnaire.item[0].item
  )
    return createOperationOutcome('Master questionnaire does not have a valid item.');

  const subquestionnaireCanonicals = [];

  for (const item of masterQuestionnaire.item[0].item) {
    const extensions = item.extension;
    if (!extensions || !extensions[0]) {
      return createOperationOutcome(
        item.text + 'is an invalid item. It does not have any extensions.'
      );
    }

    let isSubquestionnaire = false;
    let subquestionnaireCanonicalUrl = '';
    for (const extension of extensions) {
      extension.url;
      if (
        extension.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire' &&
        extension.valueCanonical
      ) {
        isSubquestionnaire = true;
        subquestionnaireCanonicalUrl = extension.valueCanonical;
      }
    }

    // Check if item is a subquestionnaire or not
    if (!isSubquestionnaire) {
      return createOperationOutcome(
        item.text +
          'is an invalid item. It does not have an extension that qualifies it to be a subquestionnaire.'
      );
    }

    subquestionnaireCanonicals.push(subquestionnaireCanonicalUrl);
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
