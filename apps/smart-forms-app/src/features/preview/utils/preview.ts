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

import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import he from 'he';
import { parseFhirDateToDisplayDate } from '@aehrc/smart-forms-renderer';

export function qrToHTML(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): string {
  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) return '';

  let QrHtml = `<div style="font-size:20px; font-weight: bold">${questionnaire.title}</div><hr/>`;

  for (const topLevelQRItem of questionnaireResponse.item) {
    const topLevelQRItemHTML = qrItemToHTML(topLevelQRItem);
    if (topLevelQRItemHTML) {
      QrHtml += topLevelQRItemHTML;
    }
  }
  return `<div xmlns="http://www.w3.org/1999/xhtml">${QrHtml}</div>`;
}

export function qrItemToHTML(topLevelQRItem: QuestionnaireResponseItem) {
  let formInHTML = '';
  if (!topLevelQRItem.item) {
    return readQuestionnaireResponseItem(undefined, topLevelQRItem, undefined, formInHTML, 0);
  }

  const qrItems = topLevelQRItem.item;
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
    const answerValueInString = he.encode(qrItemAnswerValueTypeSwitcher(answer));
    if (answerValueInString === '') {
      qrItemAnswer += '<div style="color: red">Undefined answer</div>';
    } else {
      qrItemAnswer += `<div>${
        answerValueInString[0].toUpperCase() + answerValueInString.slice(1)
      }</div>`;
    }
  });

  const qrItemRender = `<div style="flex:40%">${item.text}</div><div style="flex: 10%"></div><div style="flex: 50%">${qrItemAnswer}</div>`;

  return `<div style="margin-top: ${
    nestedLevel === 0 ? '20px' : '10px'
  }; display: flex; flex-wrap: wrap">${qrItemRender}</div>`;
}

function renderGroupHeadingDiv(item: QuestionnaireResponseItem, nestedLevel: number) {
  const fontSize = nestedLevel === 0 ? '18px' : '15px';
  const headingText = he.encode(item.text ?? '');

  return `<div style="font-size: ${fontSize}; font-weight: bold; margin-top: 15px">${headingText}</div>`;
}

function renderRepeatGroupItemHeadingDiv() {
  return `<div style="margin-top: 15px" />`;
}

function qrItemAnswerValueTypeSwitcher(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) {
    return `${answer.valueBoolean}`;
  }

  if (answer.valueDecimal !== undefined) {
    return `${answer.valueDecimal}`;
  }

  if (answer.valueInteger !== undefined) {
    return `${answer.valueInteger}`;
  }

  if (answer.valueDate) {
    const { displayDate, dateParseFail } = parseFhirDateToDisplayDate(answer.valueDate);
    if (!dateParseFail) {
      return `${displayDate}`;
    }

    return `${answer.valueDate}`;
  }

  if (answer.valueDateTime) {
    // TODO date time item
    return `${answer.valueDateTime}`;
  }

  if (answer.valueTime) {
    return `${answer.valueTime}`;
  }

  if (answer.valueString) {
    return `${answer.valueString}`;
  }

  if (answer.valueCoding?.code) {
    return answer.valueCoding?.display ?? `${answer.valueCoding?.code}`;
  }

  if (answer.valueQuantity) {
    return `${answer.valueQuantity}`;
  }

  return '';
}

function renderGroupBottomMargin(repeatGroupItemStatus: RepeatGroupItemStatus) {
  if (repeatGroupItemStatus === 'first' || repeatGroupItemStatus === 'middle') {
    return `<div style="height: 1px; width: 100%; background-color: #E5EAF2;margin-top: 15px"></div>`;
  } else {
    return `<div style="margin-bottom: 30px;"></div>`;
  }
}

function renderGeneralBottomMargin(
  nestedLevel: number,
  nextItem: QuestionnaireResponseItem | undefined
) {
  const smallMarginDiv = `<div style="margin: 20px 0 20px"></div>`;
  const largeMarginDiv = `<div style="margin: 55px 0 20px"></div>`;

  if (nestedLevel !== 0) {
    return '';
  }

  if (!nextItem) {
    return smallMarginDiv;
  }

  const items = nextItem.item;
  return items && items.length > 0 ? largeMarginDiv : smallMarginDiv;
}
