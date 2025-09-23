import { fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

export async function inputText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean | number
) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);

  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.change(input, { target: { value: text } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}
export async function checkCheckBox(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.click(input);

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function inputFile(
  canvasElement: HTMLElement,
  linkId: string,
  files: File | File[],
  url: string,
  filename: string
) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);
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

  fireEvent.change(textareaUrl, { target: { value: url } });
  fireEvent.change(textareaName, { target: { value: filename } });
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
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

export async function inputDateTime(
  canvasElement: HTMLElement,
  linkId: string,
  date: string,
  time: string,
  amPm: string
) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);
  console.log(questionElement, 777);
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

  fireEvent.change(inputDate, { target: { value: date } });
  fireEvent.change(inputTime, { target: { value: time } });
  fireEvent.change(inputAmPm, { target: { value: amPm } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function checkRadioOption(canvasElement: HTMLElement, linkId: string, text: string) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);
  const radio = questionElement?.querySelector(`span[data-test="radio-single-${text}"] input`);

  if (!radio) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.click(radio);
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getInputText(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);
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
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);

  const input = questionElement.querySelector('input, textarea');
  if (!input) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

  const option = await screen.findByText(optionLabel);
  fireEvent.click(option);
}
export async function chooseQuantityOption(
  canvasElement: HTMLElement,
  linkId: string,
  quantity: number | string,
  quantityComparator?: string
) {
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);

  const inputComaparator = questionElement.querySelector(
    'div[data-test=""q-item-quantity-comparator""] input'
  );
  const inputWeight = questionElement.querySelector('div[data-test="q-item-quantity-field"] input');

  if (!inputComaparator) {
    throw new Error(`There is no input inside ${linkId}`);
  }
  if (!inputWeight) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  fireEvent.focus(inputComaparator);
  fireEvent.keyDown(inputComaparator, { key: 'ArrowDown', code: 'ArrowDown' });

  if (quantityComparator) {
    const option = await screen.findByText(quantityComparator);
    fireEvent.click(option);
    fireEvent.change(inputComaparator, { target: { value: quantityComparator } });
  }

  fireEvent.change(inputWeight, { target: { value: quantity } });
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function findByLinkIdAndLabel(
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
  const questionElement = await findByLinkIdAndLabel(canvasElement, linkId);

  const textarea = questionElement?.querySelector(
    'div[data-test="q-item-radio-open-label-box"] textarea'
  );

  if (!textarea) {
    throw new Error(`Input or textarea was not found inside ${`[data-test=${linkId}] block`}`);
  }

  fireEvent.change(textarea, { target: { value: text } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}
