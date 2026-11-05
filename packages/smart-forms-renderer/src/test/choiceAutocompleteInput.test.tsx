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
import { act, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire } from 'fhir/r4';
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

import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

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
const betaCoding = { system: 'urn:test', code: 'beta', display: 'Beta' };

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'options',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01',
        contains: [{ system: 'urn:test', code: 'alpha', display: 'Alpha' }, betaCoding]
      }
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
      answerOption: [{ valueCoding: betaCoding }]
    },
    // OpenChoiceSelectAnswerValueSetField
    { linkId: 'open-values', type: 'open-choice', text: 'Open values', answerValueSet: '#options' },
    // ChoiceAutocompleteField
    {
      linkId: 'closed-search',
      type: 'choice',
      text: 'Closed search',
      answerValueSet: '#options',
      extension: [autocompleteExtension]
    },
    // OpenChoiceAutocompleteField
    {
      linkId: 'open-search',
      type: 'open-choice',
      text: 'Open search',
      answerValueSet: '#options',
      extension: [autocompleteExtension]
    }
  ]
};

describe('choice autocomplete inputs', () => {
  test('every autocomplete uses a single-line input, so Arrow/Enter selects an option', async () => {
    const warn = jest.spyOn(console, 'warn');
    const error = jest.spyOn(console, 'error');
    try {
      render(<SmartFormsRenderer questionnaire={questionnaire} />);

      await waitFor(() =>
        expect(document.querySelector('[data-linkid="closed"] [role="combobox"]')).not.toBeNull()
      );
      for (const linkId of ['closed', 'open', 'open-values', 'closed-search', 'open-search']) {
        const combobox = document.querySelector(`[data-linkid="${linkId}"] [role="combobox"]`);
        expect([linkId, combobox?.tagName]).toEqual([linkId, 'INPUT']);
      }

      const input = document.querySelector<HTMLInputElement>(
        '[data-linkid="closed"] [role="combobox"]'
      )!;
      await act(async () => {
        input.focus();
        fireEvent.change(input, { target: { value: 'Beta' } });
      });
      await screen.findByRole('option', { name: 'Beta' });
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      await waitFor(() =>
        expect(
          questionnaireResponseStore
            .getState()
            .updatableResponse.item?.find((item) => item.linkId === 'closed')?.answer
        ).toEqual([expect.objectContaining({ valueCoding: betaCoding })])
      );
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
});
