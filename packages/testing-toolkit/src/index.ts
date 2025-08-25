import { fireEvent, screen, waitFor } from '@testing-library/react';

interface DefaultInputProps {
  canvasElement: HTMLElement;
  linkId: string;
  text: string | boolean;
}

export async function inputText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean | number
) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.change(input, { target: { value: text } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function inputFile(
  canvasElement: HTMLElement,
  linkId: string,
  files: File | File[],
  text: string[]
) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input = questionElement?.querySelector<HTMLInputElement>('input');
  const textarea = questionElement?.querySelectorAll<HTMLInputElement>('textarea');

  fireEvent.change(textarea[0], { target: { value: text[0] } });
  fireEvent.change(textarea[2], { target: { value: text[1] } });

  if (!input) {
    throw new Error(`File input was not found inside [data-linkid=${linkId}] block`);
  }
  const fileList = Array.isArray(files) ? files : [files];
  fireEvent.change(input, { target: { files: fileList } });

  // ждём debounce/обновление стора
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function inputDate({ canvasElement, linkId, text }: DefaultInputProps) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputTime(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputReference({ canvasElement, linkId, text }: DefaultInputProps) {
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

export async function inputDateTime(canvasElement: HTMLElement, linkId: string, text: string[]) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const inputs =
    questionElement?.querySelectorAll('input') ?? questionElement?.querySelectorAll('textarea');

  if (inputs.length === 0) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.change(inputs[0], { target: { value: text[0] } });
  fireEvent.change(inputs[1], { target: { value: text[1] } });
  fireEvent.change(inputs[2], { target: { value: text[2] } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function chooseRadioOption(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const radio =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!radio) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.click(radio);
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getInputText(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  return input.value;
}
export async function getInput(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  return input;
}

export async function chooseSelectOption(
  canvasElement: HTMLElement,
  linkId: string,
  optionLabel: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const input = questionElement.querySelector('input, textarea');
  if (!input) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

  const option = await screen.findByText(optionLabel);
  fireEvent.click(option);
}

async function findByLinkId(canvasElement: HTMLElement, linkId: string) {
  const selector = `[data-linkid="${linkId}"]`;
  return await waitFor(() => {
    const el = canvasElement.querySelector(selector);
    if (!el) {
      throw new Error(`Element ${selector} not found`);
    }
    return el;
  });
}
