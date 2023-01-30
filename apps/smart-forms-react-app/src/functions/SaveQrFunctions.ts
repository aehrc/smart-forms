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

import {
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { constructName } from './LaunchContextFunctions';
import dayjs from 'dayjs';
import { qrToHTML } from './PreviewFunctions';
import { isHidden } from './QItemFunctions';
import { EnableWhenContextType } from '../interfaces/ContextTypes';

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export function saveQuestionnaireResponse(
  client: Client,
  patient: Patient,
  user: Practitioner,
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Promise<QuestionnaireResponse> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  let requestUrl = 'QuestionnaireResponse';
  let method = 'POST';
  let questionnaireResponseToSave: QuestionnaireResponse = { ...questionnaireResponse };

  if (questionnaireResponse.id) {
    requestUrl += '/' + questionnaireResponse.id;
    method = 'PUT';
  } else {
    questionnaireResponseToSave = {
      ...questionnaireResponse,
      text: {
        status: 'generated',
        div: qrToHTML(questionnaire, questionnaireResponse)
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
  }

  return client.request({
    url: requestUrl,
    method: method,
    body: JSON.stringify(questionnaireResponseToSave),
    headers: headers
  });
}

export function removeHiddenAnswers(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  enableWhenContext: EnableWhenContextType,
  enableWhenChecksEnabled: boolean
): QuestionnaireResponse {
  const questionnaireItem = questionnaire.item;
  const questionnaireResponseItem = questionnaireResponse.item;
  if (
    !questionnaireItem ||
    questionnaireItem.length === 0 ||
    !questionnaireResponseItem ||
    questionnaireResponseItem.length === 0
  ) {
    return questionnaireResponse;
  }

  questionnaireResponseItem.forEach((qrItem, i) => {
    const qItem = questionnaireItem[i];
    const newQrForm = readQuestionnaireResponseItem(
      qItem,
      qrItem,
      enableWhenContext,
      enableWhenChecksEnabled
    );
    if (newQrForm && questionnaireResponse.item) {
      questionnaireResponse.item[i] = { ...newQrForm };
    }
  });

  return questionnaireResponse;
}

function readQuestionnaireResponseItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  enableWhenContext: EnableWhenContextType,
  enableWhenChecksEnabled: boolean
): QuestionnaireResponseItem | null {
  const qItems = qItem.item;
  if (qItems && qItems.length > 0) {
    if (isHidden(qItem, enableWhenContext, enableWhenChecksEnabled)) return null;

    const qrItems = qrItem.item;
    const qrAnswerItems = qrItem.answer;
    if (qrItems && qrItems.length > 0) {
      const newQrItems: QuestionnaireResponseItem[] = [];
      for (let i = 0, j = 0; i < qItems.length; i++) {
        if (qrItems[j] && qItems[i].linkId === qrItems[j].linkId) {
          const newQrItem = readQuestionnaireResponseItem(
            qItems[i],
            qrItems[j],
            enableWhenContext,
            enableWhenChecksEnabled
          );
          if (newQrItem) {
            newQrItems.push(newQrItem);
          }
          j++;
        }
      }
      return { ...qrItem, item: newQrItems };
    } else if (qrAnswerItems && qrAnswerItems.length > 0 && qrAnswerItems[0].item) {
      const newQrAnswers: QuestionnaireResponseItemAnswer[] = [];
      for (let a = 0; a < qrAnswerItems.length; a++) {
        const repeatAnswer = qrAnswerItems[a];
        const newRepeatAnswerItems: QuestionnaireResponseItem[] = [];

        if (repeatAnswer && repeatAnswer.item && repeatAnswer.item.length > 0) {
          for (let i = 0, j = 0; i < qItems.length; i++) {
            if (repeatAnswer.item[j] && qItems[i].linkId === repeatAnswer.item[j].linkId) {
              const newQrItem = readQuestionnaireResponseItem(
                qItems[i],
                repeatAnswer.item[j],
                enableWhenContext,
                enableWhenChecksEnabled
              );
              if (newQrItem) {
                newRepeatAnswerItems.push(newQrItem);
              }
              j++;
            }
          }
        }

        newQrAnswers.push({ ...repeatAnswer, item: newRepeatAnswerItems });
      }
      return { ...qrItem, answer: newQrAnswers };
    }
    return qrItem;
  }

  return isHidden(qItem, enableWhenContext, enableWhenChecksEnabled) ? null : { ...qrItem };
}
