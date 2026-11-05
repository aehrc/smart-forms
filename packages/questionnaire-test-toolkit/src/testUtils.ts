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

// This file contains exact function as packages/smart-forms-renderer/src/test/testUtils.ts
// The reason why we're violating DRY principle here is to:
// 1. Prevent testUtils from smart-forms-renderer from bloating package size
// 2. Prevent it from showing up in typedoc in the documentation site, which will affect docs search

import { evaluate } from 'fhirpath';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { questionnaireResponseStore, rendererConfigStore } from '@aehrc/smart-forms-renderer';
import { act } from 'react';
import type { ExtractResult, InAppExtractOutput } from '@aehrc/sdc-template-extract';
import { extractResultIsOperationOutcome } from '@aehrc/sdc-template-extract';
import type { ExtractResultSpy } from './behavioralTestTypes';

/**
 * Fails with the question identifier and the reason when the supplied control cannot be
 * interacted with. `fireEvent` cannot see `readOnly`, `disabled` or disabled fieldsets, so
 * without this check helpers would silently "succeed" at interactions a real user cannot
 * perform.
 */
function assertInteractive(element: Element, linkId: string): void {
  const reason = describeNonInteractiveReason(element);
  if (reason) {
    throw new Error(`Question "${linkId}" cannot be interacted with: ${reason}`);
  }
}

function describeNonInteractiveReason(element: Element): string | null {
  const input = element as HTMLInputElement;

  if (input.disabled) {
    return 'the control is disabled';
  }
  if (input.readOnly) {
    return 'the control is read-only';
  }
  if (element.closest('fieldset:disabled')) {
    return 'the control is inside a disabled fieldset';
  }

  return null;
}

