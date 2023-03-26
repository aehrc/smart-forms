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

import type {
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r5';
import type Client from 'fhirclient/lib/Client';
import { constructName } from './LaunchContextFunctions';
import dayjs from 'dayjs';
import { qrToHTML } from './PreviewFunctions';
import { isHidden } from './QItemFunctions';
import type { EnableWhenContextType } from '../interfaces/ContextTypes';
import { fetchQuestionnaireById, headers } from './LoadServerResourceFunctions';

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
        headers: headers
      })
      .catch(() => {
        console.warn('Error: Failed to POST questionnaire to SMART Health IT');
      });
  });
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
): Promise<QuestionnaireResponse> {
  let requestUrl = 'QuestionnaireResponse';
  let method = 'POST';
  let questionnaireResponseToSave: QuestionnaireResponse = JSON.parse(
    JSON.stringify(questionnaireResponse)
  );

  questionnaireResponseToSave = {
    ...questionnaireResponseToSave,
    text: {
      status: 'generated',
      div: qrToHTML(questionnaire, questionnaireResponseToSave)
    },
    subject: {
      reference: `Patient/${patient.id}`,
      type: 'Patient',
      display: constructName(patient.name)
    },
    author: {
      reference: `Practitioner/${user.id}`,
      type: 'Practitioner',
      display: constructName(user.name)
    },
    authored: dayjs().format()
  };

  // Add additional attributes depending on whether questionnaire has been saved before
  if (questionnaireResponseToSave.id) {
    requestUrl += '/' + questionnaireResponseToSave.id;
    method = 'PUT';
  } else {
    // Add questionnaire reference
    questionnaireResponseToSave = addQuestionnaireReference(
      questionnaire,
      questionnaireResponseToSave,
      client.state.serverUrl
    );
  }

  return client.request({
    url: requestUrl,
    method: method,
    body: JSON.stringify(questionnaireResponseToSave),
    headers: headers
  });
}

function addQuestionnaireReference(
  questionnaire: Questionnaire,
  questionnaireResponseToSave: QuestionnaireResponse,
  endpointUrl: string
): QuestionnaireResponse {
  let questionnaireReference: string;
  if (endpointUrl === 'https://launch.smarthealthit.org/v/r4/fhir') {
    // Plugging questionnaire.id in because SMART Health IT has these weird requirements for canonicals
    questionnaireReference = questionnaire.id ? `Questionnaire/${questionnaire.id}` : '';
  } else {
    questionnaireReference = questionnaire.url ?? '';
  }

  // Add questionnaire reference if it is not an empty string
  if (questionnaireReference) {
    questionnaireResponseToSave.questionnaire = questionnaireReference;
    questionnaireResponseToSave._questionnaire = {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/display',
          valueString: getQuestionnaireName(questionnaire)
        }
      ]
    };
  }

  return questionnaireResponseToSave;
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

/**
 * Recursively go through the questionnaireResponse and remove qrItems whose qItems are hidden in the form
 *
 * @author Sean Fong
 */
export function removeHiddenAnswers(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  enableWhenContext: EnableWhenContextType
): QuestionnaireResponse {
  const qFormItem = questionnaire.item;
  const qrFormItem = questionnaireResponse.item;
  if (!qFormItem || qFormItem.length === 0 || !qrFormItem || qrFormItem.length === 0) {
    return questionnaireResponse;
  }

  qrFormItem.forEach((qrItem, i) => {
    const qItem = qFormItem[i];
    const newQrForm = readQuestionnaireResponseItem(qItem, qrItem, enableWhenContext);
    if (newQrForm && questionnaireResponse.item) {
      questionnaireResponse.item[i] = { ...newQrForm };
    }
  });

  return questionnaireResponse;
}

function readQuestionnaireResponseItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  enableWhenContext: EnableWhenContextType
): QuestionnaireResponseItem | null {
  const qItems = qItem.item;
  const qrItems = qrItem.item;

  // Process group items
  if (qItems && qItems.length > 0) {
    // Return nothing if corresponding qItem is hidden
    if (isHidden(qItem, enableWhenContext)) return null;

    if (qrItems && qrItems.length > 0) {
      const newQrItems: QuestionnaireResponseItem[] = [];

      // Loop over qItems - but end loop if we either reach the end of qItems or qrItems
      // Under normal circumstances we will reach the end of both arrays together
      for (
        let qItemIndex = 0, qrItemIndex = 0;
        qItemIndex < qItems.length || qrItemIndex < qrItems.length;
        qItemIndex++
      ) {
        // Save qrItem if linkIds of current qItem and qrItem are the same
        if (qrItems[qrItemIndex] && qItems[qItemIndex].linkId === qrItems[qrItemIndex].linkId) {
          const newQrItem = readQuestionnaireResponseItem(
            qItems[qItemIndex],
            qrItems[qrItemIndex],
            enableWhenContext
          );

          if (newQrItem) {
            newQrItems.push(newQrItem);
          }

          // Decrement qItem index if the next qrItem is an answer from a repeatGroup
          // Essentially persisting the current qItem linked to be matched up with the next qrItem linkId
          if (
            qrItems.length !== qrItemIndex + 1 &&
            qrItems[qrItemIndex].linkId === qrItems[qrItemIndex + 1].linkId
          ) {
            qItemIndex--;
          }

          // Only Increment qrItem index whenever the current qrItem linkId matches up with the current qItem
          qrItemIndex++;
        }
      }
      return { ...qrItem, item: newQrItems };
    }

    // Also perform checking if answer exists
    return qrItem['answer'] ? qrItem : null;
  }

  // Process non-group items
  return isHidden(qItem, enableWhenContext) ? null : { ...qrItem };
}
