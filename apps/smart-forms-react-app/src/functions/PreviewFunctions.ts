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
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import dayjs from 'dayjs';
import moment from 'moment';

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
    formInHTML = readQuestionnaireResponseItem(
      i === 0 ? undefined : qrItems[i - 1],
      qrItems[i],
      qrItems[i + 1],
      formInHTML,
      0
    );
  }

  return formInHTML;
}

type RepeatGroupItemStatus = 'first' | 'last' | 'middle' | null;
function readQuestionnaireResponseItem(
  prevItem: QuestionnaireResponseItem | undefined,
  item: QuestionnaireResponseItem,
  nextItem: QuestionnaireResponseItem | undefined,
  formInHTML: string,
  nestedLevel: number
) {
  let repeatGroupItemStatus: RepeatGroupItemStatus = null;

  // determine if current item is repeat group item
  if (prevItem || nextItem) {
    if (item.linkId !== prevItem?.linkId && item.linkId === nextItem?.linkId) {
      repeatGroupItemStatus = 'first';
    } else if (item.linkId === prevItem?.linkId && item.linkId !== nextItem?.linkId) {
      repeatGroupItemStatus = 'last';
    } else if (item.linkId === prevItem?.linkId || item.linkId === nextItem?.linkId) {
      repeatGroupItemStatus = 'middle';
    }
  }

  const items = item.item;
  if (items && items.length > 0) {
    // Render group heading
    if (repeatGroupItemStatus === 'first') {
      formInHTML += renderGroupHeadingDiv(item, nestedLevel);
      formInHTML += renderRepeatGroupItemHeadingDiv();
    } else if (repeatGroupItemStatus === 'last') {
      formInHTML += '';
    } else if (repeatGroupItemStatus === 'middle') {
      formInHTML += renderRepeatGroupItemHeadingDiv();
    } else {
      formInHTML += renderGroupHeadingDiv(item, nestedLevel);
    }

    // do compare next object linkId
    for (let i = 0; i < items.length; i++) {
      formInHTML = readQuestionnaireResponseItem(
        i === 0 ? undefined : items[i - 1],
        items[i],
        items[i + 1],
        formInHTML,
        nestedLevel + 1
      );
    }
    formInHTML += renderGroupBottomMargin(repeatGroupItemStatus);
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
    if (answerValueInString === '') {
      qrItemAnswer +=
        '<div style="color: red;" data-test="response-item-answer">Undefined answer</div>';
    } else {
      qrItemAnswer += `<div data-test="response-item-answer">${
        answerValueInString[0].toUpperCase() + answerValueInString.slice(1)
      }</div>`;
    }
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
    nestedLevel === 0 ? '18px' : '15px'
  }; font-weight: bold; margin-top: 15px" data-test="response-group-heading">${item.text}</div>`;
}

function renderRepeatGroupItemHeadingDiv() {
  return `<div style="margin-top: 15px" />`;
}

function qrItemAnswerValueTypeSwitcher(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) return `${answer.valueBoolean}`;
  else if (answer.valueDecimal !== undefined) return `${answer.valueDecimal}`;
  else if (answer.valueInteger !== undefined) return `${answer.valueInteger}`;
  else if (answer.valueDate)
    return answer.valueDate ? dayjs(answer.valueDate).format('DD/MM/YYYY') : '';
  else if (answer.valueDateTime)
    return answer.valueDateTime
      ? moment(answer.valueDateTime, 'YYYY-MM-DDTHH:mm:ssZ').format('MMMM D, YYYY h:mm A')
      : '';
  else if (answer.valueTime) return `${answer.valueTime}`;
  else if (answer.valueString) return `${answer.valueString}`;
  else if (answer.valueCoding?.code) {
    const display = answer.valueCoding?.display;
    return display ? `${display}` : `${answer.valueCoding?.code}`;
  } else if (answer.valueQuantity) return `${answer.valueQuantity}`;
  return '';
}

function renderGroupBottomMargin(repeatGroupItemStatus: RepeatGroupItemStatus) {
  if (repeatGroupItemStatus === 'first' || repeatGroupItemStatus === 'middle') {
    return `<div style="height: 1px; width: 100%; background-color: #E5EAF2;margin-top: 15px;"></div>`;
  } else {
    return `<div style="margin-bottom: 30px;"></div>`;
  }
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
