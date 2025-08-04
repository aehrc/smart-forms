import { fireEvent, screen } from '@testing-library/react';

export async function inputText(canvasElement: HTMLElement, linkId: string, mytext: string) {
  const questionElement = await canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input)
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);

  fireEvent.change(input, { target: { value: mytext } });
}

export async function chooseSelectOption(
  canvasElement: HTMLElement,
  linkId: string,
  optionLabel: string
) {
  const questionElement = await canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input = questionElement?.querySelector('input');

  if (!input) throw new Error(`There is no input inside [data-linkid=${linkId}] block`);

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 40 });
  console.log(screen);
  console.log(canvasElement);
  const option = await screen.findByText(optionLabel);
  fireEvent.click(option);

  if ((input.value = optionLabel)) return;

  throw new Error(`Option ${optionLabel} was not set into input value`);
}
