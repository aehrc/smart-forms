import { describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { questionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import type { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r4';
import {
  BehavioralTestWrapper,
  getInputText,
  inputText,
  invokeExtract
} from '@aehrc/questionnaire-test-toolkit';
import type {
  BehavioralTestWrapperProps,
  RequestDefinition
} from '@aehrc/questionnaire-test-toolkit';
import { contextQuestionnaire } from './fixtures/contextQuestionnaire';
import {
  repeatQuestionnaire,
  savedResponseA,
  savedResponseB
} from './fixtures/repeatQuestionnaire';

const patient: Patient = { resourceType: 'Patient', id: 'patient-1' };
const jane: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-1',
  name: [{ family: 'Smith' }]
};
const roleOne = {
  resourceType: 'PractitionerRole',
  id: 'role-1',
  location: [{ reference: 'Location/clinic-1' }]
} as const;
const requestDefinitions: RequestDefinition[] = [
  { urlPrefix: 'PractitionerRole/role-1', responseBody: roleOne }
];
const fhirContext = [
  { type: 'PractitionerRole', reference: 'PractitionerRole/role-1' }
] as BehavioralTestWrapperProps['fhirContext'];

const savedContextResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'user-initial',
      answer: [{ valueString: 'Saved Name' }]
    }
  ]
};

// String fields render as textareas; capture both input and textarea descendants. MUI renders a
// hidden mirror textarea (aria-hidden) for autosizing — exclude it.
function fieldValues(container: HTMLElement, linkId: string): string[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      `[data-linkid="${linkId}"] input, [data-linkid="${linkId}"] textarea`
    )
  )
    .filter((field) => !field.hasAttribute('aria-hidden'))
    .map((field) => field.value);
}

describe('BehavioralTestWrapper saved responses', () => {
  test('loads saved answers and repeated groups without a patient', async () => {
    const { container } = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    const medNames = fieldValues(container, 'med-name');
    const medDoses = fieldValues(container, 'med-dose');

    expect(medNames).toHaveLength(2);
    expect(medNames[0]).toBe('Paracetamol');
    expect(medNames[1]).toBe('Ibuprofen');

    // Doses stay associated with their own repeat instance.
    expect(medDoses).toHaveLength(2);
    expect(medDoses[0]).toBe('500mg');
    expect(medDoses[1]).toBe('200mg');
  });

  test('saved answers win over population while launch context still resolves', async () => {
    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        questionnaireResponse={savedContextResponse}
        patient={patient}
        user={jane}
        fhirContext={fhirContext}
        requestDefinitions={requestDefinitions}
      />
    );

    // The saved answer takes precedence over the %user initial expression that population would
    // have generated.
    await waitFor(async () => {
      expect(await getInputText(container, 'User initial')).toBe('Saved Name');
    });

    // Calculated expressions still resolve from the populated launch context.
    await waitFor(async () => {
      expect(await getInputText(container, 'User calc')).toBe('Smith');
    });
    await waitFor(async () => {
      expect(await getInputText(container, 'Role calc')).toBe('Location/clinic-1');
    });
  });

  test('rerendering with a different saved response rebuilds the form', async () => {
    const { container, rerender } = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    rerender(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseB} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Second notes');
    });

    const medNames = fieldValues(container, 'med-name');
    expect(medNames).toHaveLength(1);
    expect(medNames[0]).toBe('Aspirin');
  });

  test('a later mount does not leak the previous saved response', async () => {
    const first = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );
    await waitFor(async () => {
      expect(await getInputText(first.container, 'Notes')).toBe('Baseline notes');
    });
    first.unmount();

    const second = render(<BehavioralTestWrapper questionnaire={repeatQuestionnaire} />);
    await waitFor(async () => {
      expect(await getInputText(second.container, 'Notes')).toBe('');
    });
    // A fresh form renders a single empty repeat placeholder with no answers.
    expect(fieldValues(second.container, 'med-name')).toEqual(['']);
  });

  test('changing only the comparison response keeps unsaved edits and uses the new baseline', async () => {
    const onExtractResult = vi.fn();
    const { container, rerender } = render(
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedResponseA}
        comparisonSourceResponse={savedResponseA}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    await inputText(container, 'Notes', 'Edited notes');

    // Modified-only extraction against the original saved response: only the edited answer is
    // extracted; the unchanged repeat answers produce no resources.
    const editedBundle = await invokeExtract(container, onExtractResult);
    expect(editedBundle.entry).toHaveLength(1);
    expect(editedBundle.entry?.[0].resource).toMatchObject({
      resourceType: 'Observation',
      code: { text: 'Notes' },
      valueString: 'Edited notes'
    });

    // Switch the baseline without rebuilding: the unsaved edit must survive...
    const newBaseline = structuredClone(savedResponseA);
    const notesItem = newBaseline.item?.[0]?.item?.find((item) => item.linkId === 'notes');
    notesItem!.answer = [{ valueString: 'Edited notes' }];

    rerender(
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedResponseA}
        comparisonSourceResponse={newBaseline}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Edited notes');
    });

    // ...and the next extraction must use the new baseline, finding no changes.
    const unchangedBundle = await invokeExtract(container, onExtractResult);
    expect(unchangedBundle.entry ?? []).toHaveLength(0);
  });

  test('full extraction is retained when the comparison response is omitted', async () => {
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

    // No comparison source means full extraction: both repeat instances plus the notes.
    const bundle = await invokeExtract(container, onExtractResult);
    expect(bundle.entry).toHaveLength(3);
  });

  test('does not mutate the saved or comparison responses supplied by the caller', async () => {
    const savedFixture = structuredClone(savedResponseA);
    const comparisonFixture = structuredClone(savedResponseA);

    const onExtractResult = vi.fn();
    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedFixture}
        comparisonSourceResponse={comparisonFixture}
        onExtractResult={onExtractResult}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    await inputText(container, 'Notes', 'Edited notes');
    await invokeExtract(container, onExtractResult);

    const notesItem = savedFixture.item?.[0]?.item?.find((item) => item.linkId === 'notes');
    expect(notesItem?.answer?.[0].valueString).toBe('Baseline notes');
    expect(savedFixture.questionnaire).toBeUndefined();
    expect(comparisonFixture).toEqual(savedResponseA);
  });

  test('an edit is recorded in the renderer response after saved-response loading', async () => {
    const { container } = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    await inputText(container, 'Notes', 'Changed');

    await waitFor(() => {
      const qr = questionnaireResponseStore.getState().updatableResponse;
      const notesItem = qr?.item?.[0]?.item?.find((item) => item.linkId === 'notes');
      expect(notesItem?.answer?.[0].valueString).toBe('Changed');
    });
  });
});
