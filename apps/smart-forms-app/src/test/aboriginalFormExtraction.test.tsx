import { vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AboriginalForm, terminologyServerUrl } from './aboriginalFormUtils';
import {
  nonSnomedCondition,
  patient,
  condition,
  currentMedication,
  obsTobaccoSmokingStatus,
  obsBodyHeight,
  obsBodyWeight,
  obsHeartRate,
  obsHeartRhythm,
  nonSnomedAllergy,
  nonSnomedImmunization,
  obsWaistCircumference,
  obsBloodPressure,
  nonSnomedMedication,
  immunization,
  obsLengthHeight,
  allergy,
  makeSearchSetBundle,
  obsHeadCircumference
} from './aboriginalFormIntegrationData';
import {
  findByLinkIdOrLabel,
  inputDate,
  inputText,
  invokeExtract,
  selectTab,
  chooseSelectOption,
  checkRadioOption
} from './testUtils';
import { FhirResource, MedicationStatement } from 'fhir/r4';

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
  test('non-SNOMED conditions', async () => {
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
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedCondition, ['id', 'verificationStatus'])
    );
  });

  test('SNOMED conditions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');
    const newDiagnosisContainer = await findByLinkIdOrLabel(container, 'New diagnosis');

    await chooseSelectOption(newDiagnosisContainer, 'Condition', "Parkinson's disease");
    await inputDate(newDiagnosisContainer, 'Onset date', '10/10/2025');
    await inputText(newDiagnosisContainer, 'Comment', 'Test comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(condition, ['id', 'verificationStatus'])
    );
  });

  test('Change condition clinical status and abatement date', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'Condition',
            params: {},
            responseBody: makeSearchSetBundle([condition])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');
    const medicalHistorySummaryContainer = await findByLinkIdOrLabel(
      container,
      'Medical history summary'
    );
    await chooseSelectOption(medicalHistorySummaryContainer, 'Clinical status', 'Inactive');
    await inputDate(medicalHistorySummaryContainer, 'Abatement date', '01/04/2026');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `Condition/${condition.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'Condition'
            },
            {
              name: 'name',
              valueString: 'clinicalStatus'
            },
            {
              name: 'value',
              valueCodeableConcept: {
                coding: [
                  {
                    code: 'inactive',
                    display: 'Inactive',
                    system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
                  }
                ]
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Clinical status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'Condition'
            },
            {
              name: 'name',
              valueString: 'abatement'
            },
            {
              name: 'value',
              valueDateTime: '2026-04-01'
            },
            {
              name: 'pathLabel',
              valueString: 'Abatement date'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('non-SNOMED medications', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const newMedicationContainer = await findByLinkIdOrLabel(container, 'New medications');
    await inputText(newMedicationContainer, 'Medication', 'Non-SNOMED medication');
    await inputText(newMedicationContainer, 'Dosage', 'Once daily, 5mg');
    await inputText(
      newMedicationContainer,
      'Clinical indication',
      'Non-SNOMED clinical indication for medication'
    );
    await inputText(newMedicationContainer, 'Comment', 'Non-SNOMED medication note');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    const actualMedication = extractedBundle.entry?.[0]?.resource as MedicationStatement;
    expect(omitResourceFields(actualMedication, ['dateAsserted'])).toStrictEqual(
      omitResourceFields(nonSnomedMedication, ['id', 'dateAsserted'])
    );
  });

  test('SNOMED medications', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });

    await selectTab(container, 'Regular medications');
    const newMedicationContainer = await findByLinkIdOrLabel(container, 'New medications');
    await chooseSelectOption(newMedicationContainer, 'Medication', 'Paracetamol 500 mg tablet');
    await inputText(newMedicationContainer, 'Dosage', 'Once daily, 10mg');
    await chooseSelectOption(newMedicationContainer, 'Clinical indication', 'Iris tuck');
    await inputText(newMedicationContainer, 'Comment', 'Patient should take with food');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    const actualMedication = extractedBundle.entry?.[0]?.resource as MedicationStatement;
    expect(omitResourceFields(actualMedication, ['dateAsserted'])).toStrictEqual(
      omitResourceFields(currentMedication, ['id', 'dateAsserted'])
    );
  });

  test('Change medications status', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedication])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
    await chooseSelectOption(currentMedicationsContainer, 'Status', 'Completed');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `MedicationStatement/${currentMedication.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              valueCode: 'completed'
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.dosage[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueString: 'Once daily, 10mg'
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Patient should take with food'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Change medications dosage', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedication])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
    await inputText(currentMedicationsContainer, 'Dosage', 'Twice daily, 10mg');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `MedicationStatement/${currentMedication.id}`
    });

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              valueCode: 'active'
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.dosage[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueString: 'Twice daily, 10mg'
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Patient should take with food'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Add medications dosage', async () => {
    const currentMedicationWithoutDosage = omitResourceFields(currentMedication, ['dosage']);
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedicationWithoutDosage])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
    await inputText(currentMedicationsContainer, 'Dosage', 'Twice daily, 10mg');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `MedicationStatement/${currentMedication.id}`
    });

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              valueCode: 'active'
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'dosage'
            },
            {
              name: 'value',
              valueDosage: {
                text: 'Twice daily, 10mg'
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Patient should take with food'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Change medications comment', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedication])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
    await inputText(currentMedicationsContainer, 'Comment', 'Changed comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `MedicationStatement/${currentMedication.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              valueCode: 'active'
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.dosage[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueString: 'Once daily, 10mg'
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Changed comment'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Add medications comment', async () => {
    const currentMedicationWithoutComment = omitResourceFields(currentMedication, ['note']);
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedicationWithoutComment])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');
    const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
    await inputText(currentMedicationsContainer, 'Comment', 'Added comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `MedicationStatement/${currentMedication.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              valueCode: 'active'
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement.dosage[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueString: 'Once daily, 10mg'
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'note'
            },
            {
              name: 'value',
              valueAnnotation: {
                text: 'Added comment'
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('non-SNOMED allergies/adverse reactions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const newAllergyContainer = await findByLinkIdOrLabel(container, 'New adverse reaction risks');
    await inputText(newAllergyContainer, 'Substance', 'Non-SNOMED allergen');
    await inputText(newAllergyContainer, 'Manifestation', 'Non-SNOMED reaction');
    await inputText(newAllergyContainer, 'Comment', 'Non-SNOMED allergy note');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(nonSnomedAllergy, ['id'])
    );
  });

  test('SNOMED allergies/adverse reactions', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const newAllergyContainer = await findByLinkIdOrLabel(container, 'New adverse reaction risks');
    await chooseSelectOption(newAllergyContainer, 'Substance', 'Cashew nut specific IgE');
    await chooseSelectOption(newAllergyContainer, 'Manifestation', 'Rash');
    await inputText(newAllergyContainer, 'Comment', 'Patient experiences rash and swelling');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(omitResourceFields(allergy, ['id']));
  });

  test('Change allergies/adverse reactions status', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'AllergyIntolerance',
            params: {},
            responseBody: makeSearchSetBundle([allergy])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const allergySummaryContainer = await findByLinkIdOrLabel(
      container,
      'Adverse reaction risk summary'
    );
    await chooseSelectOption(allergySummaryContainer, 'Status', 'Inactive');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `AllergyIntolerance/${allergy.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance'
            },
            {
              name: 'name',
              valueString: 'clinicalStatus'
            },
            {
              name: 'value',
              valueCodeableConcept: {
                coding: [
                  {
                    code: 'inactive',
                    display: 'Inactive',
                    system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical'
                  }
                ]
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Clinical status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Patient experiences rash and swelling'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Change allergies/adverse reactions comment', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'AllergyIntolerance',
            params: {},
            responseBody: makeSearchSetBundle([allergy])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const allergySummaryContainer = await findByLinkIdOrLabel(
      container,
      'Adverse reaction risk summary'
    );
    await inputText(allergySummaryContainer, 'Comment', 'Changed comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `AllergyIntolerance/${allergy.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance'
            },
            {
              name: 'name',
              valueString: 'clinicalStatus'
            },
            {
              name: 'value',
              valueCodeableConcept: {
                coding: [
                  {
                    code: 'active',
                    display: 'Active',
                    system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical'
                  }
                ]
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Clinical status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance.note[0]'
            },
            {
              name: 'name',
              valueString: 'text'
            },
            {
              name: 'value',
              valueMarkdown: 'Changed comment'
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
  });

  test('Add allergies/adverse reactions comment', async () => {
    const allergyWithoutComment = omitResourceFields(allergy, ['note']);
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm
        patient={patient}
        requestDefinitions={[
          {
            urlPrefix: 'AllergyIntolerance',
            params: {},
            responseBody: makeSearchSetBundle([allergyWithoutComment])
          }
        ]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');
    const allergySummaryContainer = await findByLinkIdOrLabel(
      container,
      'Adverse reaction risk summary'
    );
    await inputText(allergySummaryContainer, 'Comment', 'Added comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.request).toStrictEqual({
      method: 'PATCH',
      url: `AllergyIntolerance/${allergy.id}`
    });
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual({
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance'
            },
            {
              name: 'name',
              valueString: 'clinicalStatus'
            },
            {
              name: 'value',
              valueCodeableConcept: {
                coding: [
                  {
                    code: 'active',
                    display: 'Active',
                    system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical'
                  }
                ]
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Clinical status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'AllergyIntolerance'
            },
            {
              name: 'name',
              valueString: 'note'
            },
            {
              name: 'value',
              valueAnnotation: {
                text: 'Added comment'
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ],
      resourceType: 'Parameters'
    });
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

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);

    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsTobaccoSmokingStatus, ['id'])
    );
  });

  test('non-SNOMED immunisations', async () => {
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

  test('SNOMED immunisations', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Immunisation');
    const vaccinesGivenToday = await findByLinkIdOrLabel(container, 'Vaccines given today');
    await chooseSelectOption(vaccinesGivenToday, 'Vaccine', 'Hepatitis A vaccine');
    await inputText(vaccinesGivenToday, 'Batch number', 'BATCH-123');
    await inputDate(vaccinesGivenToday, 'Administration date', '01/03/2026');
    await inputText(vaccinesGivenToday, 'Comment', 'Routine immunisation comment');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(immunization, ['id'])
    );
  });

  test('Height', async () => {
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

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsBodyHeight, ['id'])
    );
  });

  test('Weight', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const weightContainer = await findByLinkIdOrLabel(container, 'Weight');
    await inputText(weightContainer, 'New result', '70');
    await inputDate(weightContainer, 'New result date', '21/11/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsBodyWeight, ['id'])
    );
  });

  test('Waist circumference', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const waistCircumferenceContainer = await findByLinkIdOrLabel(container, 'Waist circumference');
    await inputText(waistCircumferenceContainer, 'New result', '90');
    await inputDate(waistCircumferenceContainer, 'New result date', '23/11/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsWaistCircumference, ['id'])
    );
  });

  test('Heart rate', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const heartRateContainer = await findByLinkIdOrLabel(container, 'Heart rate');
    await inputText(heartRateContainer, 'New result', '72');
    await inputDate(heartRateContainer, 'New result date', '04/12/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsHeartRate, ['id'])
    );
  });

  test('Heart rhythm', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const heartRhythmContainer = await findByLinkIdOrLabel(container, 'Heart rhythm');
    await checkRadioOption(heartRhythmContainer, 'New result', 'Regular heart rhythm');
    await inputDate(heartRhythmContainer, 'New result date', '03/12/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsHeartRhythm, ['id'])
    );
  });

  test('Blood pressure', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={[]} onExtractResult={onExtractResult} />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const bloodPressureContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    await inputText(bloodPressureContainer, 'Systolic', '120');
    await inputText(bloodPressureContainer, 'Diastolic', '80');
    await inputDate(bloodPressureContainer, 'Date performed', '02/12/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsBloodPressure, ['id'])
    );
  });

  test('Length/Height', async () => {
    const onExtractResult = vi.fn();
    const today = new Date();
    const fiveYearsOldBirthDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .slice(0, 10);
    const fiveYearsOldPatient = { ...patient, birthDate: fiveYearsOldBirthDate };
    const { container } = render(
      <AboriginalForm
        patient={fiveYearsOldPatient}
        requestDefinitions={[]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const lengthHeightContainer = await findByLinkIdOrLabel(container, 'Length/Height');
    await inputText(lengthHeightContainer, 'New result', '10');
    await inputDate(lengthHeightContainer, 'New result date', '20/11/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsLengthHeight, ['id'])
    );
  });

  test('Head circumference', async () => {
    const onExtractResult = vi.fn();
    const today = new Date();
    const fiveYearsOldBirthDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .slice(0, 10);
    const fiveYearsOldPatient = { ...patient, birthDate: fiveYearsOldBirthDate };
    const { container } = render(
      <AboriginalForm
        patient={fiveYearsOldPatient}
        requestDefinitions={[]}
        onExtractResult={onExtractResult}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');
    const headCircumferenceContainer = await findByLinkIdOrLabel(container, 'Head circumference');
    await inputText(headCircumferenceContainer, 'New result', '55');
    await inputDate(headCircumferenceContainer, 'New result date', '22/11/2025');

    const extractedBundle = await invokeExtract(container, onExtractResult);
    expect(extractedBundle.entry).toHaveLength(1);
    expect(extractedBundle.entry?.[0]?.resource).toStrictEqual(
      omitResourceFields(obsHeadCircumference, ['id'])
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
