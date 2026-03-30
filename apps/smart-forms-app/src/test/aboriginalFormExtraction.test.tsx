import { vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AboriginalForm, terminologyServerUrl } from './aboriginalFormUtils';
import { nonSnomedCondition, patient } from './aboriginalFormIntegrationData';
import { findByLinkIdOrLabel, inputDate, inputText, invokeExtract, selectTab } from './testUtils';
import { FhirResource } from 'fhir/r4';

vi.mock('fhirclient', async () => {
  const actual = await vi.importActual<typeof import('fhirclient')>('fhirclient');
  const mockedRequest = vi.fn(() => Promise.resolve({}));

  return {
    ...actual,
    client: (input: string | { serverUrl?: string }) => {
      const actualClient = actual.client(input as never);
      const serverUrl = typeof input === 'string' ? input : input?.serverUrl;

      if (serverUrl === terminologyServerUrl) {
        return actualClient;
      }

      return {
        ...actualClient,
        request: mockedRequest
      };
    }
  };
});

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Extraction workflow for', () => {
  test('Conditions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');
    const newDiagnosisContainer = await findByLinkIdOrLabel(container, 'New diagnosis');
    await inputText(newDiagnosisContainer, 'Condition', 'Non-SNOMED condition');
    await inputDate(newDiagnosisContainer, 'Onset date', '10/10/2025');
    await inputText(newDiagnosisContainer, 'Comment', 'Test comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    // Verification status is not extracted
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedCondition, ['id', 'verificationStatus'])
    );
  });
});

function omitResourceFields<T extends FhirResource>(resource: T, fieldsToRemove: (keyof T)[]) {
  const resourceCopy = { ...resource };
  fieldsToRemove.forEach((field) => {
    delete resourceCopy[field];
  });
  return resourceCopy;
}
