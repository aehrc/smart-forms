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
import { questionnaireResponseStore } from '@aehrc/smart-forms-renderer';
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

export async function checkCheckBox(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  assertInteractive(input, linkId);

  const checkbox = input as HTMLInputElement;
  if (!checkbox.checked) {
    await act(async () => {
      fireEvent.click(checkbox);
    });
  }

  // Confirm the click actually checked the box instead of silently doing nothing.
  await waitFor(() => {
    if (!checkbox.checked) {
      throw new Error(`Checkbox "${linkId}" was not checked after interaction`);
    }
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
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

/**
 * Adds an instance to the unique repeat collection identified by `linkIdOrLabel` and waits for
 * the rendered instance count to increase. Returns the new instance container, which can be
 * passed directly to the scoped input helpers (e.g. `inputText(newInstance, 'name', 'value')`).
 *
 * The collection's own add button is used; add buttons of nested repeat groups inside an
 * existing instance are never matched. Fails when the add button is disabled (e.g. the final
 * row is empty).
 */
export async function addRepeatGroup(
  canvasElement: HTMLElement,
  linkIdOrLabel: string
): Promise<HTMLElement> {
  const instance = await findByLinkIdOrLabel(canvasElement, linkIdOrLabel);
  const linkId = instance.getAttribute('data-linkid') ?? linkIdOrLabel;

  // The add button belongs to the nearest ancestor of the instance that has one outside the
  // instance itself; buttons inside instances belong to nested repeat groups.
  let scope: HTMLElement | null = instance;
  let collection: HTMLElement | null = null;
  let addButton: HTMLButtonElement | null = null;
  while (scope && !addButton) {
    addButton =
      Array.from(
        scope.querySelectorAll<HTMLButtonElement>('[data-test="button-add-repeat-item"]')
      ).find((button) => !instance.contains(button)) ?? null;
    if (addButton) {
      collection = scope;
    }
    scope = scope.parentElement;
  }

  if (!addButton || !collection) {
    throw new Error(`Add button for repeat group "${linkIdOrLabel}" was not found`);
  }

  assertInteractive(addButton, linkIdOrLabel);

  const repeatCollection = collection;
  const repeatAddButton = addButton;
  const instanceSelector = `[data-linkid="${linkId}"]`;
  const instanceCountBefore =
    repeatCollection.querySelectorAll<HTMLElement>(instanceSelector).length;

  await act(async () => {
    fireEvent.click(repeatAddButton);
  });

  await waitFor(
    () => {
      const countAfter = repeatCollection.querySelectorAll<HTMLElement>(instanceSelector).length;
      if (countAfter <= instanceCountBefore) {
        throw new Error(`Repeat group "${linkIdOrLabel}" did not add an instance`);
      }
    },
    { timeout: 5000 }
  );

  const instancesAfter = Array.from(collection.querySelectorAll<HTMLElement>(instanceSelector));
  const newInstance = instancesAfter[instancesAfter.length - 1];
  if (!newInstance) {
    throw new Error(`Repeat group "${linkIdOrLabel}" did not add an instance`);
  }

  return newInstance;
}

/**
 * Removes the repeat instance identified by `instanceContainer` (as returned by
 * `addRepeatGroup` or `findByLinkIdOrLabel`) using that instance's own remove button, and waits
 * for the removal to complete. Fails when the instance has no enabled remove button (e.g. the
 * remaining empty placeholder of a repeat group).
 */
export async function removeRepeatGroup(instanceContainer: HTMLElement) {
  const linkId = instanceContainer.getAttribute('data-linkid') ?? 'repeat group';

  // The instance's remove button is a sibling of the instance wrapper in the repeat collection
  // stack. Walk up from the instance and pick the first remove button outside the instance
  // itself; remove buttons inside the instance belong to nested repeat groups.
  let scope: HTMLElement | null = instanceContainer;
  let removeButton: HTMLButtonElement | null = null;
  while (scope && !removeButton) {
    removeButton =
      Array.from(scope.querySelectorAll<HTMLButtonElement>('span[role="button"] button')).find(
        (button) => !instanceContainer.contains(button)
      ) ?? null;
    scope = scope.parentElement;
  }

  if (!removeButton) {
    throw new Error(`Remove button for repeat instance "${linkId}" was not found`);
  }

  assertInteractive(removeButton, linkId);

  await act(async () => {
    fireEvent.click(removeButton);
  });

  // The instance's Collapse closes; MUI marks the collapsed section hidden once the transition
  // completes. The generous timeout covers slow removal transitions under load.
  await waitFor(
    () => {
      const collapse = instanceContainer.closest('.MuiCollapse-root') as HTMLElement | null;
      const isRemoved =
        !instanceContainer.isConnected ||
        (collapse !== null && collapse.style.visibility.includes('hidden'));
      if (!isRemoved) {
        throw new Error(`Repeat instance "${linkId}" was not removed`);
      }
    },
    { timeout: 10000 }
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

  assertInteractive(inputDate, linkId);
  assertInteractive(inputTime, linkId);
  assertInteractive(inputAmPm, linkId);

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

  assertInteractive(checkbox, linkId);

  const checkboxInput = checkbox as HTMLInputElement;
  if (!checkboxInput.checked) {
    await act(async () => {
      fireEvent.click(checkboxInput);
    });
  }

  // Confirm the click actually checked the option instead of silently doing nothing.
  await waitFor(() => {
    if (!checkboxInput.checked) {
      throw new Error(
        `Checkbox option "${text}" for "${linkId}" was not checked after interaction`
      );
    }
  });

  // Here we await for debounced store update
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
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
