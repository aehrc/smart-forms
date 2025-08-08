import { fireEvent, screen } from '@testing-library/react';

export async function inputText(canvasElement: HTMLElement, linkId: string, mytext: string) {
  const questionElement = canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input)
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);

  fireEvent.change(input, { target: { value: mytext } });
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getInputText(canvasElement: HTMLElement, linkId: string) {
  const questionElement = canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input)
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  return input.value;
}

export async function chooseSelectOption(
  canvasElement: HTMLElement,
  linkId: string,
  optionLabel: string
) {
  const questionElement = canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) throw new Error(`There is no input inside [data-linkid=${linkId}] block`);

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 40 });

  const option = await screen.findByText(optionLabel);

  fireEvent.click(option);
}
