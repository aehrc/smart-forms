/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { describe, expect, jest, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
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

jest.mock('fhirclient', () => ({
  __esModule: true,
  client: jest.fn()
}));

import { client } from 'fhirclient';
const mockClient = client as jest.MockedFunction<typeof client>;

import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';

global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

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

const CODE = { system: 'http://snomed.info/sct', code: '133932002' };
const warningText = 'Some items in this list were not able to be displayed';

function mockLookupRejects() {
  mockClient.mockReturnValue({
    request: (jest.fn() as any).mockRejectedValue(new Error('Network Error'))
  } as any);
}

function mockLookupResolves(display: string) {
  mockClient.mockReturnValue({
    request: (jest.fn() as any).mockResolvedValue({
      resourceType: 'Parameters',
      parameter: [{ name: 'display', valueString: display }]
    })
  } as any);
}

function buildQuestionnaire(itemControl: 'select' | 'radio-button' | 'check-box'): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        extension:
          itemControl === 'select'
            ? undefined
            : [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: itemControl
                      }
                    ]
                  }
                }
              ],
        linkId: 'role',
        text: 'Role',
        type: 'choice',
        answerOption: [{ valueCoding: { ...CODE } }]
      }
    ]
  };
}

function buildResponse(display: string): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'role',
        text: 'Role',
        answer: [{ valueCoding: { ...CODE, display } }]
      }
    ]
  };
}

// Legacy/externally-authored answer that never had a display captured at all.
function buildResponseWithNoDisplay(): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'role',
        text: 'Role',
        answer: [{ valueCoding: { ...CODE } }]
      }
    ]
  };
}

function buildOpenChoiceQuestionnaire(
  itemControl: 'select' | 'radio-button' | 'check-box'
): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        extension:
          itemControl === 'select'
            ? undefined
            : [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: itemControl
                      }
                    ]
                  }
                }
              ],
        linkId: 'role',
        text: 'Role',
        type: 'open-choice',
        answerOption: [{ valueCoding: { ...CODE } }]
      }
    ]
  };
}

describe('previously-answered option survives a failed re-lookup on reload', () => {
  test('Select: shows the originally-recorded display instead of the raw code', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('select')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());
    expect(screen.queryByText('133932002')).toBeNull();

    // The current answer only survived via fallback (its own live lookup failed) - the warning
    // should still fire even though nothing looks obviously "missing" from the dropdown.
    expect(screen.getByText(warningText)).toBeTruthy();
  });

  test('Radio: the previously-selected option is still rendered and checked', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('radio-button')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());

    const radio = document.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio).toBeTruthy();
    expect(radio.checked).toBe(true);
    expect(screen.getByText(warningText)).toBeTruthy();
  });

  test('Checkbox: the previously-checked option is still rendered and checked', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('check-box')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText(warningText)).toBeTruthy();
  });
});

describe("checkbox stays checked when a code's display text changes (terminology rename)", () => {
  test('Checkbox: still checked when the live lookup returns a different display than the stored answer', async () => {
    // Stored answer was recorded with the old display "Carer"; the terminology server now
    // returns a renamed display "Support person" for the same code.
    mockLookupResolves('Support person');

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('check-box')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Support person')).toBeTruthy());

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(screen.queryByText(warningText)).toBeNull();
  });
});

describe('previously-answered open-choice option survives a failed re-lookup on reload', () => {
  test('OpenChoice Select: shows the originally-recorded display instead of the raw code', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildOpenChoiceQuestionnaire('select')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());
    expect(screen.queryByText('133932002')).toBeNull();
    expect(screen.getByText(warningText)).toBeTruthy();
  });

  test('OpenChoice Radio: the previously-selected option is still rendered and checked', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildOpenChoiceQuestionnaire('radio-button')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());

    const radio = document.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio).toBeTruthy();
    expect(radio.checked).toBe(true);
    expect(screen.getByText(warningText)).toBeTruthy();
  });

  test('OpenChoice Checkbox: the previously-checked option is still rendered and checked', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildOpenChoiceQuestionnaire('check-box')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Carer')).toBeTruthy());

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText(warningText)).toBeTruthy();
  });
});

describe("OpenChoice Select stays fresh when a code's display text changes (terminology rename)", () => {
  test('OpenChoice Select: shows the freshly-resolved display, not the stale recorded one', async () => {
    // Stored answer was recorded with the old display "Carer"; the terminology server now
    // returns a renamed display "Support person" for the same code. Before this fix,
    // OpenChoiceSelectAnswerOptionItem never re-matched its stored answer against the live
    // options list, so it would keep showing "Carer" indefinitely.
    mockLookupResolves('Support person');

    render(
      <SmartFormsRenderer
        questionnaire={buildOpenChoiceQuestionnaire('select')}
        questionnaireResponse={buildResponse('Carer')}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Support person')).toBeTruthy());
    expect(screen.queryByText('Carer')).toBeNull();
    expect(screen.queryByText(warningText)).toBeNull();
  });
});

describe('an answer with no display anywhere never leaks a raw code', () => {
  test('Select: shows nothing selected rather than the raw code', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('select')}
        questionnaireResponse={buildResponseWithNoDisplay()}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText(warningText)).toBeTruthy());
    expect(screen.queryByText('133932002')).toBeNull();
  });

  test('Radio: the option does not render rather than showing the raw code', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('radio-button')}
        questionnaireResponse={buildResponseWithNoDisplay()}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText(warningText)).toBeTruthy());
    expect(document.querySelector('input[type="radio"]')).toBeNull();
    expect(screen.queryByText('133932002')).toBeNull();
  });

  test('Checkbox: the option does not render rather than showing the raw code', async () => {
    mockLookupRejects();

    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire('check-box')}
        questionnaireResponse={buildResponseWithNoDisplay()}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(document.querySelector('[data-linkid="role"]')).toBeTruthy());
    await waitFor(() => expect(screen.getByText(warningText)).toBeTruthy());
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
    expect(screen.queryByText('133932002')).toBeNull();
  });
});
