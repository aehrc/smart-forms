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

  // Start with a base HTML <div> structure (article/section are not in the FHIR-allowed XHTML subset)
  // Left styles inline for all HTML tags because the styles do not apply when used in a JS string variable
  let html = `<div style="color-scheme: light; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0; color: #1f2328; background-color: #ffffff; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji'; font-size: 16px; line-height: 1.5; word-wrap: break-word;">`;

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
  const openSections: number[] = [];
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
    html = renderItemHtmlRecursive(
      topLevelQItem,
      topLevelQRItemOrItems,
      groupNestLevel,
      openSections,
      html
    );
  }

  // Close any remaining open sections
  while (openSections.length > 0) {
    html += `</div>`;
    openSections.pop();
  }

  html += `</div>`;

  // Wrap in a div with XHTML namespace
  return `<div xmlns="http://www.w3.org/1999/xhtml">${html}</div>`;
}

/**
 * Handles opening and closing section-wrapper <div>s based on heading level transitions.
 * Closes sections that are deeper than the current level and opens a new section if needed.
 * Uses <div>, not <section>, because <section> is not in the FHIR-allowed XHTML subset.
 *
 * Example:
 *   let html = '';
 *   let openSections = [];
 *
 *   // Encounter a Level 2 heading (<h2>)
 *   html = handleSectionTransition(2, openSections, html);
 *   html += "{h2 content}";
 *   // html: "<div>{h2 content}"
 *
 *   // Next, encounter a Level 3 heading (<h3>)
 *   html = handleSectionTransition(3, openSections, html);
 *   html += "{h3 content}";
 *   // html: "<div>{h2 content}<div>{h3 content}"
 *
 *   // Next, another Level 2 heading (<h2> again => must close h3 and h2 sections first)
 *   html = handleSectionTransition(2, openSections, html);
 *   html += "{next h2 content}";
 *   // html: "<div>{h2 content}<div>{h3 content}</div></div><div>{next h2 content}"
 *
 * Moving down a heading level closes the deeper (nested) sections before opening a new one.
 */
function handleSectionTransition(
  groupNestLevel: number,
  openSections: number[],
  html: string
): string {
  // Skip section handling for level 0 (tab containers)
  if (groupNestLevel === 0) {
    return html;
  }

  // Close sections that are deeper than or equal to the current level
  while (openSections.length > 0 && openSections[openSections.length - 1] >= groupNestLevel) {
    html += `</div>`;
    openSections.pop();
  }

  // Open new section for the current level
  html += `<div>`;
  openSections.push(groupNestLevel);

  return html;
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
 * @param {number[]} openSections - Array tracking currently open sections by their nesting level.
 * @param {string} html - Current accumulated HTML output to append to.
 * @returns {string} Updated HTML string including the rendered item.
 */
function renderItemHtmlRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  groupNestLevel: number,
  openSections: number[],
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
    // Handle section opening/closing before adding the heading
    html = handleSectionTransition(groupNestLevel, openSections, html);

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
        openSections,
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
  if (qrItem) {
    html += renderAnswerHtml(qItem, qrItem, '1rem');
  }

  return html;
}

/**
 * Renders a QuestionnaireResponseItem's answer(s) as label/value HTML: a single `<p>` for a
 * non-repeating item, or a bolded label followed by a `<ul>` of `<li>` for a repeating one.
 * Shared by the plain recursive renderer and the complex-repeat-group card renderer so a fix to
 * how answers render only ever needs to happen in one place.
 *
 * @param {QuestionnaireItem} qItem - The Questionnaire item, used for repeats/type and unit lookups.
 * @param {QuestionnaireResponseItem} qrItem - The matching response item holding the answer(s).
 * @param {string} marginBottom - CSS margin-bottom value for the rendered block, so callers can
 *   fit it to their surrounding spacing (e.g. tighter inside a card than at the top level).
 * @returns {string} HTML string, or an empty string if there are no answers to render.
 */
