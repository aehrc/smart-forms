import { beforeAll, describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { populateQuestionnaire, type FetchResourceCallback } from '@aehrc/sdc-populate';
import type { Encounter, FhirResource, Patient, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import {
  checkRadioOption,
  getInputText,
  inputDecimal,
  inputText,
  invokeExtract,
  removeRepeatGroup,
  selectTab
} from '@aehrc/questionnaire-test-toolkit';
import { AboriginalForm } from './aboriginalFormUtils';
import {
  aboutTheHealthCheckInProgressQuestionnaireResponse,
  aboutTheHealthCheckQuestionnaireResponse,
  currentMedication,
  makeSearchSetBundle,
  nonSnomedMedication,
  obsBloodPressure,
  obsHeartRate,
  patient
} from './aboriginalFormIntegrationData';
import { QRAboriginalTorresStraitIslanderHealthCheck } from './data-shared/QRAboriginalTorresStraitIslanderHealthCheck';
import aboriginalQuestionnaire from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const encounterFixture: Encounter = {
  resourceType: 'Encounter',
  id: 'enc-1',
  status: 'finished',
  class: { code: 'AMB' }
};

interface AcceptanceFixture {
  latestQuestionnaireResponses?: QuestionnaireResponse[];
  completedQuestionnaireResponses?: QuestionnaireResponse[];
  conditions?: FhirResource[];
  medicationStatements?: FhirResource[];
  allergyIntolerances?: FhirResource[];
  immunizations?: FhirResource[];
  observationsByCode?: Record<string, FhirResource[]>;
  encounters?: Record<string, FhirResource>;
}

/**
 * Strict population seam for acceptance cases. Serves each x-fhir-query with a server-shaped
 * searchset Bundle (explicit empty Bundles for expected empty searches) and rejects unexpected
 * queries so population requests are verified rather than silently swallowed.
 */
function buildAcceptanceCallback(fixture: AcceptanceFixture): {
  callback: FetchResourceCallback;
  queries: string[];
} {
  const queries: string[] = [];

  const callback: FetchResourceCallback = async (query) => {
    queries.push(query);

    const [path, queryString] = query.split('?');
    const params = new URLSearchParams(queryString ?? '');

    if (path === 'QuestionnaireResponse') {
      const responses =
        params.get('status') === 'completed'
          ? (fixture.completedQuestionnaireResponses ?? [])
          : (fixture.latestQuestionnaireResponses ?? []);
      return makeSearchSetBundle(responses);
    }

    if (path === 'Observation') {
      const code = params.get('code');
      return makeSearchSetBundle(code ? (fixture.observationsByCode?.[code] ?? []) : []);
    }

    if (path === 'Condition') {
      return makeSearchSetBundle(fixture.conditions ?? []);
    }

    if (path === 'MedicationStatement') {
      return makeSearchSetBundle(fixture.medicationStatements ?? []);
    }

    if (path === 'AllergyIntolerance') {
      return makeSearchSetBundle(fixture.allergyIntolerances ?? []);
    }

    if (path === 'Immunization') {
      return makeSearchSetBundle(fixture.immunizations ?? []);
    }

    if (path.startsWith('Encounter/')) {
      const encounter = fixture.encounters?.[path];
      if (encounter) {
        return encounter;
      }
    }

    throw new Error(`Unexpected population query: ${query}`);
  };

  return { callback, queries };
}

function queryCount(queries: string[], prefix: string): number {
  return queries.filter((query) => query.startsWith(prefix)).length;
}

describe('Health Check acceptance', () => {
  test('About fixtures serve separate server-shaped results per population query', async () => {
    const { callback, queries } = buildAcceptanceCallback({
      latestQuestionnaireResponses: [aboutTheHealthCheckInProgressQuestionnaireResponse],
      completedQuestionnaireResponses: [aboutTheHealthCheckQuestionnaireResponse]
    });

    const { container } = render(
      <AboriginalForm patient={patient} fetchResourceCallback={callback} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });

    // Population queried both the any-status and the completed QuestionnaireResponse searches
    // separately and each received its own server-shaped result.
    expect(queryCount(queries, 'QuestionnaireResponse?')).toBe(2);
    expect(
      queries.some(
        (query) => query.startsWith('QuestionnaireResponse?') && query.includes('status=completed')
      )
    ).toBe(true);

    await selectTab(container, 'About the health check');

    // The latest any-status response is in-progress, so the already-in-progress flag is checked.
    await waitFor(() => {
      const checkbox = container.querySelector<HTMLInputElement>(
        '[data-linkid="5960c096-d5f7-4745-bd74-44ff2775bde9"] input'
      );
      expect(checkbox?.checked).toBe(true);
    });

    // The completed-only search resolved independently of the any-status search.
    await waitFor(async () => {
      expect(await getInputText(container, 'Date of last completed health check')).toBe(
        '01/03/2026'
      );
    });
  });

  test('resumes an in-progress Health Check', async () => {
    const { callback } = buildAcceptanceCallback({
      latestQuestionnaireResponses: [aboutTheHealthCheckInProgressQuestionnaireResponse],
      completedQuestionnaireResponses: [aboutTheHealthCheckQuestionnaireResponse]
    });

    const savedResponse = structuredClone(QRAboriginalTorresStraitIslanderHealthCheck);

    const { container } = render(
      <AboriginalForm
        patient={patient}
        questionnaireResponse={savedResponse}
        fetchResourceCallback={callback}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });

    await selectTab(container, 'Patient Details');
    await waitFor(async () => {
      expect(await getInputText(container, 'Name')).toBe('Repop, Kimberly');
    });

    // Additional answers can still be entered.
    await inputText(container, 'Preferred name', 'Kim');
    await waitFor(async () => {
      expect(await getInputText(container, 'Preferred name')).toBe('Kim');
    });
  });

  test('amends a completed Health Check against an explicit fresh-population baseline', async () => {
    const { callback } = buildAcceptanceCallback({
      observationsByCode: {
        '8867-4': [obsHeartRate],
        '85354-9': [obsBloodPressure]
      }
    });

    // Production prepares its comparison through fresh population; the test supplies that
    // baseline explicitly.
    const populateResult = await populateQuestionnaire({
      questionnaire: aboriginalQuestionnaire as Questionnaire,
      patient,
      fetchResourceCallback: callback,
      fetchResourceRequestConfig: { sourceServerUrl: 'http://mock.example' }
    });
    expect(populateResult.populateSuccess).toBe(true);

    const baseline = populateResult.populateResult!.populatedResponse;
    const savedCompleted = structuredClone(baseline);
    savedCompleted.status = 'completed';

    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        questionnaireResponse={savedCompleted}
        comparisonSourceResponse={baseline}
        fetchResourceCallback={callback}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });
    await selectTab(container, 'Examination');

    // One changed result: the existing heart rate stays as-is, the new result is entered.
    await inputDecimal(container, 'obs-heartrate-newresult', 96);

    const extractedBundle = await invokeExtract(container, onExtractResult);

    // Modified-only extraction against the baseline contains exactly the changed observation;
    // the unchanged blood pressure and heart rate resources are absent.
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request?.method).toBe('POST');
    expect(extractedBundle.entry?.[0]?.resource).toMatchObject({
      resourceType: 'Observation',
      code: {
        coding: expect.arrayContaining([{ system: 'http://loinc.org', code: '8867-4' }])
      },
      valueQuantity: { value: 96 }
    });
    expect(
      extractedBundle.entry?.some((entry) => JSON.stringify(entry.resource).includes('85354-9'))
    ).toBe(false);
  });

  test('removes the first of two medications and keeps the second associated', async () => {
    const { callback } = buildAcceptanceCallback({
      medicationStatements: [currentMedication, nonSnomedMedication]
    });

    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        fetchResourceCallback={callback}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });
    await selectTab(container, 'Regular medications');

    const medicationFieldElements = () =>
      Array.from(
        container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          '[data-linkid="regularmedications-summary-current-medication"] input, [data-linkid="regularmedications-summary-current-medication"] textarea'
        )
      ).filter((field) => !field.hasAttribute('aria-hidden'));

    const medicationFields = () => medicationFieldElements().map((field) => field.value);

    await waitFor(() => {
      expect(medicationFields()).toHaveLength(2);
    });
    expect(medicationFields()[0]).toContain('Paracetamol');

    // Each instance is the innermost group box around its medication field.
    const instanceContainers = Array.from(
      new Set(
        medicationFieldElements()
          .map((field) => field.closest('[data-linkid="regularmedications-summary-current"]'))
          .filter((el): el is HTMLElement => el !== null)
      )
    );
    expect(instanceContainers).toHaveLength(2);

    await removeRepeatGroup(instanceContainers[0]!);

    await waitFor(() => {
      const remaining = medicationFields();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toContain('Non-SNOMED medication');
    });

    // Extraction contains no removed answer.
    const extractedBundle = await invokeExtract(container, onExtractResult);
    const medicationEntries = extractedBundle.entry?.filter(
      (entry) => entry.resource?.resourceType === 'MedicationStatement'
    );
    expect(medicationEntries?.length ?? 0).toBe(0);
  });

  test('enables, disables and re-enables a conditional question', async () => {
    const { callback } = buildAcceptanceCallback({});

    // The caregiver group is only shown for patients aged 24 or younger
    // (enableWhenExpression `%age <= 24`).
    const youngPatient: Patient = { ...patient, birthDate: '2021-06-14' };

    const { container } = render(
      <AboriginalForm patient={youngPatient} fetchResourceCallback={callback} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });
    await selectTab(container, 'Consent');

    // Wait for the Consent tab content to render before interacting with it.
    await waitFor(() => {
      expect(
        container.querySelector('[data-label="Parent/primary caregiver is present for health check?"]')
      ).not.toBeNull();
    }, { timeout: 10000 });

    // The relationship question is hidden until the caregiver question is answered Yes.
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')).toBeNull();
    });

    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'Yes');

    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).not.toBeNull();
    });

    await inputText(container, 'Relationship to child', 'Mother');

    // Disable: selecting No hides the question again.
    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'No');
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')).toBeNull();
    });

    // Re-enable: the question renders again.
    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'Yes');
    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).not.toBeNull();
    });
  });

  test('reports age from explicit DOBs before, on and after the birthday under a fixed Date', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });

    try {
      for (const [birthDate, expectedAge] of [
        ['2021-06-14', '5'],
        ['2021-06-15', '4'],
        ['2021-06-16', '4']
      ] as const) {
        vi.setSystemTime(new Date('2026-06-15T12:00:00+10:00'));

        const { callback } = buildAcceptanceCallback({});
        const agePatient: Patient = { ...patient, birthDate };

        const { container, unmount } = render(
          <AboriginalForm patient={agePatient} fetchResourceCallback={callback} />
        );

        await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
          timeout: 10000
        });
        await selectTab(container, 'Patient Details');

        // The questionnaire's age expression reports yearDiff - 1 on the birthday itself (strict
        // month/day comparison; see .scratch/SHC_TOOLKIT_DEFECTS.md), hence '4' for the exact
        // birthday. The day before/after match the clinical expectation of 5 and 4.
        await waitFor(async () => {
          expect(await getInputText(container, 'Age')).toBe(expectedAge);
        });

        unmount();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  test('resolves an Encounter supplied through the existing fhirContext prop', async () => {
    const { callback, queries } = buildAcceptanceCallback({
      encounters: { 'Encounter/enc-1': encounterFixture }
    });

    const { container } = render(
      <AboriginalForm
        patient={patient}
        fhirContext={[{ type: 'Encounter', reference: 'Encounter/enc-1' }]}
        fetchResourceCallback={callback}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 10000
    });

    expect(queries).toContain('Encounter/enc-1');
  });
});
