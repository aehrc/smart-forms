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

import { describe, expect, test } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
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

// jsdom does not implement ResizeObserver, required by GroupTable's useResizeColumns
global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

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

const sliderItemControlExtension = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://hl7.org/fhir/questionnaire-item-control',
        code: 'slider'
      }
    ]
  }
};

function sliderStepExtension(step: number) {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
    valueInteger: step
  };
}

function minValueExtension(min: number) {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/minValue',
    valueInteger: min
  };
}

function maxValueExtension(max: number) {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
    valueInteger: max
  };
}

/**
 * Mirrors the "Pupil Size (mm)" item from issue #2094 - an integer item rendered as a slider with
 * an explicit min, max and step.
 */
function buildSliderQuestionnaire(options?: {
  minValue?: number;
  maxValue?: number;
  readOnly?: boolean;
}): Questionnaire {
  const { minValue = 0, maxValue = 10, readOnly } = options ?? {};

  const item: QuestionnaireItem = {
    linkId: 'pupil-size',
    text: 'Pupil Size (mm)',
    type: 'integer',
    extension: [
      sliderItemControlExtension,
      sliderStepExtension(1),
      minValueExtension(minValue),
      maxValueExtension(maxValue)
    ],
    ...(readOnly ? { readOnly: true } : {})
  };

  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [item]
  };
}

function buildSliderResponse(valueInteger: number): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'pupil-size',
        text: 'Pupil Size (mm)',
        answer: [{ valueInteger }]
      }
    ]
  };
}

function getUpdatableResponseString(): string {
  return JSON.stringify(questionnaireResponseStore.getState().updatableResponse);
}

function getSliderInput(): HTMLInputElement {
  const input = document.querySelector('[data-linkid="pupil-size"] input[type="range"]');
  expect(input).not.toBeNull();
  return input as HTMLInputElement;
}

function queryClearButton(): HTMLElement | null {
  return screen.queryByRole('button', { name: 'Clear' });
}

describe('slider items expose a clear button (issue #2094)', () => {
  test('no clear button is rendered while the slider is unanswered', async () => {
    render(<SmartFormsRenderer questionnaire={buildSliderQuestionnaire()} />);

    await waitFor(() => expect(getSliderInput()).toBeTruthy());

    // The display value reads "-" rather than a number, so the item is visibly unanswered
    expect(screen.getByText('-')).toBeTruthy();
    expect(queryClearButton()).toBeNull();
  });

  test('the clear button appears once the slider is answered', async () => {
    render(
      <SmartFormsRenderer
        questionnaire={buildSliderQuestionnaire()}
        questionnaireResponse={buildSliderResponse(4)}
      />
    );

    await waitFor(() => expect(queryClearButton()).not.toBeNull());
    expect(getSliderInput().value).toBe('4');
  });

  test('clearing removes the answer entirely rather than setting it to 0', async () => {
    render(
      <SmartFormsRenderer
        questionnaire={buildSliderQuestionnaire()}
        questionnaireResponse={buildSliderResponse(4)}
      />
    );

    await waitFor(() => expect(queryClearButton()).not.toBeNull());
    expect(getUpdatableResponseString()).toContain('"valueInteger":4');

    fireEvent.click(queryClearButton() as HTMLElement);

    // The item is gone from the response - not left behind as an answer of 0, which per the issue
    // is a different thing from "not set"
    await waitFor(() => expect(getUpdatableResponseString()).not.toContain('"valueInteger":4'));
    expect(getUpdatableResponseString()).not.toContain('"valueInteger":0');
    expect(getUpdatableResponseString()).not.toContain('"linkId":"pupil-size"');
    expect((questionnaireResponseStore.getState().updatableResponse.item ?? []).length).toBe(0);
  });

  test('clearing returns the item to its visibly unanswered state', async () => {
    render(
      <SmartFormsRenderer
        questionnaire={buildSliderQuestionnaire()}
        questionnaireResponse={buildSliderResponse(4)}
      />
    );

    await waitFor(() => expect(queryClearButton()).not.toBeNull());

    fireEvent.click(queryClearButton() as HTMLElement);

    // Display value falls back to "-" and the button hides itself again
    await waitFor(() => expect(screen.getByText('-')).toBeTruthy());
    await waitFor(() => expect(queryClearButton()).toBeNull());
  });

  test('an answer of 0 still gets a clear button', async () => {
    // 0 is a legitimate answer on a slider whose range spans zero, so it must count as answered
    // rather than being mistaken for "no answer"
    render(
      <SmartFormsRenderer
        questionnaire={buildSliderQuestionnaire({ minValue: -5, maxValue: 5 })}
        questionnaireResponse={buildSliderResponse(0)}
      />
    );

    await waitFor(() => expect(queryClearButton()).not.toBeNull());

    expect(getSliderInput().value).toBe('0');
    expect(screen.queryByText('-')).toBeNull();
  });

  test('no clear button is rendered when the item is readOnly', async () => {
    render(
      <SmartFormsRenderer
        questionnaire={buildSliderQuestionnaire({ readOnly: true })}
        questionnaireResponse={buildSliderResponse(4)}
      />
    );

    await waitFor(() => expect(getSliderInput()).toBeTruthy());

    expect(getSliderInput().value).toBe('4');
    expect(queryClearButton()).toBeNull();
  });
});
