import { vi, beforeAll} from 'vitest';
import { render, waitFor, screen} from '@testing-library/react';
import { AboriginalForm, terminologyServerUrl } from './aboriginalFormUtils';
import { nonSnomedCondition, patient, condition, currentMedication, obsTobaccoSmokingStatus, obsBodyHeight, obsBodyWeight, obsHeartRate, obsHeartRhythm, nonSnomedAllergy, nonSnomedImmunization, obsWaistCircumference, obsBloodPressure } from './aboriginalFormIntegrationData';
import { findByLinkIdOrLabel, inputDate, inputText, invokeExtract, selectTab, findAllByLinkIdOrLabel, chooseSelectOption } from './testUtils';
import { FhirResource } from 'fhir/r4';
import {userEvent} from 'storybook/internal/test';

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
  test.only('Conditions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');
    const newDiagnosisContainer = await findByLinkIdOrLabel(container, 'New diagnosis');
    const conditionRow1: HTMLElement = newDiagnosisContainer.querySelector('tbody tr:nth-child(1)')!;
    expect(conditionRow1).toBeTruthy();
    await inputText(conditionRow1, 'Condition', 'Non-SNOMED condition');
    await inputDate(conditionRow1, 'Onset date', '10/10/2025');
    await inputText(conditionRow1, 'Comment', 'Test comment');

    const addRowButton = screen.getByTestId('AddIcon');
    await userEvent.click(addRowButton);

    const conditionRow2: HTMLElement = newDiagnosisContainer.querySelector('tbody tr:nth-child(2)')!;
    expect(conditionRow2).toBeTruthy();
    await chooseSelectOption(conditionRow2, 'Condition', 'Parkinson\'s disease');
    await inputDate(conditionRow2, 'Onset date', '10/10/2025');
    await inputText(conditionRow2, 'Comment', 'Test comment');
    
    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(2);
    // Verification status is not extracted
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedCondition, ['id', 'verificationStatus'])
    );

    expect(extractedBundle.entry?.[1]?.resource).toStrictEqual(
      omitResourceFields(condition, ['id', 'verificationStatus'])
    );


  });
  
  
  test('Medications', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });

    await selectTab(container, 'Regular medications');
    const newMedicationContainer = await findAllByLinkIdOrLabel(container, 'New medications');
    const medRow1 = newMedicationContainer[0]!;
    await inputText(medRow1, 'Medication', 'Paracetamol 500mg tablet');
    await inputText(medRow1, 'Dosage', 'Once daily, 10mg');
    await inputText(medRow1, 'Clinical indication', 'Clinical indication for medication');
    await inputText(medRow1, 'Comment', 'Patient should take with food');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(currentMedication, ['id'])
    );
  });

  test('Allergies/adverse reactions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const newAllergyContainer = await findAllByLinkIdOrLabel(container, 'New adverse reaction risks');
    const allergyRow1 = newAllergyContainer[0]!;
    await inputText(allergyRow1, 'Substance', 'Non-SNOMED allergen');
    await inputText(allergyRow1, 'Manifestation', 'Non-SNOMED reaction');
    await inputText(allergyRow1, 'Comment', 'Non-SNOMED allergy note');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedAllergy, ['id'])
    );

    
  });

  test('Substance use, including tobacco', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Substance use, including tobacco');
    const smokingStatusContainer = await findByLinkIdOrLabel(container, 'Smoking status');
    await chooseSelectOption(smokingStatusContainer, 'New status', 'Current smoker');
    await inputDate(smokingStatusContainer, 'New date', '01/12/2025');

    await new Promise(resolve => setTimeout(resolve, 30000));

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsTobaccoSmokingStatus, ['id'])
    );
  });

  test('Immunisations', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Immunisation');

    const vaccinesGivenToday = await findByLinkIdOrLabel(container, 'Vaccines given today');
    await inputText(vaccinesGivenToday, 'Vaccine', 'Non-SNOMED vaccine');
    await inputText(vaccinesGivenToday, 'Batch number', 'BATCH-456');
    await inputDate(vaccinesGivenToday, 'Administration date', '02/03/2026');
    await inputText(vaccinesGivenToday, 'Comment', 'Non-SNOMED immunisation comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedImmunization, ['id'])
    );
  });

  test('Examination', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const heightContainer = await findByLinkIdOrLabel(container, 'Height');
    await inputText(heightContainer, 'New result', '170');
    await inputDate(heightContainer, 'New result date', '20/11/2025');
    const weightContainer = await findByLinkIdOrLabel(container, 'Weight');
    await inputText(weightContainer, 'New result', '70');
    await inputDate(weightContainer, 'New result date', '21/11/2025');
    const waistCircumferenceContainer = await findByLinkIdOrLabel(container, 'Waist circumference');
    await inputText(waistCircumferenceContainer, 'New result', '90');
    await inputDate(waistCircumferenceContainer, 'New result date', '23/11/2025');
    const heartRateContainer = await findByLinkIdOrLabel(container, 'Heart rate');
    await inputText(heartRateContainer, 'New result', '72');
    await inputDate(heartRateContainer, 'New result date', '04/12/2025');
    const heartRhythmContainer = await findByLinkIdOrLabel(container, 'Heart rhythm');
    await chooseSelectOption(heartRhythmContainer, 'New result', 'Regular heart rhythm');
    await inputDate(heartRhythmContainer, 'New result date', '03/12/2025');
    const bloodPressureContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    await inputText(bloodPressureContainer, 'Systolic', '120');
    await inputText(bloodPressureContainer, 'Diastolic', '80');
    await inputDate(bloodPressureContainer, 'Date performed', '02/12/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(6);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsBodyHeight, ['id'])
    );

    expect(extractedBundle.entry?.[1]?.resource).toStrictEqual(
      omitResourceFields(obsBodyWeight, ['id'])
    );
    expect(extractedBundle.entry?.[2]?.resource).toStrictEqual(
      omitResourceFields(obsWaistCircumference, ['id'])
    );

    expect(extractedBundle.entry?.[3]?.resource).toStrictEqual(
      omitResourceFields(obsHeartRate, ['id'])
    );

    expect(extractedBundle.entry?.[4]?.resource).toStrictEqual(
      omitResourceFields(obsHeartRhythm, ['id'])
    );

    expect(extractedBundle.entry?.[5]?.resource).toStrictEqual(
      omitResourceFields(obsBloodPressure, ['id'])
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
