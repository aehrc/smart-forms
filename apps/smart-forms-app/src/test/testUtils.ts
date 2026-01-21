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
import { fireEvent, screen, userEvent, waitFor } from 'storybook/internal/test';
import { questionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import { act } from 'react';

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

  await act(async () => {
    fireEvent.click(input);
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

export async function selectTab(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdOrLabel(canvasElement, linkId);
  const button = questionElement?.querySelector('button') ?? questionElement?.querySelector('[role="button"]');
  if (!button) {
    throw new Error(`Tab was not found inside ${`[data-linkid=${linkId}] block`}`);
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

  await act(async () => {
    fireEvent.click(radio);
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

  await act(async () => {
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
  });

  const option = await screen.findByText(optionLabel);

  await act(async () => {
    fireEvent.click(option);
  });
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
