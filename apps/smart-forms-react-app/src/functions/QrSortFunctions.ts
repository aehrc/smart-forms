import { QuestionnaireResponse } from 'fhir/r5';

export function sortByQuestionnaireName(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const qNameA = a.item?.[0].text;
    const qNameB = b.item?.[0].text;

    if (!qNameA || !qNameB) return 0;
    if (qNameA < qNameB) return -1;
    if (qNameA > qNameB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByAuthorName(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const authorNameA = a.author?.display;
    const authorNameB = b.author?.display;

    if (!authorNameA || !authorNameB) return 0;
    if (authorNameA < authorNameB) return -1;
    if (authorNameA > authorNameB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByLastUpdated(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const lastUpdatedA = a.meta?.lastUpdated;
    const lastUpdatedB = b.meta?.lastUpdated;

    if (!lastUpdatedA || !lastUpdatedB) return 0;
    if (lastUpdatedA < lastUpdatedB) return -1;
    if (lastUpdatedA > lastUpdatedB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByStatus(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const lastUpdatedA = a.status;
    const lastUpdatedB = b.status;

    if (lastUpdatedA < lastUpdatedB) return -1;
    if (lastUpdatedA > lastUpdatedB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}
