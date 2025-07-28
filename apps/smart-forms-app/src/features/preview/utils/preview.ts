/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import he from 'he';
import {
  getQrItemsIndex,
  isSpecificItemControl,
  mapQItemsIndex,
  parseFhirDateTimeToDisplayDateTime,
  parseFhirDateToDisplayDate
} from '@aehrc/smart-forms-renderer';
import { structuredDataCapture } from 'fhir-sdc-helpers';

/**
 * Converts a FHIR Questionnaire and corresponding QuestionnaireResponse into styled XHTML using GitHub-flavored Markdown styles applied as inline styles.
 * GitHub-flavored Markdown styles lifted from https://github.com/sindresorhus/github-markdown-css/blob/main/github-markdown-light.css
 *
 * @param {Questionnaire} questionnaire - The FHIR Questionnaire resource, used for structure and display text.
 * @param {QuestionnaireResponse} questionnaireResponse - The response data to populate into the HTML.
 * @returns {string} An XHTML string containing the rendered questionnaire response in styled HTML format.
 */
export function qrToHTML(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): string {
  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !questionnaireResponse.item ||
    questionnaireResponse.item.length === 0
  ) {
    return '';
  }

  // Start with a base HTML <article> structure
  // Left styles inline for all HTML tags because the styles do not apply when used in a JS string variable
  let html = `<article style="color-scheme: light; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0; color: #1f2328; background-color: #ffffff; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji'; font-size: 16px; line-height: 1.5; word-wrap: break-word;">`;

  // Title as h1
  html += `<h1 style="margin-top: 0; margin-bottom: .67em; font-weight: 600; padding-bottom: .3em; font-size: 2em; border-bottom: 1px solid #d1d9e0b3;">
  ${he.encode(questionnaire.title ?? 'Questionnaire Response')}
  </h1>`;

  // Add Patient/Author/Authored block
  html += renderMetadataHtml(questionnaireResponse);

  const qItemsIndexMap = mapQItemsIndex(questionnaire);
  const topLevelQRItemsByIndex = getQrItemsIndex(
    questionnaire.item,
    questionnaireResponse.item ?? [],
    qItemsIndexMap
  );

  // Render all top-level items
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    const topLevelQRItemOrItems = topLevelQRItemsByIndex[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text,
      item: []
    };

    const isTabContainer = topLevelQItem
      ? isSpecificItemControl(topLevelQItem, 'tab-container')
      : false;
    const groupNestLevel = isTabContainer ? 0 : 1;
    html = renderItemHtmlRecursive(topLevelQItem, topLevelQRItemOrItems, groupNestLevel, html);
  }

  html += `</article>`;

  // Wrap in a div with XHTML namespace
  return `<div xmlns="http://www.w3.org/1999/xhtml">${html}</div>`;
}

/**
 * Renders metadata information from a QuestionnaireResponse into HTML.
 * This includes Patient, Author, and Date Authored information from subject.display, author.display, and authored fields.
 */
export function renderMetadataHtml(questionnaireResponse: QuestionnaireResponse): string {
  const lines: string[] = [];

  // Patient (subject.display)
  if (questionnaireResponse.subject) {
    const subjectDisplay = questionnaireResponse.subject.display;
    if (subjectDisplay) {
      lines.push(
        `<strong style="font-weight: 600;">Patient</strong>: ${he.encode(subjectDisplay)}`
      );
    }
  }

  // Author (author.display)
  if (questionnaireResponse.author) {
    const authorDisplay = questionnaireResponse.author.display;
    if (authorDisplay) {
      lines.push(`<strong style="font-weight: 600;">Author</strong>: ${he.encode(authorDisplay)}`);
    }
  }

  // Date Authored
  if (questionnaireResponse.authored) {
    const { displayDateTime, dateParseFail } = parseFhirDateTimeToDisplayDateTime(
      questionnaireResponse.authored
    );
    const authoredDisplay = !dateParseFail ? displayDateTime : questionnaireResponse.authored;

    lines.push(
      `<strong style="font-weight: 600;">Date Authored</strong>: ${he.encode(authoredDisplay)}`
    );
  }

  if (lines.length === 0) {
    return '';
  }

  return `<p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;">${lines.join('<br />')}</p>`;
}

