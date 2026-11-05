/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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

import { describe, expect, jest, test } from '@jest/globals';
import { act, configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Coding, Questionnaire, QuestionnaireResponse, ValueSet } from 'fhir/r4';
import React from 'react';

// react-markdown, react-dnd and react-dnd-html5-backend are ESM-only and cannot be transformed by ts-jest
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: { children?: React.ReactNode }) => <>{props.children}</>
}));
jest.mock('react-dnd', () => ({
  __esModule: true,
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()]
}));
jest.mock('react-dnd-html5-backend', () => ({
  __esModule: true,
  NativeTypes: { FILE: '__NATIVE_FILE__' }
}));

import { client } from 'fhirclient';
import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

const mockClient = client as jest.MockedFunction<typeof client>;

// The whole form renders for each test, which is slow when the full suite runs in parallel.
configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);

// jsdom does not implement matchMedia, required by MUI useMediaQuery
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }) as unknown as MediaQueryList);

const autocompleteExtension = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'autocomplete' }]
  }
};
const LONG_DISPLAY =
  'Chronic obstructive pulmonary disease with acute lower respiratory infection and acute exacerbation, requiring review';
const alphaCoding = { system: 'urn:test', code: 'alpha', display: 'Alpha' };
const betaCoding = { system: 'urn:test', code: 'beta', display: 'Beta' };
const longCoding = { system: 'urn:test', code: 'long', display: LONG_DISPLAY };
const codings = [alphaCoding, betaCoding, longCoding];

// The search fields query the terminology server, which returns every coding
function mockExpansion(contains: Coding[]) {
  const expansion: ValueSet = {
    resourceType: 'ValueSet',
    status: 'active',
    expansion: { timestamp: '2026-01-01', total: contains.length, contains }
  };
  mockClient.mockReturnValue({
    request: (jest.fn() as any).mockResolvedValue(expansion)
  } as any);
}

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'options',
      status: 'active',
      expansion: { timestamp: '2026-01-01', contains: codings }
    }
  ],
  item: [
    // ChoiceSelectAnswerValueSetFields
    { linkId: 'closed', type: 'choice', text: 'Closed', answerValueSet: '#options' },
    // OpenChoiceSelectAnswerOptionField
    {
      linkId: 'open',
      type: 'open-choice',
      text: 'Open',
      answerOption: codings.map((valueCoding) => ({ valueCoding }))
    },
    // OpenChoiceSelectAnswerValueSetField
    { linkId: 'open-values', type: 'open-choice', text: 'Open values', answerValueSet: '#options' },
    // ChoiceAutocompleteField
    {
      linkId: 'closed-search',
      type: 'choice',
      text: 'Closed search',
      answerValueSet: 'https://example.test/ValueSet/options',
      extension: [autocompleteExtension]
    },
    // OpenChoiceAutocompleteField
    {
      linkId: 'open-search',
      type: 'open-choice',
      text: 'Open search',
      answerValueSet: 'https://example.test/ValueSet/options',
      extension: [autocompleteExtension]
    }
  ]
};
const fields = (questionnaire.item ?? []).map((item) => ({
  linkId: item.linkId,
  text: item.text ?? ''
}));

// The field shows `text` either as the combobox's own value or as text drawn next to it. jsdom has no
// layout, so whether that text wraps is checked by the "Testing/Long choice values" story instead.
function fieldShows(combobox: HTMLInputElement, text: string): boolean {
  const field = combobox.closest('.MuiAutocomplete-root') as HTMLElement;
  return combobox.value === text || within(field).queryAllByText(text).length > 0;
}

function getAnswers(linkId: string) {
  return questionnaireResponseStore
    .getState()
    .updatableResponse.item?.find((item) => item.linkId === linkId)?.answer;
}

describe('choice and open-choice autocompletes', () => {
  test.each(fields)('Arrow/Enter selects an option in "$text"', async ({ linkId, text }) => {
    // The terminology server returns only the match; the other fields filter their own options
    mockExpansion([betaCoding]);
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    try {
      render(
        <SmartFormsRenderer
          questionnaire={questionnaire}
          terminologyServerUrl="http://fake-terminology-server"
        />
      );

      const combobox = await screen.findByRole<HTMLInputElement>('combobox', { name: text });
      await act(async () => {
        combobox.focus();
        fireEvent.change(combobox, { target: { value: 'Be' } });
      });
      await screen.findByRole('option', { name: 'Beta' });
      await act(async () => {
        fireEvent.keyDown(combobox, { key: 'ArrowDown' });
        fireEvent.keyDown(combobox, { key: 'Enter' });
      });

      await waitFor(() =>
        expect(getAnswers(linkId)).toEqual([expect.objectContaining({ valueCoding: betaCoding })])
      );
      expect(fieldShows(combobox, 'Beta')).toBe(true);
      const textareaWarnings = [...warn.mock.calls, ...error.mock.calls]
        .flat()
        .map(String)
        .filter((message) => message.includes('textarea element was provided'));
      expect(textareaWarnings).toEqual([]);
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  });

  test.each(fields)(
    'a long selected value in "$text" is drawn as text the field can wrap',
    async ({ linkId, text }) => {
      mockExpansion(codings);
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId, text, answer: [{ valueCoding: longCoding }] }]
      };
      render(
        <SmartFormsRenderer
          questionnaire={questionnaire}
          questionnaireResponse={questionnaireResponse}
          terminologyServerUrl="http://fake-terminology-server"
        />
      );

      const combobox = await screen.findByRole<HTMLInputElement>('combobox', { name: text });
      const field = combobox.closest('.MuiAutocomplete-root') as HTMLElement;
      // A single-line input cannot wrap, so the full value must also be drawn as text
      await waitFor(() => expect(within(field).getAllByText(LONG_DISPLAY)).toHaveLength(1));
      // Screen readers get the value from the combobox, or from the drawn text if it is not hidden
      const drawnText = within(field).getByText(LONG_DISPLAY);
      const readableValue =
        combobox.value === LONG_DISPLAY || drawnText.getAttribute('aria-hidden') !== 'true';
      expect(readableValue).toBe(true);
    }
  );
});
