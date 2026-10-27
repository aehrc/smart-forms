import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { populateQuestionnaire, type FetchResourceCallback } from '@aehrc/sdc-populate';
import type {
  Encounter,
  FhirResource,
  Patient,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
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

  // Independent request contract, not generated from the questionnaire being tested. Empty
  // results are allowed only for these exact searches, including all required patient/filters.
  const patientFilter = `patient=${patient.id}`;
  const latestQuery = `QuestionnaireResponse?questionnaire=http://www.health.gov.au/assessments/mbs/715&_count=1&_sort=-authored&${patientFilter}`;
  const searches: Array<[string, FhirResource[]]> = [
    [latestQuery, fixture.latestQuestionnaireResponses ?? []],
    [`${latestQuery}&status=completed`, fixture.completedQuestionnaireResponses ?? []],
    [
      `Condition?${patientFilter}&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item`,
      fixture.conditions ?? []
    ],
    [
      `MedicationStatement?${patientFilter}&status=active&_include=MedicationStatement:medication`,
      fixture.medicationStatements ?? []
    ],
    [`AllergyIntolerance?${patientFilter}`, fixture.allergyIntolerances ?? []],
    [`Immunization?${patientFilter}&status=completed`, fixture.immunizations ?? []]
  ];
  const observationCodes = [
    '85354-9',
    '1747861000168109',
    '8280-0',
    '8867-4',
    '364074009',
    '8302-2',
    '29463-7',
    '9843-4',
    '14647-2',
    '14646-4',
    '441829007'
  ];
  for (const code of observationCodes) {
    searches.push([
      `Observation?code=${code}&_sort=-date&${patientFilter}`,
      fixture.observationsByCode?.[code] ?? []
    ]);
  }

  // Canonicalize parameter order/encoding only: retain duplicate, missing and extra parameters
  // so none can accidentally match an expected request.
  function queryKey(query: string): string {
    const separator = query.indexOf('?');
    if (separator === -1) {
      return query;
    }
    const params = new URLSearchParams(query.slice(separator + 1));
    params.sort();
    return `${query.slice(0, separator)}?${params.toString()}`;
  }

  const responses = new Map<string, FhirResource>([
    ...searches.map(([query, resources]): [string, FhirResource] => [
      queryKey(query),
      makeSearchSetBundle(resources)
    ]),
    ...Object.entries(fixture.encounters ?? {})
  ]);
  const callback: FetchResourceCallback = async (query) => {
    queries.push(query);
    const response = responses.get(queryKey(query));
    if (!response) {
      throw new Error(`Unexpected population query: ${query}`);
    }
    return response;
  };

  return { callback, queries };
}

function queryCount(queries: string[], prefix: string): number {
  return queries.filter((query) => query.startsWith(prefix)).length;
}

