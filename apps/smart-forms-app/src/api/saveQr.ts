/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import { constructName } from '../features/smartAppLaunch/utils/launchContext.ts';
import dayjs from 'dayjs';
import { qrToHTML } from '../features/preview/utils/preview.ts';
import { fetchQuestionnaireById } from './client.ts';
import { HEADERS } from './headers.ts';
import { removeEmptyAnswersFromResponse } from '@aehrc/smart-forms-renderer';
import { produce } from 'immer';

/**
 * POST questionnaire to SMART Health IT when opening it to ensure response-saving can be performed
 * Due to SMART Health IT's restriction on response saving
 * No required for any other client
 *
 * @author Sean Fong
 */
export function postQuestionnaireToSMARTHealthIT(client: Client, questionnaire: Questionnaire) {
  fetchQuestionnaireById(client, questionnaire.id ?? '').catch(() => {
    client
      .request({
        url: `Questionnaire/${questionnaire.id}`,
        method: 'PUT',
        body: JSON.stringify(questionnaire),
        headers: HEADERS
      })
      .catch(() => {
        console.warn('Error: Failed to POST questionnaire to SMART Health IT');
      });
  });
}

export async function saveProgress(
  smartClient: Client,
  patient: Patient,
  user: Practitioner,
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  saveStatus: 'in-progress' | 'completed'
) {
  const responseToSave = removeEmptyAnswersFromResponse(questionnaire, questionnaireResponse);

  responseToSave.status = saveStatus;

  try {
    return await saveQuestionnaireResponse(
      smartClient,
      patient,
      user,
      questionnaire,
      responseToSave
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export async function saveQuestionnaireResponse(
  client: Client,
  patient: Patient,
  user: Practitioner,
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
) {
  const questionnaireResponseToSave = produce(questionnaireResponse, (draft) => {
    draft.meta = {
      ...draft.meta,
      source: 'https://smartforms.csiro.au'
    };

    draft.text = {
      status: 'generated',
      div: qrToHTML(questionnaire, draft)
    };

    draft.subject = {
      reference: `Patient/${patient.id}`,
      type: 'Patient',
      display: constructName(patient.name)
    };

    draft.author = {
      reference: `Practitioner/${user.id}`,
      type: 'Practitioner',
      display: constructName(user.name)
    };

    draft.authored = dayjs().format();
  });

  // TODO pre-pop should filter out all empty strings really

  const saveHeaders = { ...HEADERS, prefer: 'return=representation' };

  // QuestionnaireResponse has been saved before, do "PUT" request with the ID
  if (questionnaireResponseToSave.id) {
    return client.request({
      url: `QuestionnaireResponse/${questionnaireResponseToSave.id}`,
      method: 'PUT',
      body: JSON.stringify(questionnaireResponseToSave),
      headers: saveHeaders
    });
  }

  // QuestionnaireResponse has not been saved before, add questionnaire reference
  const updatedQuestionnaireResponseToSave = addQuestionnaireReference(
    questionnaire,
    questionnaireResponseToSave,
    client.state.serverUrl
  );

  return client.request({
    url: 'QuestionnaireResponse',
    method: 'POST',
    body: JSON.stringify(updatedQuestionnaireResponseToSave),
    headers: saveHeaders
  });
}

function addQuestionnaireReference(
  questionnaire: Questionnaire,
  questionnaireResponseToSave: QuestionnaireResponse,
  endpointUrl: string
): QuestionnaireResponse {
  return produce(questionnaireResponseToSave, (draft) => {
    if (endpointUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')) {
      // Plugging questionnaire.id in because SMART Health IT requires QRs to have Questionnaire/{id} as reference
      draft.questionnaire = questionnaire.id ? `Questionnaire/${questionnaire.id}` : '';
    }

    // Add questionnaire reference if it is not an empty string
    if (draft.questionnaire) {
      draft._questionnaire = {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/display',
            valueString: getQuestionnaireName(questionnaire)
          }
        ]
      };
    }
  });
}

function getQuestionnaireName(questionnaire: Questionnaire): string {
  if (questionnaire.title && questionnaire.title.length < 75) {
    return questionnaire.title;
  }

  if (questionnaire.name) {
    return questionnaire.name;
  }

  if (questionnaire.item && questionnaire.item.length > 0) {
    if (questionnaire.item[0].text) {
      return questionnaire.item[0].text;
    }
  }

  return questionnaire.id ? `Unnamed Questionnaire-${questionnaire.id}` : 'Unnamed Questionnaire';
}