export async function inputText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean | number
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);

  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  assertInteractive(input, linkId);

  await act(async () => {
    fireEvent.change(input, { target: { value: text } });
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

/**
 * Checks the supplied checkbox unless it is already checked, verifies the click actually took
 * effect and waits for the debounced store update. Shared by the checkbox helpers to keep the
 * guard, click and verification sequence consistent.
 */
async function checkCheckboxInput(
  checkbox: Element,
  linkId: string,
  checkedDescription: string
): Promise<void> {
  assertInteractive(checkbox, linkId);

  const checkboxInput = checkbox as HTMLInputElement;
  if (!checkboxInput.checked) {
    await act(async () => {
      fireEvent.click(checkboxInput);
    });
  }

  // Confirm the click actually checked the box instead of silently doing nothing.
  await waitFor(() => {
    if (!checkboxInput.checked) {
      throw new Error(`${checkedDescription} was not checked after interaction`);
    }
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function checkCheckBox(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  await checkCheckboxInput(input, linkId, `Checkbox "${linkId}"`);
}

export async function inputFile(
  canvasElement: HTMLElement,
  linkId: string,
  files: File | File[],
  url: string,
  filename: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input = questionElement?.querySelector('input');

  const textareaUrl = questionElement?.querySelector(`textarea[data-test="q-item-attachment-url"]`);
  const textareaName = questionElement?.querySelector(
    `textarea[data-test="q-item-attachment-file-name"]`
  );

  if (!input) {
    throw new Error(`File input was not found inside [data-linkid=${linkId}] block`);
  }
  if (!textareaUrl) {
    throw new Error(`File input was not found inside [data-linkid="URL"] block`);
  }
  if (!textareaName) {
    throw new Error(`File input was not found inside [data-linkid="File name (optional)"] block`);
  }

  assertInteractive(input, linkId);
  assertInteractive(textareaUrl, linkId);
  assertInteractive(textareaName, linkId);

  const fileList = Array.isArray(files) ? files : [files];
  await userEvent.upload(input, fileList);

  await act(async () => {
    fireEvent.change(textareaUrl, { target: { value: url } });
    fireEvent.change(textareaName, { target: { value: filename } });
  });
  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function inputDate(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputTime(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputReference(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputDecimal(canvasElement: HTMLElement, linkId: string, text: number) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputUrl(canvasElement: HTMLElement, linkId: string, text: string) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputInteger(canvasElement: HTMLElement, linkId: string, text: number) {
  return await inputText(canvasElement, linkId, text);
}

// Renderer markup the repeat helpers rely on. The data-test hooks are set by the renderer for
// tests; the MUI class name is an implementation detail, so it is named once here.
const REPEAT_GROUP_COLLECTION = '[data-test="q-group-repeat-box"]';
const REPEATED_QUESTION_COLLECTION = '[data-test="q-item-repeat-box"]';
const ANY_REPEAT_COLLECTION = `${REPEAT_GROUP_COLLECTION}, ${REPEATED_QUESTION_COLLECTION}, table`;
const ADD_REPEAT_BUTTON = '[data-test="button-add-repeat-item"]';
// The remove button sits in a span so that its tooltip still shows while it is disabled.
const REMOVE_REPEAT_BUTTON = 'span[role="button"] button';
// Each answer of a repeated question is rendered in its own MUI Collapse.
const REPEATED_ANSWER_INSTANCE = '.MuiCollapse-root';
// A removed instance collapses (200 ms) before it leaves the DOM. Under full-suite load that has
// taken several seconds, so wait well beyond the transition.
const REPEAT_REMOVAL_TIMEOUT = 10000;

type RepeatCollection =
  | { kind: 'table'; element: HTMLTableElement }
  | { kind: 'question'; element: HTMLElement }
  | { kind: 'group'; element: HTMLElement; linkId: string };

/** Returns the repeat group collection that `element` is a direct instance of, if any. */
function getRepeatGroupCollection(element: Element): HTMLElement | null {
  // Nothing with a linkId lies between an instance and its collection, so a question nested
  // inside an instance resolves to that instance instead.
  const ancestor = element.parentElement?.closest<HTMLElement>(
    `[data-linkid], ${REPEAT_GROUP_COLLECTION}`
  );
  return ancestor?.matches(REPEAT_GROUP_COLLECTION) ? ancestor : null;
}

function getRepeatCollection(element: HTMLElement): RepeatCollection | null {
  if (element.matches(REPEATED_QUESTION_COLLECTION)) {
    return { kind: 'question', element };
  }

  const table = Array.from(element.querySelectorAll('table')).find(
    (candidate) => candidate.closest('[data-linkid]') === element
  );
  if (table) {
    return { kind: 'table', element: table };
  }

  const groupCollection = getRepeatGroupCollection(element);
  const linkId = element.getAttribute('data-linkid');
  return groupCollection && linkId ? { kind: 'group', element: groupCollection, linkId } : null;
}

function getRepeatInstances(collection: RepeatCollection): HTMLElement[] {
  switch (collection.kind) {
    case 'table':
      return Array.from(collection.element.querySelectorAll<HTMLElement>(':scope > tbody > tr'));
    case 'question':
      return Array.from(
        collection.element.querySelectorAll<HTMLElement>(REPEATED_ANSWER_INSTANCE)
      ).filter((instance) => instance.closest(REPEATED_QUESTION_COLLECTION) === collection.element);
    case 'group':
      return Array.from(
        collection.element.querySelectorAll<HTMLElement>(`[data-linkid="${collection.linkId}"]`)
      ).filter((instance) => getRepeatGroupCollection(instance) === collection.element);
  }
}

/**
 * Adds an instance to the unique repeat identified by `linkIdOrLabel` and waits for it to
 * render. Works for a repeat group, a `gtable` row and a repeated question. Returns the new
 * instance (the group instance, table row or answer), which can be passed straight to the
 * scoped input helpers, e.g. `inputText(await addRepeatInstance(container, 'Medications'),
 * 'Medication name', 'Ibuprofen')`.
 *
 * Only the collection's own Add button is used, never one of a nested collection. Fails when
 * `linkIdOrLabel` is not a repeat, matches more than one collection in `scope` (pass an outer
 * instance as the scope), or its Add button is hidden or disabled.
 */
export async function addRepeatInstance(
  scope: HTMLElement,
  linkIdOrLabel: string
): Promise<HTMLElement> {
  const matches = await findAllByLinkIdOrLabel(scope, linkIdOrLabel);
  const collectionsByElement = new Map<HTMLElement, RepeatCollection>();
  for (const match of matches) {
    const collection = getRepeatCollection(match);
    if (collection) {
      collectionsByElement.set(collection.element, collection);
    }
  }

  if (collectionsByElement.size === 0) {
    throw new Error(
      `"${linkIdOrLabel}" is not a repeat group, a gtable or a repeated question in scope`
    );
  }
  if (collectionsByElement.size > 1) {
    throw new Error(
      `Repeat "${linkIdOrLabel}" matches multiple collections; provide an instance scope`
    );
  }
  const [collection] = collectionsByElement.values();

  const addButtons = Array.from(
    collection.element.querySelectorAll<HTMLButtonElement>(ADD_REPEAT_BUTTON)
  ).filter((button) => button.closest(ANY_REPEAT_COLLECTION) === collection.element);
  if (addButtons.length !== 1) {
    throw new Error(`Add button for repeat "${linkIdOrLabel}" was not found`);
  }
  const [addButton] = addButtons;
  assertInteractive(addButton, linkIdOrLabel);

  const countBefore = getRepeatInstances(collection).length;
  await act(async () => {
    fireEvent.click(addButton);
  });
  await waitFor(
    () => {
      if (getRepeatInstances(collection).length !== countBefore + 1) {
        throw new Error(`Repeat "${linkIdOrLabel}" did not add an instance`);
      }
    },
    { timeout: 5000 }
  );

  const [added] = getRepeatInstances(collection).slice(-1);
  return added;
}

/**
 * Removes one repeat instance with its own remove button and waits for it to leave the DOM.
 * `instance` is a repeat group instance, a `gtable` body row or a repeated answer, as returned
 * by `addRepeatInstance` or found with `findByLinkIdOrLabel`. Fails when given any other
 * element, including one nested inside an instance, and when the remove button is disabled
 * (e.g. the empty placeholder that remains after the last instance is cleared).
 */
export async function removeRepeatInstance(instance: HTMLElement): Promise<void> {
  let removeButton: HTMLButtonElement | null = null;
  let label: string | null = null;

  const answers = instance.closest<HTMLElement>(REPEATED_QUESTION_COLLECTION);
  const groupCollection = getRepeatGroupCollection(instance);
  if (instance.matches('tbody > tr')) {
    label = instance.closest('[data-linkid]')?.getAttribute('data-linkid') ?? 'table row';
    removeButton = instance.querySelector(`:scope > td:last-child ${REMOVE_REPEAT_BUTTON}`);
  } else if (
    answers &&
    getRepeatInstances({ kind: 'question', element: answers }).includes(instance)
  ) {
    label = answers.getAttribute('data-linkid') ?? 'repeated answer';
    removeButton = instance.querySelector(REMOVE_REPEAT_BUTTON);
  } else if (groupCollection) {
    label = instance.getAttribute('data-linkid') ?? 'repeat group';
    // RepeatGroupItem renders the instance beside its remove button. Look only at direct
    // children while walking up, and stop at the collection, so no other instance's button
    // can be found.
    for (
      let ancestor = instance.parentElement;
      ancestor && ancestor !== groupCollection && !removeButton;
      ancestor = ancestor.parentElement
    ) {
      removeButton = ancestor.querySelector(`:scope > ${REMOVE_REPEAT_BUTTON}`);
    }
  } else {
    throw new Error(
      'Provide a repeat instance: a repeat group instance, a gtable body row or a repeated answer'
    );
  }

  if (!removeButton) {
    throw new Error(`Remove button for repeat instance "${label}" was not found`);
  }
  assertInteractive(removeButton, label);

  const button = removeButton;
  await act(async () => {
    fireEvent.click(button);
  });
  await waitFor(
    () => {
      if (instance.isConnected) {
        throw new Error(`Repeat instance "${label}" was not removed`);
      }
    },
    { timeout: REPEAT_REMOVAL_TIMEOUT }
  );
}

export async function selectTab(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const button =
    questionElement?.querySelector('button') ?? questionElement?.querySelector('[role="button"]');
  if (!button) {
    throw new Error(`Tab was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  // Clicking an already expanded accordion tab collapses it, so leave it alone. Tabs without an
  // aria-expanded attribute keep the existing click behaviour.
  if (button.getAttribute('aria-expanded') === 'true') {
    return;
  }

  await act(async () => {
    fireEvent.click(button);
  });

  await waitForTabHeadingFocus(button);
}

// A desktop tab click focuses the new panel's first heading after a short timer (renderer
// FormBodySingleTab). Wait for it, so a field the caller focuses next does not lose focus and,
// for example, close an open autocomplete list. Small-screen sections expand in place and do not
// move focus.
async function waitForTabHeadingFocus(button: Element) {
  if (rendererConfigStore.getState().disableHeadingFocusOnTabSwitch) {
    return;
  }
  if (!button.closest('[data-test="renderer-tab-list"]')) {
    return;
  }
  const index = /^tab-(\d+)$/.exec(button.querySelector('[id^="tab-"]')?.id ?? '')?.[1];
  const heading =
    index === undefined
      ? null
      : document.getElementById(`tabpanel-${index}`)?.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) {
    return;
  }

  await waitFor(() => {
    if (document.activeElement !== heading) {
      throw new Error(`Tab panel ${index} heading did not take focus`);
    }
  });
}

export async function inputDateTime(
  canvasElement: HTMLElement,
  linkId: string,
  date: string,
  time: string,
  amPm: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const inputDate = questionElement?.querySelector('div[data-test="date"] input');
  const inputTime = questionElement?.querySelector('div[data-test="time"] input');
  const inputAmPm = questionElement?.querySelector('div[data-test="ampm"] input');

  if (!inputTime) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }
  if (!inputDate) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }
  if (!inputAmPm) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  // AM/PM is not checked: the renderer also disables it while the time is in 24-hour notation.
  assertInteractive(inputDate, linkId);
  assertInteractive(inputTime, linkId);

  await act(async () => {
    fireEvent.change(inputDate, { target: { value: date } });
    fireEvent.change(inputTime, { target: { value: time } });
    fireEvent.change(inputAmPm, { target: { value: amPm } });
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function checkRadioOption(canvasElement: HTMLElement, linkId: string, text: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const radio = questionElement?.querySelector(`span[data-test="radio-single-${text}"] input`);

  if (!radio) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  assertInteractive(radio, linkId);

  await act(async () => {
    fireEvent.click(radio);
  });

  // Confirm the click actually selected the option instead of silently doing nothing.
  await waitFor(() => {
    if (!(radio as HTMLInputElement).checked) {
      throw new Error(`Radio option "${text}" for "${linkId}" was not selected after interaction`);
    }
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function checkCheckboxOption(
  canvasElement: HTMLElement,
  linkId: string,
  text: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const checkbox = questionElement?.querySelector(
    `span[data-test="checkbox-single-${text}"] input`
  );

  if (!checkbox) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  await checkCheckboxInput(checkbox, linkId, `Checkbox option "${text}" for "${linkId}"`);
}

export async function getInputText(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  return input.value;
}

export async function getRadioValue(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input = questionElement?.querySelector('input:checked');

  if (!input) {
    throw new Error(
      `Input with value checked was not found inside ${`[data-linkid=${linkId}] block`}`
    );
  }

  return (input as HTMLInputElement).value;
}

export async function getCqfText(canvasElement: HTMLElement, linkId: string) {
  const displayElement = await findByLinkIdOrLabel(canvasElement, linkId);

  const rawText = displayElement.textContent ?? '';
  const text = rawText.replace(/\s+/g, ' ').trim();

  if (!text) {
    throw new Error(`Display text was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  return text;
}

export async function getSelectText(canvasElement: HTMLElement, linkId: string) {
  const element = await findByLinkIdOrLabel(canvasElement, linkId);

  if (!element) {
    throw new Error(`Select or input was not found inside element with data-label="${linkId}"`);
  }

  return (element.querySelector('span')?.textContent ?? '').trim();
}

export async function chooseSelectOption(
  canvasElement: HTMLElement,
  linkId: string,
  optionLabel: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);

  const input = questionElement.querySelector('input, textarea');
  if (!input) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  assertInteractive(input, linkId);

  await act(async () => {
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.change(input, { target: { value: optionLabel } });
  });

  const option = await screen.findByRole('option', { name: optionLabel }, { timeout: 10000 });

  await act(async () => {
    fireEvent.click(option);
  });

  // Confirm the click actually recorded the selection instead of silently doing nothing. A
  // successful selection closes the options list; a silent no-op (e.g. a click that a real user
  // could not perform) leaves the clicked option in the DOM. The selected display text is not
  // checked because terminology-sourced options do not always round-trip their display label.
  await waitFor(
    () => {
      if (screen.queryByRole('option', { name: optionLabel })) {
        throw new Error(`Select "${linkId}" did not record option "${optionLabel}"`);
      }
    },
    { timeout: 5000 }
  );
}

export async function chooseQuantityOption(
  canvasElement: HTMLElement,
  linkId: string,
  quantity: number | string,
  quantityComparator?: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);

  const inputComaparator = questionElement.querySelector(
    'div[data-test="q-item-quantity-comparator"] input'
  );
  const inputWeight = questionElement.querySelector('div[data-test="q-item-quantity-field"] input');

  if (!inputComaparator) {
    throw new Error(`There is no input inside ${linkId}`);
  }
  if (!inputWeight) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  assertInteractive(inputComaparator, linkId);
  assertInteractive(inputWeight, linkId);

  await act(async () => {
    fireEvent.focus(inputComaparator);
    fireEvent.keyDown(inputComaparator, { key: 'ArrowDown', code: 'ArrowDown' });
  });

  if (quantityComparator) {
    const option = await screen.findByText(quantityComparator);
    await act(async () => {
      fireEvent.click(option);
      fireEvent.change(inputComaparator, { target: { value: quantityComparator } });
    });
  }

  await act(async () => {
    fireEvent.change(inputWeight, { target: { value: quantity } });
  });
  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function findByLinkIdOrLabel(
  canvasElement: HTMLElement,
  linkId: string
): Promise<HTMLElement> {
  const selectorByLinkId = `[data-linkid="${linkId}"]`;
  const selectorByLabel = `[data-label="${linkId}"]`;

  return await waitFor(() => {
    const el =
      canvasElement.querySelector<HTMLElement>(selectorByLinkId) ??
      canvasElement.querySelector<HTMLElement>(selectorByLabel);

    if (!el) {
      throw new Error(
        `Element with selectors "${selectorByLinkId}" or "${selectorByLabel}" not found`
      );
    }

    return el;
  });
}

export async function findAllByLinkIdOrLabel(
  canvasElement: HTMLElement,
  linkId: string
): Promise<HTMLElement[]> {
  const selectorByLinkId = `[data-linkid="${linkId}"]`;
  const selectorByLabel = `[data-label="${linkId}"]`;

  return await waitFor(() => {
    const byLinkId = Array.from(canvasElement.querySelectorAll<HTMLElement>(selectorByLinkId));
    const byLabel = Array.from(canvasElement.querySelectorAll<HTMLElement>(selectorByLabel));

    const unique = Array.from(new Set<HTMLElement>([...byLinkId, ...byLabel]));
    if (unique.length === 0) {
      throw new Error(
        `Elements with selectors "${selectorByLinkId}" or "${selectorByLabel}" not found`
      );
    }

    return unique;
  });
}

export async function inputOpenChoiceOtherText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string
) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);

  const textarea = questionElement?.querySelector(
    'div[data-test="q-item-radio-open-label-box"] textarea'
  );

  if (!textarea) {
    throw new Error(`Input or textarea was not found inside ${`[data-test=${linkId}] block`}`);
  }

  assertInteractive(textarea, linkId);

  await act(async () => {
    fireEvent.change(textarea, { target: { value: text } });
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
}

export async function getAnswerRecursiveByLabel(text: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  const result = await evaluate(
    qr,
    `QuestionnaireResponse.repeat(item).where((text = '${text}')).answer`
  );
  return result;
}

export async function getVisibleTab(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await waitFor(() => {
    const tabPanel = canvasElement.querySelector<HTMLElement>(
      '[data-test="renderer-tab-panel"]:not([hidden])'
    );
    const accordion = canvasElement.querySelector<HTMLElement>(
      '[data-test="renderer-accordion"]:has(button[aria-expanded="true"])'
    );

    const tabPanelOrAccordion = tabPanel ?? accordion;
    if (!tabPanelOrAccordion) {
      throw new Error('Visible tab panel or accordion not found');
    }

    return tabPanelOrAccordion;
  });
}

export function getBirthDateForAge(ageInYears: number): string {
  const today = new Date();
  const birthDate = new Date(today.getFullYear() - ageInYears, today.getMonth(), today.getDate());

  // Format the intended local calendar date directly. Converting through toISOString() shifts the
  // date in timezones ahead of UTC (e.g. Australia/Sydney) and can even move the year when the
  // birthday is near the New Year boundary. Invalid target dates roll over per the Date
  // constructor: a 29 February birthday in a non-leap target year resolves to 1 March. Suites with
  // a clinical leap-day policy should use explicit DOB fixtures instead.
  const year = birthDate.getFullYear();
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const day = String(birthDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function invokeExtract(
  canvasElement: HTMLElement,
  onExtractResultMock: ExtractResultSpy
) {
  const button = canvasElement.querySelector('button[data-testid="save-button"]');
  if (!button) {
    throw new Error('Save button not found');
  }

  const callsBefore = onExtractResultMock.mock.calls?.length ?? 0;

  await act(async () => {
    fireEvent.click(button);
  });

  await waitFor(
    () => {
      const calls = onExtractResultMock.mock.calls;

      // Spies without a call log keep the lastCall-based wait.
      if (calls === undefined) {
        if (!onExtractResultMock.mock.lastCall) {
          throw new Error('Expected onExtractResult to be called');
        }
        return;
      }

      // Wait for the callback of the click just dispatched, rather than accepting a callback from
      // an earlier extraction.
      if (calls.length <= callsBefore) {
        throw new Error('Expected onExtractResult to be called for this extraction');
      }
    },
    { timeout: 5000 }
  );

  const calls = onExtractResultMock.mock.calls;
  const lastCall =
    calls !== undefined ? calls[calls.length - 1] : onExtractResultMock.mock.lastCall;
  if (!lastCall) {
    throw new Error('Expected onExtractResult to be called');
  }

  // The spy is untyped by construction (see ExtractResultSpy), so its first argument is asserted
  // rather than inferred. BehavioralTestWrapper is the only caller of onExtractResult.
  return getExtractResultBundle(lastCall[0] as InAppExtractOutput);
}

function getExtractResultBundle(extractResultOutput: InAppExtractOutput) {
  if (!extractResultOutput.extractSuccess) {
    throw new Error('Expected extraction to succeed');
  }
  const extractResult = extractResultOutput.extractResult as ExtractResult;
  if (extractResultIsOperationOutcome(extractResult)) {
    throw new Error('Expected extraction not to return an OperationOutcome');
  }

  return extractResult.extractedBundle;
}