function renderAnswerHtml(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  marginBottom: string
): string {
  if (!qrItem.answer || qrItem.answer.length === 0) {
    return '';
  }

  const label = he.encode(qrItem.text ?? qItem.text ?? '');

  if (qItem.repeats && qItem.type !== 'group') {
    let html = `<div style="margin-bottom: 0.5em;"><strong style="font-weight: 600;">${label}</strong></div>`;
    html += `<ul style="margin-top: 0; margin-bottom: ${marginBottom}; font-weight: 400; padding-left: 2em;">`;
    for (const a of qrItem.answer) {
      html += `<li>${he.encode(answerToString(a, qItem))}</li>`;
    }
    html += `</ul>`;
    return html;
  }

  return qrItem.answer
    .map(
      (a) =>
        `<p style="margin-top: 0; margin-bottom: ${marginBottom}; font-weight: 400;"><strong style="font-weight: 600;">${label}</strong><br/>${he.encode(answerToString(a, qItem))}</p>`
    )
    .join('');
}

/**
 * Returns true if every non-hidden child of a repeating group is a plain answer item (not a group).
 * Tables are only appropriate for flat repeating groups; complex structures (with group children) need card layout.
 */
function isSimpleRepeatGroup(qItem: QuestionnaireItem): boolean {
  return (qItem.item ?? [])
    .filter((child) => !structuredDataCapture.getHidden(child))
    .every((child) => child.type !== 'group');
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
        'margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;';
      break;
    case 2:
      headingTag = 'h3';
      inlineStyle =
        'margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;';
      break;
    case 3:
    case 4:
    default:
      headingTag = 'h4';
      inlineStyle =
        'margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1em;';
      break;
  }

  return `<${headingTag} style="${inlineStyle}">${he.encode(headingText)}</${headingTag}>`;
}

/**
 * Renders a set of child QuestionnaireItems and their matching QuestionnaireResponseItems as label/value
 * paragraphs (or lists, for repeating answers). Group children that repeat are delegated to
 * renderRepeatGroupHtml (table or nested card); group children that don't repeat are just headed and
 * recursed into with this same function, so a plain one-off sub-group renders the same way regardless of
 * how deep it's nested. Used for each instance body of a complex repeating group.
 */
function renderGroupFieldsHtml(
  childQItems: QuestionnaireItem[],
  childQRItems: QuestionnaireResponseItem[]
): string {
  let html = '';

  const qrItemsByLinkId: Record<string, QuestionnaireResponseItem[]> = {};
  for (const qrChildItem of childQRItems) {
    if (!qrItemsByLinkId[qrChildItem.linkId]) {
      qrItemsByLinkId[qrChildItem.linkId] = [];
    }
    qrItemsByLinkId[qrChildItem.linkId].push(qrChildItem);
  }

  for (const childQItem of childQItems) {
    if (structuredDataCapture.getHidden(childQItem)) continue;

    const matchingQRItems = qrItemsByLinkId[childQItem.linkId] ?? [];

    if (childQItem.type === 'group') {
      if (matchingQRItems.length === 0) continue;

      if (childQItem.text) {
        html += `<h4 style="margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600; line-height: 1.25; font-size: 1em;">${he.encode(childQItem.text)}</h4>`;
      }

      if (childQItem.repeats) {
        html += renderRepeatGroupHtml(childQItem, matchingQRItems);
      } else {
        // A one-off sub-group is never a list of instances, so it gets the same plain
        // label/value treatment as everywhere else in the document, not table/card styling.
        html += renderGroupFieldsHtml(childQItem.item ?? [], matchingQRItems[0]?.item ?? []);
      }
    } else {
      const matchingQRItem = matchingQRItems[0];
      if (matchingQRItem) {
        html += renderAnswerHtml(childQItem, matchingQRItem, '0.5rem');
      }
    }
  }

  return html;
}

/**
 * Renders each instance of a complex repeating group (one that has group-type children) as a bordered
 * card block, with the instance's fields rendered by renderGroupFieldsHtml.
 */