/**
 * Recursively renders a QuestionnaireItem and its corresponding QuestionnaireResponseItem(s) into HTML,
 * including groups, answers, and nested items, using inline styles that match GitHub Markdown.
 *
 * @param {QuestionnaireItem} qItem - The Questionnaire item structure.
 * @param {QuestionnaireResponseItem | QuestionnaireResponseItem[] | null} qrItemOrItems - The matching response item(s).
 * @param {number} groupNestLevel - Nesting depth to determine heading levels.
 * @param {string} html - Current accumulated HTML output to append to.
 * @returns {string} Updated HTML string including the rendered item.
 */
function renderItemHtmlRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  groupNestLevel: number,
  html: string
): string {
  // Skip hidden items (and their children)
  if (structuredDataCapture.getHidden(qItem)) {
    return html;
  }

  // Render group heading if text exists
  const qrItemOrItemsIsSingleItem = !Array.isArray(qrItemOrItems) && qrItemOrItems !== null;
  const qrItemOrItemsIsNonEmptyArray = Array.isArray(qrItemOrItems) && qrItemOrItems.length > 0;
  if (qItem.type === 'group' && (qrItemOrItemsIsSingleItem || qrItemOrItemsIsNonEmptyArray)) {
    const groupHeading = getGroupHeading(qItem, groupNestLevel);
    html += groupHeading;
  }

  // If item.type=group, render children recursively
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // Map qrItemOrItems into an array of qrItems
    let childQRItems: QuestionnaireResponseItem[] = [];
    if (qrItemOrItems) {
      if (Array.isArray(qrItemOrItems)) {
        childQRItems = qrItemOrItems;
      } else {
        childQRItems = qrItemOrItems.item ?? [];
      }
    }

    // Process repeating group items separately - TODO
    if (qItem.type === 'group' && qItem.repeats && childQRItems.length > 0) {
      html += renderRepeatGroupHtml(qItem, childQRItems);
      return html;
    }

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQRItems, indexMap);

    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      html = renderItemHtmlRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        groupNestLevel + 1,
        html
      );
    }
  }

  // At this point qrItemOrItems should be a single qrItem
  if (Array.isArray(qrItemOrItems)) {
    return html;
  }

  // Render answers
  const qrItem = qrItemOrItems;
  if (qrItem?.answer && qrItem.answer.length > 0) {
    const label = he.encode(qrItem.text ?? '');

    if (qItem.repeats && qItem.type !== 'group') {
      // TODO Add margin below (later) when changing styles to inline
      html += `<div style="margin-bottom: 0.5em;"><strong style="font-weight: 600;">${label}</strong></div>`;
      html += `<ul style="margin-top:0;margin-bottom:1rem;font-weight:400;padding-left:2em;">`;
      for (const a of qrItem.answer) {
        html += `<li>${he.encode(answerToString(a))}</li>`;
      }
      html += `</ul>`;
    } else {
      html += qrItem.answer
        .map(
          (a) =>
            `<p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">${label}</strong><br/>${he.encode(answerToString(a))}</p>`
        )
        .join('');
    }
  }

  return html;
}

/**
 * Renders an inline-styled HTML heading tag (`<h2>` to `<h4>`) for a group QuestionnaireItem, based on its nesting level.
 *
 * @param {QuestionnaireItem} qItem - The group Questionnaire item to render.
 * @param {number} nestedLevel - The depth of the group in the item tree.
 * @returns {string} An HTML heading tag string or empty string if level is 0 or no text is present.
 */
function getGroupHeading(qItem: QuestionnaireItem, nestedLevel: number): string {
  // if item is tab-container, it will only have a nestedLevel of 0, hence do not render a heading
  // <h1> is really only reserved for the main title of the Questionnaire
  if (nestedLevel === 0) {
    return '';
  }

  if (!qItem.text) {
    return '';
  }

  const headingText = qItem.text;

  let headingTag: string;
  let inlineStyle = '';
  switch (nestedLevel) {
    case 1:
      headingTag = 'h2';
      inlineStyle =
        'margin-top:1.5rem;margin-bottom:1rem;font-weight:600;line-height:1.25;padding-bottom:.3em;font-size:1.5em;border-bottom:1px solid #d1d9e0b3;';
      break;
    case 2:
      headingTag = 'h3';
      inlineStyle =
        'margin-top:1.5rem;margin-bottom:1rem;font-weight:600;line-height:1.25;font-size:1.25em;';
      break;
    case 3:
    case 4:
    default:
      headingTag = 'h4';
      inlineStyle =
        'margin-top:1.5rem;margin-bottom:1rem;font-weight:600;line-height:1.25;font-size:1em;';
      break;
  }

  return `<${headingTag} style="${inlineStyle}">${he.encode(headingText)}</${headingTag}>`;
}

