import { screen, fireEvent } from '@testing-library/react';

export async function chooseSelectOption(questionId: string, optionLabel: string) {
  const questionElement = await screen.findByTestId(questionId);
  const input = questionElement.querySelector('input');
  if (!input) throw new Error(`Input not found in question ${questionId}`);
  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 40 });

  const optionLabelMatcher = (_content: string, element: Element | null) =>
    element?.textContent === optionLabel;
  const option = await screen.findByText(optionLabelMatcher, {
    selector: '.react-select__option'
  });

  fireEvent.click(option);
  await screen.findByText(optionLabelMatcher, {
    selector: '.react-select__single-value,.react-select__multi-value'
  });
}
