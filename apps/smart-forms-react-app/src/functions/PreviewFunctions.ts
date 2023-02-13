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
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

export function qrToHTML(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
) {
  if (!questionnaireResponse.item) return '';

  const title = `<div style="font-size:24px; font-weight: bold" data-test="response-questionnaire-title">${questionnaire.title}</div><hr />`;
  const qrForm = qrFormToHTML(questionnaireResponse.item[0]);

  return `<div>${title + qrForm}</div>`;
}

export function qrFormToHTML(questionnaireResponseForm: QuestionnaireResponseItem) {
  if (!questionnaireResponseForm.item) return null;

  let formInHTML = '';
  const qrItems = questionnaireResponseForm.item;
  for (let i = 0; i < qrItems.length; i++) {
    formInHTML = readQuestionnaireResponseItem(qrItems[i], qrItems[i + 1], formInHTML, 0);
  }

  return formInHTML;
}

function readQuestionnaireResponseItem(
  item: QuestionnaireResponseItem,
  nextItem: QuestionnaireResponseItem | undefined,
  formInHTML: string,
  nestedLevel: number
) {
  const items = item.item;
  if (items && items.length > 0) {
    // Render group
    formInHTML += renderGroupHeadingDiv(item, nestedLevel);
    for (let i = 0; i < items.length; i++) {
      formInHTML = readQuestionnaireResponseItem(
        items[i],
        items[i + 1],
        formInHTML,
        nestedLevel + 1
      );
    }
    formInHTML += renderGroupBottomMargin();
  } else {
    // Render item
    formInHTML += renderItemDiv(item, nestedLevel);
  }
  formInHTML += renderGeneralBottomMargin(nestedLevel, nextItem);

  return formInHTML;
}

function renderItemDiv(item: QuestionnaireResponseItem, nestedLevel: number) {
  if (!item.answer) return '';

  let qrItemAnswer = '';

  item.answer.forEach((answer) => {
    const answerValueInString = qrItemAnswerValueTypeSwitcher(answer);

    qrItemAnswer += `<div data-test="response-item-answer">${
      answerValueInString[0].toUpperCase() + answerValueInString.slice(1)
    }</div>`;
  });

  const qrItemRender = `<div style="flex:40%;" data-test="response-item-text">${item.text}</div>
                        <div style="flex: 10%;"></div>
                        <div style="flex: 50%;" >${qrItemAnswer}</div>`;

  return `<div style="margin-top: ${
    nestedLevel === 0 ? '20px' : '10px'
  }; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
}

function renderGroupHeadingDiv(item: QuestionnaireResponseItem, nestedLevel: number) {
  return `<div style="font-size: ${
    nestedLevel === 0 ? '18px' : '16px'
  }; font-weight: bold; margin-top: 15px" data-test="response-group-heading">${item.text}</div>`;
}

function qrItemAnswerValueTypeSwitcher(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) return `${answer.valueBoolean}`;
  else if (answer.valueDecimal !== undefined) return `${answer.valueDecimal}`;
  else if (answer.valueInteger !== undefined) return `${answer.valueInteger}`;
  else if (answer.valueDate) return `${answer.valueDate}`;
  else if (answer.valueDateTime) return `${answer.valueDateTime}`;
  else if (answer.valueTime) return `${answer.valueTime}`;
  else if (answer.valueString) return `${answer.valueString}`;
  else if (answer.valueCoding?.code) {
    const display = answer.valueCoding?.display;
    return display ? `${display}` : `${answer.valueCoding?.code}`;
  } else if (answer.valueQuantity) return `${answer.valueQuantity}`;
  return '';
}

function renderGroupBottomMargin() {
  return `<div style="margin-bottom: 30px;"></div>`;
}

function renderGeneralBottomMargin(
  nestedLevel: number,
  nextItem: QuestionnaireResponseItem | undefined
) {
  const smallMarginDiv = `<div style="margin: 20px 0 20px;"></div>`;
  const largeMarginDiv = `<div style="margin: 55px 0 20px;"></div>`;

  if (nestedLevel !== 0) return '';

  if (!nextItem) return smallMarginDiv;

  const items = nextItem.item;
  return items && items.length > 0 ? largeMarginDiv : smallMarginDiv;
}
