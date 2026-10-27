import { describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { inAppExtract } from '@aehrc/sdc-template-extract';
import type { InAppExtractOutput } from '@aehrc/sdc-template-extract';
import type { Observation, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import {
  BehavioralTestWrapper,
  getInputText,
  inputText,
  invokeExtract
} from '@aehrc/questionnaire-test-toolkit';
import { repeatQuestionnaire, savedResponseA } from './fixtures/repeatQuestionnaire';

const { originalInAppExtract } = vi.hoisted(() => {
  const originalInAppExtract: {
    current:
      | ((
          questionnaireResponse: QuestionnaireResponse,
          questionnaireOrCallback: Questionnaire,
          comparisonSourceResponse: QuestionnaireResponse | null
        ) => Promise<InAppExtractOutput>)
      | undefined;
  } = { current: undefined };
  return { originalInAppExtract };
});

vi.mock('@aehrc/sdc-template-extract', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aehrc/sdc-template-extract')>();
  originalInAppExtract.current = actual.inAppExtract;
  return {
    ...actual,
    inAppExtract: vi.fn(actual.inAppExtract)
  };
});

describe('invokeExtract synchronisation', () => {
  test('waits for the callback of the Save click it dispatched', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedResponseA}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    await inputText(container, 'Notes', 'First edit');
    const firstBundle = await invokeExtract(container, onExtractResult);
    const firstNotes = firstBundle.entry
      ?.map((entry) => entry.resource)
      .find((resource) => (resource as Observation | undefined)?.code?.text === 'Notes');
    expect(firstNotes).toMatchObject({ valueString: 'First edit' });

    await inputText(container, 'Notes', 'Second edit');

    // Delay the second extraction so that the previous onExtractResult call is still the most
    // recent one while the new extraction is pending.
    let releaseDelay: (() => void) | undefined;
    const inAppExtractMock = vi.mocked(inAppExtract);
    inAppExtractMock.mockImplementationOnce(async (qr, q, comparison) => {
      await new Promise<void>((resolve) => {
        releaseDelay = resolve;
      });
      return originalInAppExtract.current!(qr, q as Questionnaire, comparison);
    });

    let secondExtractResolved = false;
    const secondExtractPromise = invokeExtract(container, onExtractResult);
    void secondExtractPromise.then(() => {
      secondExtractResolved = true;
    });

    // The delayed second extraction is now in flight. The helper must not accept the previous
    // callback as this click's result.
    await waitFor(() => {
      expect(releaseDelay).toBeDefined();
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(secondExtractResolved).toBe(false);

    releaseDelay!();

    const secondBundle = await secondExtractPromise;
    expect(secondExtractResolved).toBe(true);
    const secondNotes = secondBundle.entry
      ?.map((entry) => entry.resource)
      .find((resource) => (resource as Observation | undefined)?.code?.text === 'Notes');
    expect(secondNotes).toMatchObject({ valueString: 'Second edit' });
    expect(onExtractResult).toHaveBeenCalledTimes(2);
  });
});
