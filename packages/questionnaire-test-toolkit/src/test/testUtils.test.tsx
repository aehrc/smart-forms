import { expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BehavioralTestWrapper, selectTab } from '@aehrc/questionnaire-test-toolkit';
import { questionnaire } from './fixtures/questionnaire';

test('selectTab keeps an expanded section open and opens a collapsed section', async () => {
  const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);

  for (let attempt = 0; attempt < 2; attempt++) {
    await selectTab(container, 'User tab');
    expect(
      container.querySelector('[data-label="User tab"] button')?.getAttribute('aria-expanded')
    ).toBe('true');
  }
  expect(
    container.querySelector('[data-label="Context tab"] button')?.getAttribute('aria-expanded')
  ).toBe('false');

  await selectTab(container, 'Context tab');
  await waitFor(() => {
    expect(
      container.querySelector('[data-label="Context tab"] button')?.getAttribute('aria-expanded')
    ).toBe('true');
  });
});

test('selectTab still clicks buttons without aria-expanded', async () => {
  let clicks = 0;
  const { container } = render(
    <div data-linkid="plain-tab">
      <button onClick={() => clicks++}>Plain tab</button>
    </div>
  );

  await selectTab(container, 'plain-tab');
  await selectTab(container, 'plain-tab');

  expect(clicks).toBe(2);
});