/**
 * Renders a repeated group of QuestionnaireResponseItems as an HTML table, applying GitHub-flavored Markdown inline styles.
 *
 * @param {QuestionnaireItem} qItem - The repeating group Questionnaire item with child items.
 * @param {QuestionnaireResponseItem[]} qrItems - Array of repeated response items for the group.
 * @returns {string} HTML string of the rendered table.
 */
function renderRepeatGroupHtml(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[]
): string {
  if (!Array.isArray(qrItems)) {
    return '';
  }

  // Table headers from child questions
  const headers =
    qItem.item
      ?.filter((child) => !structuredDataCapture.getHidden(child))
      .map((child) => he.encode(child.text ?? '')) ?? [];

  // Render headers
  let html = `<table style="margin-top:0;margin-bottom:1rem;font-weight:400;border-spacing:0;border-collapse:collapse;display:block;width:max-content;max-width:100%;overflow:auto;font-variant:tabular-nums;">`;
  html += `<thead><tr style="background-color:#f6f8fa;border-top:1px solid #d1d9e0b3;">`;

  for (const header of headers) {
    html += `<th style="padding:6px 13px;border:1px solid #d1d9e0;font-weight:600;">${header}</th>`;
  }
  html += `</tr></thead>`;

  // Render rows for each repeated item
  html += `<tbody>`;
  for (const qrItemInstance of qrItems) {
    const childQItems = qItem.item ?? [];
    const childQRItems = qrItemInstance.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQRItems, indexMap);

    html += `<tr style="background-color:#fff;border-top:1px solid #d1d9e0b3;">`;
    for (const [index, childQItem] of childQItems.entries()) {
      if (structuredDataCapture.getHidden(childQItem)) {
        continue;
      }

      const childQRItem = qrItemsByIndex[index];

      // Do not support repeat group nesting for now
      if (Array.isArray(childQRItem)) {
        html += `<td style="padding:6px 13px;border:1px solid #d1d9e0;" colspan="${childQRItem.length}">Nested repeat groups not supported in narrative</td>`;
        continue;
      }

      const answer = childQRItem?.answer?.[0];
      const value = answer ? answerToString(answer) : '';
      html += `<td style="padding:6px 13px;border:1px solid #d1d9e0;">${he.encode(value)}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;

  return html;
}

/**
 * Converts a QuestionnaireResponseItemAnswer into a displayable string value.
 *
 * @param {QuestionnaireResponseItemAnswer} answer - The answer object to convert.
 * @returns {string} A string representation of the answer value.
 */
function answerToString(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) {
    return answer.valueBoolean ? 'Yes' : 'No';
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

    // Fallback to raw valueDate if parsing fails
    return answer.valueDate;
  }

  if (answer.valueDateTime) {
    const { displayDateTime, dateParseFail } = parseFhirDateTimeToDisplayDateTime(
      answer.valueDateTime
    );

    if (!dateParseFail) {
      return `${displayDateTime}`;
    }

    // Fallback to raw valueDateTime if parsing fails
    return answer.valueDateTime;
  }

  if (answer.valueTime) {
    return answer.valueTime;
  }

  if (answer.valueString) {
    return answer.valueString;
  }

  if (answer.valueCoding?.display) {
    return answer.valueCoding.display;
  }

  if (answer.valueCoding?.code) {
    return answer.valueCoding.code;
  }

  if (answer.valueQuantity) {
    const quantity = answer.valueQuantity;
    return `${quantity.value ?? ''} ${quantity.unit ?? ''}`.trim();
  }

  return '';
}