function renderComplexRepeatGroupHtml(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[]
): string {
  let html = '';
  const childQItems = qItem.item ?? [];

  for (const qrItemInstance of qrItems) {
    html += `<div style="border: 1px solid #d1d9e0; border-radius: 6px; padding: 1em; margin-bottom: 0.75em;">`;
    html += renderGroupFieldsHtml(childQItems, qrItemInstance.item ?? []);
    html += `</div>`;
  }

  return html;
}

/**
 * Renders a repeated group of QuestionnaireResponseItems as HTML.
 * Simple groups (all non-group children) use a table for a compact grid view.
 * Complex groups (any group-type child) use a card-per-instance layout to avoid
 * a horizontally-expanding table that is not print-friendly.
 *
 * @param {QuestionnaireItem} qItem - The repeating group Questionnaire item with child items.
 * @param {QuestionnaireResponseItem[]} qrItems - Array of repeated response items for the group.
 * @returns {string} HTML string of the rendered output.
 */
export function renderRepeatGroupHtml(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[]
): string {
  if (!Array.isArray(qrItems)) {
    return '';
  }

  if (!isSimpleRepeatGroup(qItem)) {
    return renderComplexRepeatGroupHtml(qItem, qrItems);
  }

  // Table headers from child questions
  const headers =
    qItem.item
      ?.filter((child) => !structuredDataCapture.getHidden(child))
      .map((child) => he.encode(child.text ?? '')) ?? [];

  // Render headers
  let html = `<table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;">`;
  html += `<thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;">`;

  for (const header of headers) {
    html += `<th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">${header}</th>`;
  }
  html += `</tr></thead>`;

  // Render rows for each repeated item
  html += `<tbody>`;
  for (const qrItemInstance of qrItems) {
    const childQItems = qItem.item ?? [];
    const childQRItems = qrItemInstance.item ?? [];

    // Group QR items by linkId (a repeating group instance can have multiple children sharing a linkId)
    const qrItemsByLinkId: Record<string, QuestionnaireResponseItem[]> = {};
    for (const qrItem of childQRItems) {
      if (!qrItemsByLinkId[qrItem.linkId]) {
        qrItemsByLinkId[qrItem.linkId] = [];
      }
      qrItemsByLinkId[qrItem.linkId].push(qrItem);
    }

    html += `<tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;">`;
    for (const childQItem of childQItems) {
      if (structuredDataCapture.getHidden(childQItem)) {
        continue;
      }

      // Simple repeat groups (checked by isSimpleRepeatGroup above) never have group-type children,
      // so childQItem is always a plain answer item here.
      const matchingQRItems = qrItemsByLinkId[childQItem.linkId] ?? [];
      const answers = matchingQRItems[0]?.answer ?? [];
      const value = answers.map((a) => he.encode(answerToString(a, childQItem))).join('<br/>');
      html += `<td style="padding: 6px 13px; border: 1px solid #d1d9e0;">${value}</td>`;
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
export function answerToString(
  answer: QuestionnaireResponseItemAnswer,
  qItem?: QuestionnaireItem
): string {
  if (answer.valueBoolean !== undefined) {
    return answer.valueBoolean ? 'Yes' : 'No';
  }

  if (answer.valueDecimal !== undefined) {
    if (qItem) {
      const unit = structuredDataCapture.getUnit(qItem);
      const unitLabel = unit?.display ?? unit?.code ?? '';
      if (unitLabel) {
        return `${answer.valueDecimal} ${unitLabel}`;
      }
    }
    return `${answer.valueDecimal}`;
  }

  if (answer.valueInteger !== undefined) {
    if (qItem) {
      const unit = structuredDataCapture.getUnit(qItem);
      const unitLabel = unit?.display ?? unit?.code ?? '';
      if (unitLabel) {
        return `${answer.valueInteger} ${unitLabel}`;
      }
    }
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
