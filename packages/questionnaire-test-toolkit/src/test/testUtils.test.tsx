import { expect, test, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { BehavioralTestWrapper, selectTab } from '@aehrc/questionnaire-test-toolkit';
import { rendererConfigStore } from '@aehrc/smart-forms-renderer';
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

async function renderDesktopTabs() {
  // Every media query matches, so the renderer shows its desktop tab list.
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: true,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false
  }));
  // jsdom cannot scroll; the tab click calls window.scrollTo.
  vi.stubGlobal('scrollTo', () => {});
  const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
  await waitFor(() => {
    expect(container.querySelector('[data-test="renderer-tab-list"]')).toBeTruthy();
  });
  return container;
}

function contextField(container: HTMLElement) {
  const input = container.querySelector<HTMLTextAreaElement>(
    '#tabpanel-1 [data-linkid="role-location"] textarea'
  );
  if (!input) throw new Error('Expected the role-location field');
  return input;
}

test('selectTab returns after the desktop tab heading takes focus', async () => {
  const container = await renderDesktopTabs();

  await selectTab(container, 'Context tab');
  const input = contextField(container);
  await act(async () => {
    input.focus();
  });

  // The renderer moves focus to the panel heading 100 ms after the click. A field the test
  // focuses once selectTab has returned must keep focus past that delay.
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(document.activeElement).toBe(input);
});

test('selectTab does not wait for heading focus when the renderer disables it', async () => {
  rendererConfigStore.getState().setRendererConfig({ disableHeadingFocusOnTabSwitch: true });
  try {
    const container = await renderDesktopTabs();

    // Returns without waiting for a focus change that never comes, which would time out.
    await selectTab(container, 'Context tab');
    contextField(container);
    expect(document.activeElement).toBe(document.body);
  } finally {
    cleanup();
    rendererConfigStore.getState().setRendererConfig({ disableHeadingFocusOnTabSwitch: false });
  }
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
