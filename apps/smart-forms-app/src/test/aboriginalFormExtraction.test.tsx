import { render } from '@testing-library/react';
import { AboriginalForm, runExtract } from './aboriginalFormUtils';
import { condition, patient, resolvedCondition } from './aboriginalFormIntegrationData';
import { FhirResource } from 'fhir/r4';

vi.mock('fhirclient', () => ({
  client: () => ({})
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Extraction workflow for', () => {
  test('Conditions', async () => {
    const { container } = render(<AboriginalForm patient={patient} requestDefinitions={[]} />);

    // Fill condition table with data from condition
    // Fill condition table with data from resolvedCondition

    const extractedBundle = await runExtract({}, {});
    expect(extractedBundle.entry).toHaveLength(2);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(removeId(condition));
    expect(extractedBundle.entry?.[1]?.resource).toStrictEqual(removeId(resolvedCondition));
  });
});

function removeId(resource: FhirResource) {
  const { id, ...resourceWithoutId } = resource;
  return resourceWithoutId;
}
