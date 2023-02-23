// ----------------------------------------------------------------------

import { filter } from 'lodash';
import { QuestionnaireListItem, UserWithIndex } from '../interfaces/Interfaces';
import * as FHIR from 'fhirclient';
import { Bundle, Questionnaire } from 'fhir/r5';
import randomColor from 'randomcolor';
import dayjs from 'dayjs';

export function descendingComparator(
  a: QuestionnaireListItem,
  b: QuestionnaireListItem,
  orderBy: keyof QuestionnaireListItem
) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator(
  order: 'asc' | 'desc',
  orderBy: keyof QuestionnaireListItem
): (a: QuestionnaireListItem, b: QuestionnaireListItem) => number {
  return order === 'desc'
    ? (a: QuestionnaireListItem, b: QuestionnaireListItem) => descendingComparator(a, b, orderBy)
    : (a: QuestionnaireListItem, b: QuestionnaireListItem) => -descendingComparator(a, b, orderBy);
}

export function applySortFilter(
  array: QuestionnaireListItem[],
  comparator: (a: QuestionnaireListItem, b: QuestionnaireListItem) => number,
  query: string
): QuestionnaireListItem[] {
  const stabilizedThis: UserWithIndex[] = array.map((el, index) => [index, el]);

  stabilizedThis.sort((a: UserWithIndex, b: UserWithIndex) => {
    const order = comparator(a[1], b[1]);
    if (order !== 0) {
      return order;
    }

    return a[0] - b[0];
  });

  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

  return stabilizedThis.map((el) => el[1]);
}

export function getQuestionnairesPromise(endpointUrl: string, queryUrl: string): Promise<Bundle> {
  return FHIR.client({ serverUrl: endpointUrl }).request({
    url: queryUrl
  });
}

export function getQuestionnaireListItems(bundle: Bundle | undefined): QuestionnaireListItem[] {
  if (!bundle || !bundle.entry || bundle.entry.length === 0) return [];

  return bundle.entry
    .filter((entry) => entry.resource && entry.resource.resourceType === 'Questionnaire')
    .map((entry, i) => {
      const questionnaire = entry.resource as Questionnaire; // non-questionnaire resources are filtered
      const questionnaireListItem: QuestionnaireListItem = {
        id: questionnaire.id ?? i.toString(),
        name: questionnaire.title ?? 'Untitled',
        avatarColor: randomColor({ luminosity: 'dark' }),
        publisher: questionnaire.publisher ?? '—',
        date: questionnaire.date ? dayjs(questionnaire.date).format('LL') : '—',
        status: questionnaire.status
      };
      return questionnaireListItem;
    });
}