describe('strict acceptance population adapter', () => {
  const requestConfig = { sourceServerUrl: 'http://mock.example' };
  const latestQuery =
    'QuestionnaireResponse?questionnaire=http://www.health.gov.au/assessments/mbs/715&_count=1&_sort=-authored&patient=patient-123';

  test.each([
    latestQuery.replace('patient-123', 'wrong-patient'),
    latestQuery.replace('&patient=patient-123', ''),
    latestQuery.replace('mbs/715', 'mbs/wrong'),
    latestQuery.replace('_count=1', '_count=2'),
    latestQuery.replace('_sort=-authored', '_sort=authored'),
    `${latestQuery}&status=in-progress`,
    `${latestQuery}&patient=wrong-patient`,
    `${latestQuery}&unexpected=true`,
    'Observation?code=8867-4&_sort=-date&patient=wrong-patient',
    'Observation?code=unknown-code&_sort=-date&patient=patient-123',
    'Observation?code=8867-4&patient=patient-123',
    'Condition?patient=wrong-patient&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item',
    'Condition?patient=patient-123',
    'Condition?patient=patient-123&category=wrong-category',
    'MedicationStatement?patient=wrong-patient&status=active&_include=MedicationStatement:medication',
    'MedicationStatement?patient=patient-123&status=active',
    'MedicationStatement?patient=patient-123&status=completed&_include=MedicationStatement:medication',
    'AllergyIntolerance?patient=wrong-patient',
    'Immunization?patient=wrong-patient&status=completed',
    'Immunization?patient=patient-123&status=not-done',
    'Encounter/unknown',
    'Encounter/enc-1?unexpected=true'
  ])('rejects unexpected query %s', async (query) => {
    const { callback } = buildAcceptanceCallback({
      encounters: { 'Encounter/enc-1': encounterFixture }
    });
    await expect(callback(query, requestConfig)).rejects.toThrow(
      `Unexpected population query: ${query}`
    );
  });

  test('accepts reordered/encoded filters and returns an explicit empty Bundle for a known code', async () => {
    const { callback } = buildAcceptanceCallback({});
    await expect(
      callback('Observation?patient=patient-123&_sort=%2Ddate&code=8867-4', requestConfig)
    ).resolves.toMatchObject({ resourceType: 'Bundle', type: 'searchset', entry: [] });
  });
});

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
    await waitFor(
      () => {
        expect(
          container.querySelector(
            '[data-label="Parent/primary caregiver is present for health check?"]'
          )
        ).not.toBeNull();
      },
      { timeout: 10000 }
    );

    // The relationship question is hidden until the caregiver question is answered Yes.
    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).toBeNull();
    });

    await checkRadioOption(
      container,
      'Parent/primary caregiver is present for health check?',
      'Yes'
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).not.toBeNull();
    });

    await inputText(container, 'Relationship to child', 'Mother');

    // Disable: selecting No hides the question again.
    await checkRadioOption(
      container,
      'Parent/primary caregiver is present for health check?',
      'No'
    );
    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).toBeNull();
    });

    // Re-enable: the question renders again.
    await checkRadioOption(
      container,
      'Parent/primary caregiver is present for health check?',
      'Yes'
    );
    await waitFor(() => {
      expect(
        container.querySelector('[data-linkid="b7d116f9-0425-4cf1-8cde-fbf4dfaee550"]')
      ).not.toBeNull();
    });
  });

  describe('age and eligibility boundaries at 15 June 2026', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-06-15T12:00:00+10:00'));
    });
    afterEach(() => vi.useRealTimers());

    async function renderPatient(birthDate: string) {
      const { callback } = buildAcceptanceCallback({});
      const agePatient: Patient = { ...patient, birthDate };
      const view = render(<AboriginalForm patient={agePatient} fetchResourceCallback={callback} />);
      await waitFor(() => expect(view.container.innerHTML).toContain('Patient Details'), {
        timeout: 10000
      });
      return view;
    }

    test.each([
      ['2021-06-16', '4'], // Day before the fifth birthday.
      ['2021-06-14', '5'] // Day after the fifth birthday.
    ])('DOB %s displays age %s', async (birthDate, expectedAge) => {
      const { container } = await renderPatient(birthDate);
      await selectTab(container, 'Patient Details');
      expect(await getInputText(container, 'Age')).toBe(expectedAge);
    });

    // Known questionnaire defect: strict MMDD comparison excludes the birthday itself.
    // Keep the correct outcome; test.fails also flags an unexpected pass when it is repaired.
    // See smart-forms/.scratch/SHC_TOOLKIT_DEFECTS.md, defect 1.
    test.fails('known regression: age is five on the fifth birthday', async () => {
      const { container } = await renderPatient('2021-06-15');
      await selectTab(container, 'Patient Details');
      expect(await getInputText(container, 'Age')).toBe('5');
    });

    async function expectCaregiverEligibility(birthDate: string, eligible: boolean) {
      const { container } = await renderPatient(birthDate);
      await selectTab(container, 'Consent');
      // Confirm the tab content has mounted before asserting an absent conditional section.
      await waitFor(() => {
        expect(
          container.querySelector('[data-linkid="d1e1ab3d-1c6c-430b-8ae7-af56b8f0af55"]')
        ).not.toBeNull();
      });
      await waitFor(() => {
        const caregiver = container.querySelector(
          '[data-linkid="80a6a405-49a4-44fb-bff3-212902096b95"]'
        );
        expect(caregiver !== null).toBe(eligible);
      });
    }

    // Independently specified policy: caregiver section applies through age 24, not age 25.
    test.each([
      ['2001-06-16', true], // Still 24, day before the 25th birthday.
      ['2001-06-14', false] // 25, day after the 25th birthday.
    ])('DOB %s has caregiver eligibility %s', expectCaregiverEligibility);

    test.fails(
      'known regression: caregiver section is ineligible on the 25th birthday',
      async () => {
        await expectCaregiverEligibility('2001-06-15', false);
      }
    );
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
