import type { Questionnaire } from 'fhir/r5';

export function constructMasterQuestionnaire(
  recipeQuestionnaire: Questionnaire
): Questionnaire | null {
  if (!recipeQuestionnaire.item || !recipeQuestionnaire.item[0]) return null;

  return {
    resourceType: 'Questionnaire',
    id: '715-Assembled',
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    },
    contained: [],
    extension: [],
    url: 'http://www.health.gov.au/assessments/mbs/715-Assembled',
    version: '0.1.0',
    name: 'AboriginalTorresStraitIslanderHealthCheckAssembled',
    title: 'Aboriginal and Torres Strait Islander Health Check (Assembled)',
    status: 'draft',
    experimental: true,
    subjectType: [],
    date: new Date().toISOString(),
    publisher: 'CSIRO',
    description:
      'Aboriginal and Torres Strait Islander Health Checks questionnaire formed from an assembled collection of sub-questionnaires. ',
    item: [
      {
        extension: recipeQuestionnaire['item'][0]['extension'],
        item: [],
        linkId: recipeQuestionnaire['item'][0]['linkId'],
        text: recipeQuestionnaire['item'][0]['text'],
        type: recipeQuestionnaire['item'][0]['type']
      }
    ]
  };
}
