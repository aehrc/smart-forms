import type { Bundle, OperationOutcome, Questionnaire } from 'fhir/r5';
import { client } from 'fhirclient';
import { createOperationOutcome } from './CreateOutcomes';

export function getCanonicalUrls(
  parentQuestionnaire: Questionnaire,
  allCanonicals: string[]
): string[] | OperationOutcome {
  if (
    !parentQuestionnaire.item ||
    !parentQuestionnaire.item[0] ||
    !parentQuestionnaire.item[0].item
  )
    return createOperationOutcome('Master questionnaire does not have a valid item.');

  const subquestionnaireCanonicals = [];

  for (const item of parentQuestionnaire.item[0].item) {
    const extensions = item.extension;
    if (!extensions) continue;

    // Check if item has a subquestionnaire extension
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
        break;
      }
    }

    // Proceed to next item if subquestionnaire extension is not present
    if (!isSubquestionnaire) continue;

    // Check for duplicate canonicals to prevent a circular dependency situation
    if (allCanonicals.includes(subquestionnaireCanonicalUrl)) {
      return createOperationOutcome(
        parentQuestionnaire.id +
          ' contains a circular dependency on the questionnaire ' +
          subquestionnaireCanonicalUrl
      );
    }

    subquestionnaireCanonicals.push(subquestionnaireCanonicalUrl);
  }

  // Remove all subquestionnaire-items from master questionnaire
  // parentQuestionnaire.item[0].item = [];
  return subquestionnaireCanonicals;
}

export async function fetchSubquestionnaires(canonicalUrls: string[]) {
  // Gather all promises to be executed at once
  const promises = [];

  // Test on a single questionnaire
  if (canonicalUrls[0]) {
    promises.push(fetchQuestionnaireByCanonical(canonicalUrls[0]));
  }

  // Fetch all questionnaires
  // for (const canonicalUrl of canonicalUrls) {
  //   promises.push(fetchQuestionnaireByCanonical(canonicalUrl));
  // }

  const resources = await Promise.all(promises);

  const subquestionnaires = [];
  for (const [i, resource] of resources.entries()) {
    if (resource.resourceType === 'Bundle') {
      if (!resource.entry || !resource.entry[0]) {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }

      const subquestionnaire = resource.entry[0].resource;
      if (!subquestionnaire || subquestionnaire.resourceType !== 'Questionnaire') {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }
      subquestionnaires.push(subquestionnaire);
    } else {
      return resource.resourceType === 'OperationOutcome'
        ? resource
        : createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
    }
  }

  return subquestionnaires;
}

async function fetchQuestionnaireByCanonical(
  canonicalUrl: string
): Promise<Bundle | OperationOutcome> {
  // TODO temporarily specify form server url
  const serverUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  // FIXME version search i.e. "|0.1.0" doesnt work on SMART Health IT, remove version temporarily
  const canonicalUrlWithoutVersion = canonicalUrl.slice(0, -6);

  return client(serverUrl).request({
    url: `Questionnaire?url=${canonicalUrlWithoutVersion}`,
    method: 'GET',
    headers: headers
  });
}
