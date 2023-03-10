// ----------------------------------------------------------------------

import { filter } from 'lodash';
import type {
  ListItem,
  ListItemWithIndex,
  QuestionnaireListItem,
  ResponseListItem
} from '../interfaces/Interfaces';
import * as FHIR from 'fhirclient';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import randomColor from 'randomcolor';
import dayjs from 'dayjs';
import { getQuestionnaireNameFromResponse } from './ItemControlFunctions';
import type Client from 'fhirclient/lib/Client';
import { headers } from './LoadServerResourceFunctions';

export function descendingComparator(
  a: ListItem,
  b: ListItem,
  orderBy: keyof QuestionnaireListItem | keyof ResponseListItem,
  listType: 'questionnaire' | 'response'
): number {
  if (listType === 'questionnaire') {
    orderBy = orderBy as keyof QuestionnaireListItem;
    a = a as QuestionnaireListItem;
    b = b as QuestionnaireListItem;
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  } else {
    orderBy = orderBy as keyof ResponseListItem;
    a = a as ResponseListItem;
    b = b as ResponseListItem;
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  }

  return 0;
}

export function getComparator(
  order: 'asc' | 'desc',
  orderBy: keyof QuestionnaireListItem | keyof ResponseListItem,
  listType: 'questionnaire' | 'response'
): (a: ListItem, b: ListItem) => number {
  return order === 'desc'
    ? (a: ListItem, b: ListItem) => descendingComparator(a, b, orderBy, listType)
    : (a: ListItem, b: ListItem) => -descendingComparator(a, b, orderBy, listType);
}

export function applySortFilter(
  array: ListItem[],
  comparator: (a: ListItem, b: ListItem) => number,
  source: 'local' | 'remote',
  query?: string
): ListItem[] {
  const stabilizedThis: ListItemWithIndex[] = array.map((el, index) => [index, el]);

  stabilizedThis.sort((a: ListItemWithIndex, b: ListItemWithIndex) => {
    const order = comparator(a[1], b[1]);
    if (order !== 0) {
      return order;
    }

    return a[0] - b[0];
  });

  // Perform client-side filtering only when source is local
  if (query && source === 'local') {
    return filter(array, (_item) => _item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

  return stabilizedThis.map((el) => el[1]);
}

export function getFormsServerBundlePromise(queryUrl: string): Promise<Bundle> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: headers
  });
}

export function getFormsServerAssembledBundlePromise(queryUrl: string): Promise<Bundle> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: headers
  });
}

export function getClientBundlePromise(fhirClient: Client, queryUrl: string): Promise<Bundle> {
  return fhirClient.request({
    url: queryUrl,
    headers: headers
  });
}

export function getFormsServerBundleOrQuestionnairePromise(
  queryUrl: string
): Promise<Bundle | Questionnaire> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  queryUrl = queryUrl.replace('|', '&version=');

  // Remove trailing "-SMARTcopy" if it exists
  if (queryUrl.endsWith('-SMARTcopy')) {
    queryUrl = queryUrl.substring(0, queryUrl.lastIndexOf('-SMARTcopy')) + '';
  }

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: headers
  });
}

export function getQuestionnaireListItems(bundle: Bundle | undefined): QuestionnaireListItem[] {
  if (!bundle || !bundle.entry || bundle.entry.length === 0) return [];

  return bundle.entry
    .filter((entry) => {
      if (entry.resource && entry.resource.resourceType === 'Questionnaire') {
        // filter questionnaires with extension of sdc-assemble-expectation
        const assembledExpectation = entry.resource.extension?.find(
          (extension) =>
            extension.url ===
            'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation'
        );
        return !assembledExpectation;
      }
      return false;
    })
    .map((entry, i) => {
      const questionnaire = entry.resource as Questionnaire; // non-questionnaire resources are filtered
      const questionnaireTitle = questionnaire.title ?? 'Untitled';

      const questionnaireListItem: QuestionnaireListItem = {
        id: questionnaire.id ?? i.toString(),
        title: questionnaireTitle,
        avatarColor: randomColor({ luminosity: 'dark', seed: questionnaireTitle + i.toString() }),
        publisher: questionnaire.publisher ?? '—',
        date: questionnaire.date ? dayjs(questionnaire.date).format() : '—',
        status: questionnaire.status
      };
      return questionnaireListItem;
    });
}

export function getResponseListItems(bundle: Bundle | undefined): ResponseListItem[] {
  if (!bundle || !bundle.entry || bundle.entry.length === 0) return [];

  return bundle.entry
    .filter((entry) => entry.resource && entry.resource.resourceType === 'QuestionnaireResponse')
    .map((entry, i) => {
      const response = entry.resource as QuestionnaireResponse; // non-questionnaire resources are filtered
      const responseTitle = getQuestionnaireNameFromResponse(response);

      const responseListItem: ResponseListItem = {
        id: response.id ?? i.toString(),
        title: responseTitle,
        avatarColor: randomColor({ luminosity: 'dark', seed: responseTitle + i.toString() }),
        author: response.author?.display ?? '—',
        authored: response.authored ?? dayjs(response.authored).format(),
        status: response.status
      };
      return responseListItem;
    });
}

export function getResponsesFromBundle(bundle: Bundle | undefined): QuestionnaireResponse[] {
  if (!bundle || !bundle.entry || bundle.entry.length === 0) return [];

  return bundle.entry
    .filter((entry) => entry.resource && entry.resource.resourceType === 'QuestionnaireResponse')
    .map((entry) => entry.resource as QuestionnaireResponse); // non-questionnaire response resources are filtered
}

export function getReferencedQuestionnaire(
  resource: Bundle | Questionnaire | undefined
): Questionnaire | null {
  if (!resource) return null;

  if (resource.resourceType === 'Bundle') {
    if (!resource.entry || resource.entry.length === 0) return null;

    // return the most recently updated questionnaire
    return resource.entry.filter(
      (entry) => entry.resource && entry.resource.resourceType === 'Questionnaire'
    )[0].resource as Questionnaire; // non-questionnaire resources are filtered
  } else {
    // resource is Questionnaire
    return resource;
  }
}
