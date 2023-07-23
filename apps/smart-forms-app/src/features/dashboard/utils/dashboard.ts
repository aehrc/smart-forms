/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as FHIR from 'fhirclient';
import type {
  Bundle,
  BundleEntry,
  FhirResource,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import randomColor from 'randomcolor';
import dayjs from 'dayjs';
import { getQuestionnaireNameFromResponse } from '../../renderer/utils/itemControl.ts';
import type Client from 'fhirclient/lib/Client';
import type { QuestionnaireListItem, ResponseListItem } from '../types/list.interface.ts';
import { HEADERS } from '../../../api/headers.ts';

const endpointUrl = import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

export function getFormsServerBundlePromise(queryUrl: string): Promise<Bundle> {
  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: HEADERS
  });
}

export function getFormsServerAssembledBundlePromise(queryUrl: string): Promise<Bundle> {
  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: HEADERS
  });
}

export function getClientBundlePromise(client: Client, queryUrl: string): Promise<Bundle> {
  return client.request({
    url: queryUrl,
    headers: HEADERS
  });
}

export function getFormsServerBundleOrQuestionnairePromise(
  queryUrl: string
): Promise<Bundle | Questionnaire> {
  queryUrl = queryUrl.replace('|', '&version=');

  // Remove trailing "-SMARTcopy" if it exists
  if (queryUrl.endsWith('-SMARTcopy')) {
    queryUrl = queryUrl.substring(0, queryUrl.lastIndexOf('-SMARTcopy')) + '';
  }

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    headers: HEADERS
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
      const questionnaireTitle = questionnaire.title
        ? questionnaire.title.charAt(0).toUpperCase() + questionnaire.title.slice(1)
        : 'Untitled';

      const questionnairePublisher = questionnaire.publisher
        ? questionnaire.publisher.charAt(0).toUpperCase() + questionnaire.publisher.slice(1)
        : '-';

      const questionnaireListItem: QuestionnaireListItem = {
        id: questionnaire.id ?? i.toString(),
        title: questionnaireTitle,
        avatarColor: randomColor({ luminosity: 'dark', seed: questionnaireTitle + i.toString() }),
        publisher: questionnairePublisher,
        date: questionnaire.date ? dayjs(questionnaire.date).toDate() : null,
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
        authored: response.authored ? dayjs(response.authored).toDate() : null,
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

export function constructBundle(resources: FhirResource[]): Bundle {
  const bundleEntries: BundleEntry[] = resources.map((resource) => {
    return {
      resource: resource
    };
  });

  return {
    entry: bundleEntries,
    resourceType: 'Bundle',
    type: 'collection'
  };
}
