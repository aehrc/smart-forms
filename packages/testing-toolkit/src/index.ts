import { fireEvent, screen } from '@testing-library/react';

export async function inputText(canvasElement: any, linkId: string, mytext: string) {
  const questionElement = await canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input = questionElement.querySelector('input') ?? questionElement.querySelector('textarea');

  if (!input) throw new Error('Input bug');

  fireEvent.change(input, { target: { value: mytext } });
}

export async function chooseSelectOption(canvasElement: any, linkId: string, optionLabel: string) {
  const questionElement = await canvasElement.querySelector(`[data-linkid=${linkId}]`);
  const input = questionElement.querySelector('input');

  if (!input) throw new Error('Input bug');

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 40 });

  const option = await screen.findByText(optionLabel);
  fireEvent.click(option);

  if ((input.value = optionLabel)) return;

  throw new Error('Option test failed');
}
